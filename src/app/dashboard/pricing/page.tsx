'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Check, Star, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StripeCheckout } from '@/components/payment/StripeCheckout';
import { UnsubscribeButton } from '@/components/payment/UnsubscribeButton';
import { getAllPlans, PricingPlan } from '@/lib/planDetails';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { useGetUserSubscriptionQuery } from '../../../../lib/api/authApi';
import './pricing.css';

const plans: PricingPlan[] = getAllPlans();

const features = [
  {
    icon: "🤖",
    title: "Agent Lifecycle Management",
    description: "Complete control over agent creation, deployment, and monitoring"
  },
  {
    icon: "🔗",
    title: "Dynamic Agent Networks",
    description: "Build complex multi-agent workflows with intelligent routing"
  },
  {
    icon: "⚡",
    title: "Real-time Monitoring",
    description: "Track performance, usage, and health across your agent fleet"
  },
  {
    icon: "🔧",
    title: "MCP Integration",
    description: "Seamless integration with Model Context Protocol servers"
  }
];

const faqs = [
  {
    question: "What are compute credits?",
    answer: "Compute credits are our unified measurement for agent processing power, including CPU time, memory usage, and token processing."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing."
  },
  {
    question: "Are there any limits on workflows?",
    answer: "The only limits are on active agents and compute resources. You can create unlimited workflows within your plan's agent limits."
  },
  {
    question: "Do you offer free trials?",
    answer: "Yes! Pro and Premium plans include a 14-day free trial with full access to all features."
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const user = useSelector(selectCurrentUser);
  
  // Use Redux query to fetch user subscription
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading, 
    error: subscriptionError 
  } = useGetUserSubscriptionQuery(user?.id || '1', {
    skip: !user?.id // Skip if no user ID
  });
  
  // Transform API data to match our expected format
  const currentSubscription = subscriptionData ? {
    id: subscriptionData.subscriptionId || subscriptionData.id,
    status: subscriptionData.status || 'active',
    planName: subscriptionData.planName?.toLowerCase().replace(/\s+plan$/i, '') || 'pro', // Remove " Plan" suffix and convert to lowercase
    customerEmail: subscriptionData.email || user?.email,
    currentPeriodEnd: subscriptionData.currentPeriodEnd ? 
      Math.floor(new Date(subscriptionData.currentPeriodEnd).getTime() / 1000) : 
      Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    stripeProductId: subscriptionData.stripeProductId,
    stripeCustomerId: subscriptionData.stripeCustomerId,
  } : null;

  console.log(subscriptionData , "subscriptionData")
  // Log subscription data for debugging
  useEffect(() => {
    if (subscriptionData) {
      console.log('🔍 Subscription data received:', subscriptionData);
      console.log('🔍 Transformed subscription:', currentSubscription);
    }
    if (subscriptionError) {
      console.error('❌ Error fetching subscription:', subscriptionError);
    }
  }, [subscriptionData, subscriptionError, currentSubscription]);

  // Handle URL parameters for payment success/cancel
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success && sessionId) {
      setPaymentSuccess('Payment successful! Your subscription is now active.');
      setPaymentError(null);
    } else if (canceled) {
      setPaymentError('Payment was canceled. You can try again anytime.');
      setPaymentSuccess(null);
    }
  }, [searchParams]);

  const handlePaymentSuccess = (planName: string) => {
    setPaymentSuccess(`Successfully subscribed to ${planName} plan!`);
    setPaymentError(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(null);
  };

  const handleUnsubscribeSuccess = () => {
    setPaymentSuccess('Your subscription has been cancelled successfully.');
    setPaymentError(null);
  };

  const handleUnsubscribeError = (error: string) => {
    setPaymentError(`Failed to cancel subscription: ${error}`);
    setPaymentSuccess(null);
  };

  const renderPlanButton = (plan: PricingPlan) => {
    // Check if this is the user's current plan
    const isCurrentPlan = currentSubscription && 
      currentSubscription.planName.toLowerCase() === plan.name.toLowerCase();
    
    // Debug logging
    console.log('Plan comparison:', {
      planName: plan.name,
      currentPlanName: currentSubscription?.planName,
      isCurrentPlan,
      subscriptionData: subscriptionData?.planName
    });

    if (plan.name === 'Free') {
      return (
        <Button
          variant="secondary"
          className="pricing-button w-full justify-center"
        >
          {plan.cta}
        </Button>
      );
    }

    // If this is the current plan, show unsubscribe button
    if (isCurrentPlan) {
      return (
        <UnsubscribeButton
          subscriptionId={subscriptionData?.subscriptionId || currentSubscription.id}
          customerEmail={currentSubscription.customerEmail}
          planName={plan.name}
          planId={subscriptionData?.id}
          onSuccess={handleUnsubscribeSuccess}
          onError={handleUnsubscribeError}
        />
      );
    }

    //console

    // Otherwise show the normal subscribe button
    return (
      <StripeCheckout
        planName={plan.name.toLowerCase()}
        isAnnual={isAnnual}
        price={isAnnual ? plan.annualPrice : plan.monthlyPrice}
        onSuccess={() => handlePaymentSuccess(plan.name)}
        onError={handlePaymentError}
        className="pricing-button w-full justify-center"
      >
        {plan.cta}
      </StripeCheckout>
    );
  };

  return (
    <div className="min-h-screen theme-bg">
      {/* Header Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold theme-text-primary mb-6">
            Choose Your Agent Plan
          </h1>
          <p className="text-lg md:text-xl theme-text-secondary mb-8 max-w-3xl mx-auto">
            Scale your multi-agent workflows from simple automation to enterprise-grade orchestration
          </p>

          {/* Payment Status Messages */}
          {paymentSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <Check className="w-5 h-5" />
                <span className="font-medium">{paymentSuccess}</span>
              </div>
            </div>
          )}

          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <span className="font-medium">{paymentError}</span>
              </div>
            </div>
          )}

          {/* Current Subscription Status */}
          {user?.email && (
            <div className="mb-6">
              {subscriptionLoading ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Checking your subscription status...</span>
                  </div>
                </div>
              ) : currentSubscription ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      You're currently subscribed to the {currentSubscription.planName} plan
                    </span>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Status: {currentSubscription.status} • 
                    Next billing: {new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <span className="font-medium">No active subscription found</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Toggle */}
          <div className="toggle-container inline-flex items-center theme-input-bg theme-border border rounded-full p-1 mb-12">
            <button
              onClick={() => setIsAnnual(false)}
              className={`toggle-button px-6 py-3 rounded-full ${
                !isAnnual 
                  ? 'active theme-card-bg theme-text-primary' 
                  : 'theme-text-secondary theme-hover-bg'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`toggle-button px-6 py-3 rounded-full relative ${
                isAnnual 
                  ? 'active theme-card-bg theme-text-primary' 
                  : 'theme-text-secondary theme-hover-bg'
              }`}
            >
              Annual
              <span className="savings-badge absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:gap-8 lg:gap-10 lg:grid-cols-3 pt-6">
            {plans.map((plan, index) => {
              // Check if this is the user's current plan
              const isCurrentPlan = currentSubscription && 
                currentSubscription.planName.toLowerCase() === plan.name.toLowerCase();
              
              return (
                <div
                  key={plan.name}
                  className={`pricing-card relative theme-card-bg rounded-2xl theme-shadow ${
                    isCurrentPlan
                      ? 'current-plan scale-105 border-4 border-green-600 lg:scale-110'
                      : plan.popular 
                        ? 'popular-card scale-105 border-4 border-blue-600 lg:scale-110' 
                        : 'theme-border border'
                  }`}
                >
                {isCurrentPlan && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-1 whitespace-nowrap shadow-lg">
                      <Check className="w-4 h-4" />
                      Current Plan
                    </div>
                  </div>
                )}
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-1 whitespace-nowrap shadow-lg">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold theme-text-primary mb-2">{plan.name}</h3>
                    <p className="theme-text-secondary mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold theme-text-primary">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="theme-text-secondary">/month</span>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-green-600 font-semibold">
                          Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="theme-input-bg theme-text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {plan.credits} compute credits
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className={`feature-item flex items-start gap-3 ${
                          feature.highlighted || feature.premium 
                            ? 'feature-highlight -mx-2 px-2 py-2 rounded-lg' 
                            : ''
                        }`}
                      >
                        <Check 
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            feature.premium 
                              ? 'text-yellow-500' 
                              : feature.highlighted 
                                ? 'text-blue-600' 
                                : 'text-green-600'
                          }`} 
                        />
                        <span 
                          className={`theme-text-primary ${
                            feature.highlighted || feature.premium ? 'font-semibold' : ''
                          }`}
                        >
                          {feature.text}
                          {feature.premium && <Sparkles className="inline w-4 h-4 ml-1 text-yellow-500" />}
                        </span>
                      </div>
                    ))}
                  </div>

                  {renderPlanButton(plan)}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto max-w-6xl mt-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="feature-grid-item text-center">
                <div className="emoji text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold theme-text-primary mb-2">{feature.title}</h3>
                <p className="theme-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="mx-auto max-w-4xl mt-20">
          <div className="theme-card-bg theme-border border rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold theme-text-primary mb-4">Need Something More?</h3>
            <p className="theme-text-secondary mb-6 max-w-2xl mx-auto">
              Enterprise customers can customize their plan with dedicated infrastructure, 
              advanced compliance features, and priority support.
            </p>
            <Button variant="primary">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl mt-20">
          <div className="theme-input-bg theme-border border rounded-2xl p-8">
            <h3 className="text-2xl font-bold theme-text-primary mb-8 text-center">Frequently Asked Questions</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item space-y-3">
                  <h4 className="text-lg font-semibold theme-text-primary">{faq.question}</h4>
                  <p className="theme-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}