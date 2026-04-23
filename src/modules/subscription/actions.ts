'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing in environment.')
}

const stripe = new Stripe(STRIPE_KEY || 'sk_test_dummy', {
  apiVersion: '2026-03-25.dahlia',
})

/**
 * Creates a Stripe Checkout session and redirects to it.
 *
 * IMPORTANT: This action uses `redirect()` at the top level (not inside try/catch),
 * which is the correct Next.js pattern. Callers must NOT wrap this in try/catch
 * unless they re-throw NEXT_REDIRECT errors.
 */
export async function createCheckoutSession(priceId: string): Promise<{ error: string } | never> {
  if (!priceId) return { error: 'No price ID provided.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/register?plan=${priceId}`)
  }

  // Fetch or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  let sessionUrl: string

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/memberships?status=canceled`,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    })

    if (!session.url) return { error: 'Stripe did not return a checkout URL.' }
    sessionUrl = session.url
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown Stripe error.'
    console.error('❌ Stripe Checkout Error:', msg)
    return { error: `Payment gateway error: ${msg}` }
  }

  // redirect() must be called OUTSIDE try/catch — it throws a special NEXT_REDIRECT error
  redirect(sessionUrl)
}

export async function createDonationSession(amount: number): Promise<{ error: string } | never> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let sessionUrl: string

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Independent Foundation Donation',
              description: 'One-off contribution to your selected charity.',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user?donation=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/memberships`,
      customer_email: user.email,
    })

    if (!session.url) return { error: 'Stripe did not return a checkout URL.' }
    sessionUrl = session.url
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown Stripe error.'
    console.error('❌ Stripe Donation Error:', msg)
    return { error: `Payment gateway error: ${msg}` }
  }

  redirect(sessionUrl)
}

