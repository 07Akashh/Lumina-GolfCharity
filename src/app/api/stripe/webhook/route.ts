import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

interface SubscriptionWithLegacyFields extends Stripe.Subscription {
  current_period_end: number;
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_dummy_key_for_build'
const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2026-03-25.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  console.log(`🔔 Webhook received: ${event.type}`)

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      console.log(`🚀 Processing checkout session for User: ${userId}`)

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription

      // Map Price IDs to Tier names for the DB check constraint
      const planMapping: Record<string, string> = {
          [process.env.NEXT_PUBLIC_STRIPE_ETHEREAL_PRICE_ID!]: 'ethereal',
          [process.env.NEXT_PUBLIC_STRIPE_APEX_PRICE_ID!]: 'apex',
          [process.env.NEXT_PUBLIC_STRIPE_LUMINARY_PRICE_ID!]: 'luminary',
      }
      const planName = planMapping[subscription.items.data[0].price.id] || 'ethereal'

      const currentPeriodEnd = (subscription as SubscriptionWithLegacyFields).current_period_end 
      const safePeriodEnd = currentPeriodEnd 
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
        plan: planName,
        current_period_end: safePeriodEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      if (error) {
        console.error(`❌ Webhook Upsert Error: ${error.message}`)
        console.error('Details:', { userId, customerId, subscriptionId, planName })
      } else {
        console.log(`✅ Subscription record updated for User: ${userId} (Plan: ${planName})`)
      }

      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`📝 Syncing subscription ${subscription.id} (Status: ${subscription.status})`)

      const currentPeriodEnd = (subscription as SubscriptionWithLegacyFields).current_period_end 
      const safePeriodEnd = currentPeriodEnd 
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : new Date().toISOString()

      const { error } = await supabase.from('subscriptions').update({
        status: subscription.status,
        current_period_end: safePeriodEnd,
        updated_at: new Date().toISOString()
      }).eq('stripe_subscription_id', subscription.id)

      if (error) console.error(`❌ Webhook Update Error: ${error.message}`)
      else console.log(`✅ Subscription ${subscription.id} synced successfully.`)

      break
    }
  }

  return NextResponse.json({ received: true })
}
