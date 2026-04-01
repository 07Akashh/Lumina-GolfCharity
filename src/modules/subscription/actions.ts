'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_KEY || STRIPE_KEY.includes('sk_test_') === false && STRIPE_KEY.includes('sk_live_') === false) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing or invalid in .env.local.')
}

const stripe = new Stripe(STRIPE_KEY || 'sk_test_dummy', {
  apiVersion: '2026-03-25.dahlia'
})

export async function createCheckoutSession(priceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/register?plan=${priceId}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id
    
    // Update profile
    await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/memberships?status=canceled`,
    metadata: {
      supabase_user_id: user.id,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
      },
    },
  })

  redirect(session.url!)
}

export async function createDonationSession(amount: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user?donation=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/memberships`,
    customer_email: user.email,
  })

  redirect(session.url!)
}
