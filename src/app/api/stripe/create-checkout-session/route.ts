import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG, getPlanConfig } from '@/lib/stripe';
import { getPlanDetails } from '@/lib/planDetails';

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { planName, isAnnual, userId } = await request.json();

    console.log('🔍 Stripe API Debug:', { planName, isAnnual, userId, userIdType: typeof userId });

    if (!planName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: planName and userId' },
        { status: 400 }
      );
    }

    // Ensure userId is a valid email format
    let customerEmail = userId;
    if (!userId.includes('@')) {
      customerEmail = `${userId}@example.com`;
      console.log('📧 Converting userId to email:', { original: userId, converted: customerEmail });
    }

    // Get plan configuration
    const planConfig = getPlanConfig(planName, isAnnual);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    // Get detailed plan information
    const planDetails = getPlanDetails(planName, isAnnual);
    
    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/dashboard/pricing?canceled=true`;
    
    console.log('🔗 Redirect URLs:', { baseUrl, successUrl, cancelUrl });

    // Create a subscription checkout session for monthly billing
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: planDetails.stripeProductId || 'prod_TEAZ6kajZfAx3N', // Use plan-specific product ID or fallback
            recurring: {
              interval: 'month', // Monthly billing
            },
            unit_amount: planConfig.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription', // Subscription mode for monthly billing
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          planName,
          isAnnual: isAnnual.toString(),
          userId,
        },
      },
      metadata: {
        planName,
        isAnnual: isAnnual.toString(),
        userId,
      },
    });

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
      type: 'subscription_checkout'
    });
  } catch (error) {
    console.error('Error creating payment link, trying fallback checkout session:', error);
    
    try {
      // Get request data again for fallback
      const { planName: fallbackPlanName, isAnnual: fallbackIsAnnual, userId: fallbackUserId } = await request.json();
      const fallbackPlanConfig = getPlanConfig(fallbackPlanName, fallbackIsAnnual);
      
      if (!fallbackPlanConfig) {
        throw new Error('Invalid plan configuration for fallback');
      }
      
      // Ensure userId is a valid email format for fallback
      let fallbackCustomerEmail = fallbackUserId;
      if (!fallbackUserId.includes('@')) {
        fallbackCustomerEmail = `${fallbackUserId}@example.com`;
      }
      
      // Get the base URL for fallback redirects
      const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const fallbackSuccessUrl = `${fallbackBaseUrl}/dashboard/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const fallbackCancelUrl = `${fallbackBaseUrl}/dashboard/pricing?canceled=true`;
      
      console.log('🔗 Fallback Redirect URLs:', { fallbackBaseUrl, fallbackSuccessUrl, fallbackCancelUrl });

      // Fallback: Create a regular checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${fallbackPlanName.charAt(0).toUpperCase() + fallbackPlanName.slice(1)} Plan`,
                description: `Test ${fallbackPlanName} plan - $${(fallbackPlanConfig.amount / 100).toFixed(2)}`,
              },
              unit_amount: fallbackPlanConfig.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: fallbackSuccessUrl,
        cancel_url: fallbackCancelUrl,
        payment_method_types: ['card'],
        customer_email: fallbackCustomerEmail,
      });

      return NextResponse.json({ 
        sessionId: session.id,
        checkoutUrl: session.url,
        type: 'checkout_session'
      });
    } catch (fallbackError) {
      console.error('Fallback checkout session also failed:', fallbackError);
      
      return NextResponse.json(
        { 
          error: 'Failed to create payment session',
          details: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'
        },
        { status: 500 }
      );
    }
  }
}
