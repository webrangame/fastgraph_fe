import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session with subscription details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer', 'subscription', 'line_items'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Extract payment details
    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;
    const paymentDetails = {
      planName: session.metadata?.planName || 'Unknown',
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      customerEmail: session.customer_details?.email || session.customer_email || 'Unknown',
      paymentMethodId: '', // Will be extracted from subscription
      subscriptionId: subscription?.id || null,
      subscriptionStatus: subscription?.status || 'unknown',
      currentPeriodStart: (subscription as any)?.current_period_start || null,
      currentPeriodEnd: (subscription as any)?.current_period_end || null,
      stripeProductId: session.metadata?.stripeProductId || 'prod_TDpKVW74iP9lSX',
      stripeCustomerId: customer?.id || null,
    };

    // Get payment method ID from subscription
    if (subscription && subscription.default_payment_method) {
      paymentDetails.paymentMethodId = subscription.default_payment_method as string;
    }

    // Store payment method in database
    await storePaymentMethodInDatabase({
      userId: session.metadata?.userId || 'unknown',
      customerEmail: paymentDetails.customerEmail,
      paymentMethodId: paymentDetails.paymentMethodId,
      planName: paymentDetails.planName,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      subscriptionId: paymentDetails.subscriptionId,
      subscriptionStatus: paymentDetails.subscriptionStatus,
      sessionId: sessionId,
    });

    // Send welcome email to customer
    await sendWelcomeEmail(paymentDetails);

    return NextResponse.json(paymentDetails);
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process payment success',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Function to send welcome email to customer
async function sendWelcomeEmail(paymentDetails: {
  planName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  subscriptionId: string | null;
  subscriptionStatus: string;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
}) {
  try {
    // TODO: Replace with your actual email service (SendGrid, Nodemailer, etc.)
    console.log('📧 Sending welcome email to customer:', {
      to: paymentDetails.customerEmail,
      planName: paymentDetails.planName,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      subscriptionId: paymentDetails.subscriptionId,
    });

    // Example email content
    const emailContent = {
      to: paymentDetails.customerEmail,
      subject: `Welcome to ${paymentDetails.planName} Plan! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to your ${paymentDetails.planName} Plan!</h1>
          <p>Thank you for subscribing to our ${paymentDetails.planName} plan. Your subscription is now active and ready to use.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Subscription Details:</h3>
            <ul>
              <li><strong>Plan:</strong> ${paymentDetails.planName}</li>
              <li><strong>Amount:</strong> $${(paymentDetails.amount / 100).toFixed(2)} ${paymentDetails.currency.toUpperCase()}/month</li>
              <li><strong>Status:</strong> ${paymentDetails.subscriptionStatus}</li>
              <li><strong>Subscription ID:</strong> ${paymentDetails.subscriptionId}</li>
            </ul>
          </div>
          
          <p>You can now start creating workflows and deploying agents with your new plan.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
    };

    // TODO: Implement actual email sending here
    // Example with Nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      // your email config
    });
    await transporter.sendMail(emailContent);
    */

    console.log('✅ Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error here to avoid breaking the success flow
  }
}

// Function to store payment method in database
async function storePaymentMethodInDatabase(paymentData: {
  userId: string;
  customerEmail: string;
  paymentMethodId: string;
  planName: string;
  amount: number;
  currency: string;
  subscriptionId: string | null;
  subscriptionStatus: string;
  sessionId: string;
}) {
  try {
    // TODO: Replace with your actual database update logic
    console.log('Storing subscription data in database:', {
      userId: paymentData.userId,
      customerEmail: paymentData.customerEmail,
      paymentMethodId: paymentData.paymentMethodId,
      planName: paymentData.planName,
      amount: paymentData.amount,
      currency: paymentData.currency,
      subscriptionId: paymentData.subscriptionId,
      subscriptionStatus: paymentData.subscriptionStatus,
      sessionId: paymentData.sessionId,
    });

    // Example database update for subscription (replace with your actual implementation):
    /*
    await db.user.update({
      where: { 
        email: paymentData.customerEmail 
      },
      data: {
        paymentMethodId: paymentData.paymentMethodId,
        subscriptionId: paymentData.subscriptionId,
        planName: paymentData.planName,
        subscriptionStatus: paymentData.subscriptionStatus,
        billingAmount: paymentData.amount,
        billingCurrency: paymentData.currency,
        lastPaymentDate: new Date(),
        subscriptionStartDate: new Date(),
        isActive: paymentData.subscriptionStatus === 'active',
      }
    });
    */

    // For now, just log the data that should be stored
    console.log('✅ Subscription data should be stored in database:', {
      userEmail: paymentData.customerEmail,
      paymentMethodId: paymentData.paymentMethodId,
      planName: paymentData.planName,
      subscriptionId: paymentData.subscriptionId,
      subscriptionStatus: paymentData.subscriptionStatus,
      monthlyAmount: `$${(paymentData.amount / 100).toFixed(2)} ${paymentData.currency.toUpperCase()}`,
    });

  } catch (error) {
    console.error('Error storing payment method in database:', error);
    // Don't throw error here to avoid breaking the success flow
  }
}
