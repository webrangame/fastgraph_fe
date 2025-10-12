import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG, getPlanConfig } from '@/lib/stripe';

// Helper function to get detailed plan information
const getPlanDetails = (planName: string, isAnnual: boolean) => {
  const plans = {
    pro: {
      description: "Scale your agent operations with advanced features",
      credits: "25,000/month",
      agents: "25 Active Agents maximum",
      features: [
        "25 Active Agents maximum",
        "1M Tokens/month processing", 
        "8GB Memory per agent",
        "Advanced workflow orchestration",
        "Multi-level agent hierarchies",
        "Offline Agent Support",
        "Advanced Security & API",
        "Priority Feature Updates",
        "Advanced monitoring & analytics",
        "Custom MCP server integrations",
        "Email support"
      ]
    },
    premium: {
      description: "Enterprise-grade agent management for unlimited scale",
      credits: "100,000/month", 
      agents: "Unlimited Active Agents",
      features: [
        "Unlimited Active Agents",
        "5M Tokens/month processing",
        "32GB Memory per agent", 
        "Enterprise workflow management",
        "Advanced agent swarm coordination",
        "Offline Agent Support",
        "Advanced Security & API",
        "Early Access to New Features",
        "24-hour Priority Support",
        "Custom model integrations",
        "Advanced compliance features",
        "Dedicated account manager",
        "Custom SLA agreements"
      ]
    }
  };

  return plans[planName as keyof typeof plans] || {
    description: "Agent workflow plan",
    credits: "1,000/month",
    agents: "3 Active Agents maximum", 
    features: ["Basic workflow creation", "Agent node connections", "Community support"]
  };
};

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-09-30.clover',
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

    // Get detailed plan information
    const planDetails = getPlanDetails(planName, isAnnual);
    
    // Create checkout session with detailed package information
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
              description: planDetails.description,
              images: [], // You can add plan images here
              metadata: {
                features: JSON.stringify(planDetails.features),
                credits: planDetails.credits,
                agents: planDetails.agents,
              },
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
      // Add custom fields to show package details
      custom_fields: [
        {
          key: 'package_info',
          label: {
            type: 'custom',
            custom: 'Package Details',
          },
          type: 'text',
          optional: true,
        },
      ],
      // Add subscription data
      subscription_data: {
        metadata: {
          planName,
          isAnnual: isAnnual.toString(),
          features: JSON.stringify(planDetails.features),
        },
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
