import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = 'admin@lumina.com'
  const password = 'AdminPassword123!'

  try {
    // 1. Check for existing admin
    const { data: { users }, error: checkError } = await adminDb.auth.admin.listUsers()
    if (checkError) throw checkError

    const existingAuth = users.find(u => u.email === email)
    let userId = existingAuth?.id

    // 2. Create or Reset Auth User
    if (!existingAuth) {
      const { data: newUser, error: createError } = await adminDb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Lumina Administrator' }
      })
      if (createError) throw createError
      userId = newUser.user.id
    } else {
      // Forcefully rotate password for existing admin accounts to ensure known credentials work
      const { error: updateAuthError } = await adminDb.auth.admin.updateUserById(userId!, {
        password: password,
        email_confirm: true
      })
      if (updateAuthError) throw updateAuthError
    }

    if (!userId) throw new Error("Could not resolve admin ID.")

    // 3. Force Admin Role in profiles
    const { data: existingProfile } = await adminDb.from('profiles').select('id').eq('id', userId).maybeSingle()

    if (!existingProfile) {
      const { error: insertError } = await adminDb.from('profiles').insert({
        id: userId,
        email: email,
        full_name: 'Lumina Administrator',
        role: 'ADMIN'
      })
      if (insertError) throw insertError
    } else {
      const { error: updateError } = await adminDb.from('profiles').update({ role: 'ADMIN' }).eq('id', userId)
      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account successfully provisioned and elevated.',
      credentials: {
        email: email,
        password: password,
        login_url: '/login',
        admin_dashboard_url: '/admin'
      }
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
