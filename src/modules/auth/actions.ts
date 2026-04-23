'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations'

import { setUserMetaServer, clearUserMetaServer } from '@/lib/user-meta'

export async function login(formData: FormData) {
  const supabase = createClient()

  const emailRaw = formData.get('email') as string
  const passwordRaw = formData.get('password') as string

  // Validation
  const validated = loginSchema.safeParse({ email: emailRaw, password: passwordRaw })
  if (!validated.success) return { error: 'Invalid email or password format.' }

  const { email, password } = validated.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // COOKIE SYNC: Fetch minimal profile for instant UI
  let redirectPath = '/user'
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, subscriptions(status)')
      .eq('id', data.user.id)
      .single()

    if (profile) {
      if (profile.role === 'ADMIN') redirectPath = '/admin'
      
      await setUserMetaServer({
        name: profile.full_name || 'Philanthropist',
        role: profile.role || 'MEMBER',
        avatar: profile.avatar_url || undefined,
        isActive: (profile.subscriptions as { status: string } | null)?.status === 'active'
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect(redirectPath)
}

import { sendEmail } from '@/lib/resend'

export async function signup(formData: FormData) {
  const supabase = createClient()

  const values = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
    charityId: formData.get('charityId') as string,
    countryId: formData.get('countryId') as string,
    region: formData.get('region') as string,
    contributionPercentage: formData.get('contributionPercentage') as string,
  }

  // Validation
  const validated = signupSchema.safeParse(values)
  if (!validated.success) {
    console.error('❌ Validation Failure Details:', validated.error.flatten())
    return { error: validated.error.issues[0]?.message || 'Invalid registration details.' }
  }

  const { email, password, fullName, charityId, countryId, region, contributionPercentage } = validated.data

  console.log('🚀 Registration Attempt for:', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      data: {
        full_name: fullName,
        charity_id: charityId || null,
        country_id: countryId || null,
        region,
        contribution_percentage: contributionPercentage ? parseInt(contributionPercentage) : 20,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
     // Initial cookie metadata for new users
     await setUserMetaServer({
        name: fullName,
        role: 'MEMBER',
        isActive: false // Usually starts as inactive until payment
     })
  }

  if (!data.session) {
    revalidatePath('/verify-email', 'page')
    redirect('/verify-email')
  }

  // Send Welcome Email (via Resend) - Do NOT await this so we don't delay the user redirect
  sendEmail({
    to: email,
    subject: 'Welcome to Golf Charity Platform!',
    html: `<h1>Hi ${fullName},</h1><p>Thanks for joining the premium golf platform that makes an impact. Get started by adding your scores to the dashboard!</p>`
  }).catch(e => console.error('📧 Welcome email failed:', e))

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  await clearUserMetaServer()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized Access' }

  // Check if the user has a ghost account (authenticated but missing public.profiles row)
  const { data: existingProfile } = await supabase.from('profiles').select('id, role').eq('id', user.id).maybeSingle()

  // Extract optional fields & toggles for Auth Metadata
  const fullName = formData.get('fullName') as string
  const bio = formData.get('bio') as string
  const phone = formData.get('phone') as string
  const commAlerts = formData.get('commAlerts') === 'true'
  const commWeekly = formData.get('commWeekly') === 'true'
  const commNetwork = formData.get('commNetwork') === 'true'
  const rawCharityPct = parseInt(formData.get('charityPercent') as string)
  const charityPercent = isNaN(rawCharityPct) ? 10 : Math.max(10, Math.min(100, rawCharityPct))

  // Update Auth Metadata for bio, phone, and communication toggles
  const { error: metaError } = await supabase.auth.updateUser({
    data: { 
      full_name: fullName,
      bio: bio || '',
      phone: phone || '',
      comm_alerts: commAlerts,
      comm_weekly: commWeekly,
      comm_network: commNetwork,
      charity_percent: charityPercent
    }
  })
  if (metaError) return { error: `Metadata synchronization failed: ${metaError.message}` }
  
  if (!existingProfile) {
    // Self-heal: Create the missing profile node
    const adminDb = createAdminClient()
    
    await adminDb.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: fullName || user.email?.split('@')[0],
      role: 'USER',
      phone: phone || null,
      contribution_percentage: charityPercent
    })
  } else {
    // Normal update - strictly mapped to database columns
    const updates: {
      full_name?: string;
      phone?: string;
      contribution_percentage?: number;
      updated_at: string;
      bio?: string;
    } = {
      updated_at: new Date().toISOString(),
      full_name: fullName,
      phone: phone || undefined,
      contribution_percentage: charityPercent
    }

    // Attempt DB update
    const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (updateError) {
      console.warn('⚠️ Standard Profile Update Warning (expected if columns missing):', updateError.message)
      // We continue because we already saved the crucial bits to Auth Metadata above
    }

    // Try updating bio separately so it doesn't block the whole save if column is missing
    if (bio) {
      await supabase.from('profiles').update({ bio }).eq('id', user.id)
    }
  }

  // SYNC COOKIE
  const { data: profile } = await supabase.from('profiles').select('*, subscriptions(status)').eq('id', user.id).single()
  if (profile) {
    await setUserMetaServer({
      name: profile.full_name || 'Philanthropist',
      role: profile.role || 'MEMBER',
      avatar: profile.avatar_url || undefined,
      isActive: (profile.subscriptions as { status: string } | null)?.status === 'active',
      contributionPercentage: profile.contribution_percentage
    })
  }

  revalidatePath('/user', 'layout')
  revalidatePath('/user/settings', 'page')
  
  return { success: true }
}

export async function forgotPassword(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  // Validation
  const validated = forgotPasswordSchema.safeParse({ email })
  if (!validated.success) return { error: 'Invalid email address.' }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  const validated = resetPasswordSchema.safeParse({ password, confirmPassword })
  if (!validated.success) return { error: validated.error.issues[0].message }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  
  revalidatePath('/', 'layout')
  redirect('/user')
}
