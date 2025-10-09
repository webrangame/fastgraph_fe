import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/dashboard/pricing?success=true',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/dashboard/pricing?canceled=true',
};

// Plan configurations for Stripe
export const STRIPE_PLANS = {
  pro: {
    monthly: {
      priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
      amount: 4900, // $49.00 in cents
      currency: 'usd',
      interval: 'month',
    },
    annual: {
      priceId: 'price_pro_annual', // Replace with actual Stripe price ID
      amount: 46800, // $39.00 * 12 in cents
      currency: 'usd',
      interval: 'year',
    },
  },
  premium: {
    monthly: {
      priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      amount: 14900, // $149.00 in cents
      currency: 'usd',
      interval: 'month',
    },
    annual: {
      priceId: 'price_premium_annual', // Replace with actual Stripe price ID
      amount: 142800, // $119.00 * 12 in cents
      currency: 'usd',
      interval: 'year',
    },
  },
};

// Helper function to get plan configuration
export const getPlanConfig = (planName: string, isAnnual: boolean) => {
  const plan = STRIPE_PLANS[planName as keyof typeof STRIPE_PLANS];
  if (!plan) return null;
  
  return isAnnual ? plan.annual : plan.monthly;
};
