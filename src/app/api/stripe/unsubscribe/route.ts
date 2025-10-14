import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, customerEmail } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Cancelling subscription:', {
      subscriptionId,
      customerEmail,
    });

    // Cancel the subscription at the end of the current period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('✅ Subscription cancelled at period end:', {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: (subscription as any).current_period_end,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: (subscription as any).current_period_end,
      },
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, customerEmail } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Immediately cancelling subscription:', {
      subscriptionId,
      customerEmail,
    });

    // Cancel the subscription immediately
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    console.log('✅ Subscription cancelled immediately:', {
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription has been cancelled immediately',
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
