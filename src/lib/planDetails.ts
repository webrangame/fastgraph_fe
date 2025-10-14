export interface PlanFeature {
  text: string;
  highlighted?: boolean;
  premium?: boolean;
}

export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: string;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  description: string;
  stripeProductId?: string;
}

export const getPlanDetails = (planName: string, isAnnual: boolean): PricingPlan => {
  const plans: Record<string, PricingPlan> = {
    free: {
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      credits: "1,000/month",
      description: "Perfect for getting started with agent workflows",
      features: [
        { text: "3 Active Agents maximum" },
        { text: "50,000 Tokens/month processing" },
        { text: "1GB Memory per agent" },
        { text: "Basic workflow creation" },
        { text: "Agent node connections" },
        { text: "Community support" },
        { text: "Basic monitoring dashboard" },
        { text: "Standard API access" }
      ],
      cta: "Get Started Free"
    },
    pro: {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 39,
      credits: "25,000/month",
      description: "Scale your agent operations with advanced features",
      popular: true,
      stripeProductId: "prod_TDpKVW74iP9lSX",
      features: [
        { text: "25 Active Agents maximum" },
        { text: "1M Tokens/month processing" },
        { text: "8GB Memory per agent" },
        { text: "Advanced workflow orchestration" },
        { text: "Multi-level agent hierarchies" },
        { text: "Offline Agent Support", highlighted: true },
        { text: "Advanced Security & API", highlighted: true },
        { text: "Priority Feature Updates", highlighted: true },
        { text: "Advanced monitoring & analytics" },
        { text: "Custom MCP server integrations" },
        { text: "Email support" }
      ],
      cta: "Start Pro Trial"
    },
    premium: {
      name: "Premium",
      monthlyPrice: 149,
      annualPrice: 119,
      credits: "100,000/month",
      description: "Enterprise-grade agent management for unlimited scale",
      features: [
        { text: "Unlimited Active Agents" },
        { text: "5M Tokens/month processing" },
        { text: "32GB Memory per agent" },
        { text: "Enterprise workflow management" },
        { text: "Advanced agent swarm coordination" },
        { text: "Offline Agent Support", highlighted: true },
        { text: "Advanced Security & API", highlighted: true },
        { text: "Early Access to New Features", highlighted: true },
        { text: "24-hour Priority Support", premium: true },
        { text: "Custom model integrations" },
        { text: "Advanced compliance features" },
        { text: "Dedicated account manager" },
        { text: "Custom SLA agreements" }
      ],
      cta: "Upgrade to Premium"
    }
  };

  return plans[planName] || {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: "1,000/month",
    description: "Agent workflow plan",
    features: [
      { text: "Basic workflow creation" },
      { text: "Agent node connections" },
      { text: "Community support" }
    ],
    cta: "Get Started"
  };
};

export const getAllPlans = (): PricingPlan[] => {
  // Hide Free package for now - only show Pro and Premium
  return ['pro', 'premium'].map(planName => getPlanDetails(planName, false));
};
