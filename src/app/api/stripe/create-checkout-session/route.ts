import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG, getPlanConfig } from '@/lib/stripe';

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { planName, isAnnual, userId } = await request.json();

    if (!planName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: planName and userId' },
        { status: 400 }
      );
    }

    // Get plan configuration
    const planConfig = getPlanConfig(planName, isAnnual);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
              description: `Agent workflow plan - ${isAnnual ? 'Annual' : 'Monthly'} billing`,
            },
            unit_amount: planConfig.amount,
            recurring: {
              interval: planConfig.interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${STRIPE_CONFIG.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      customer_email: userId, // You might want to get this from user data
      metadata: {
        planName,
        isAnnual: isAnnual.toString(),
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
