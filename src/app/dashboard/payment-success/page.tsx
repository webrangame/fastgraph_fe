'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { CheckCircle, CreditCard, Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { useSavePaymentPlanMutation } from '../../../../lib/api/authApi';

interface PaymentDetails {
  planName: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  stripeProductId?: string;
  stripeCustomerId?: string;
}

export default function PaymentSuccessPage() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingData, setSavingData] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const user = useSelector(selectCurrentUser);
  const [savePaymentPlan, { isLoading: isSavingPayment }] = useSavePaymentPlanMutation();

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails(sessionId);
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchPaymentDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/payment-success?session_id=${sessionId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPaymentDetails(data);
      
      // Save payment data to external API
      await savePaymentDataToAPI(data);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const savePaymentDataToAPI = async (paymentData: PaymentDetails) => {
    setSavingData(true);
    try {
      // Get the actual logged-in user ID
      const userId = user?.id || user?.email || 'unknown';
      
      // Use Stripe product ID from payment data or fallback to mapping
      const stripeProductId = paymentData.stripeProductId || getStripeProductId(paymentData.planName);
      
      // Use Stripe customer ID from payment data or fallback to generated one
      const stripeCustomerId = paymentData.stripeCustomerId || await getStripeCustomerId(paymentData.customerEmail);
      
      // Format dates for API
      const currentPeriodStart = paymentData.currentPeriodStart 
        ? new Date(paymentData.currentPeriodStart * 1000).toISOString()
        : new Date().toISOString();
      
      const currentPeriodEnd = paymentData.currentPeriodEnd 
        ? new Date(paymentData.currentPeriodEnd * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      
      const billingCycleAnchor = currentPeriodStart;

      // Determine plan duration based on the plan type
      // For now, we're only creating monthly subscriptions, but this can be extended
      const planDuration = 1; // Monthly plan duration in months
      
      const apiPayload = {
        planName: `${paymentData.planName} Plan`,
        stripeProductId: stripeProductId,
        planPrice: paymentData.amount / 100, // Convert from cents to dollars - renamed from monthlyAmount
        planDuration: planDuration, // Monthly plan duration in months
        currency: paymentData.currency.toUpperCase(),
        email: paymentData.customerEmail,
        paymentMethodId: paymentData.paymentMethodId,
        subscriptionId: paymentData.subscriptionId || '',
        status: paymentData.subscriptionStatus || 'active',
        userId: userId,
        stripeCustomerId: stripeCustomerId,
        billingCycleAnchor: billingCycleAnchor,
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false
      };

      console.log('Saving payment data to external API via Redux:', apiPayload);

      // Use Redux mutation instead of direct fetch
      const result = await savePaymentPlan(apiPayload).unwrap();
      
      console.log('Payment data saved successfully:', result);
      setDataSaved(true);
    } catch (err) {
      console.error('Error saving payment data to API:', err);
      // Don't set error state here to avoid breaking the success flow
      // The payment was successful, just the data saving failed
    } finally {
      setSavingData(false);
    }
  };

  const getStripeProductId = (planName: string): string => {
    // Map plan names to Stripe product IDs
    const productIdMap: Record<string, string> = {
      'pro': 'prod_TDpKVW74iP9lSX', // Your Pro plan product ID
      'premium': 'prod_PREMIUM_ID', // Replace with actual premium product ID
      'free': 'prod_FREE_ID', // Replace with actual free product ID
    };
    
    return productIdMap[planName.toLowerCase()] || 'prod_TDpKVW74iP9lSX';
  };

  const getStripeCustomerId = async (email: string): Promise<string> => {
    try {
      // For now, return a placeholder. In a real implementation, you might:
      // 1. Store the customer ID when creating the checkout session
      // 2. Fetch it from Stripe using the email
      // 3. Get it from your database
      return `cus_${email.replace('@', '_').replace('.', '_')}`;
    } catch (err) {
      console.error('Error getting Stripe customer ID:', err);
      return `cus_${email.replace('@', '_').replace('.', '_')}`;
    }
  };

  if (loading || savingData || isSavingPayment) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-secondary">
            {loading ? 'Processing your payment...' : 'Saving your subscription data...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Payment Error
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <Link href="/dashboard/pricing">
              <Button variant="primary">Try Again</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold theme-text-primary mb-4">
            Subscription Active! 🎉
          </h1>
          <p className="text-xl theme-text-secondary">
            Welcome to your new {paymentDetails?.planName} plan - Monthly billing active
          </p>
          {dataSaved && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                Subscription data saved successfully
              </span>
            </div>
          )}
        </div>

        {/* Payment Details Card */}
        <div className="theme-card-bg theme-border border rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold theme-text-primary mb-6 text-center">
            Payment Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b theme-border">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium theme-text-primary">Plan</span>
              </div>
              <span className="font-semibold theme-text-primary capitalize">
                {paymentDetails?.planName} Plan
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b theme-border">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium theme-text-primary">Monthly Amount</span>
              </div>
              <span className="font-semibold theme-text-primary">
                ${(paymentDetails?.amount || 0) / 100} {paymentDetails?.currency?.toUpperCase()}/month
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b theme-border">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-medium theme-text-primary">Email</span>
              </div>
              <span className="font-semibold theme-text-primary">
                {paymentDetails?.customerEmail}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b theme-border">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span className="font-medium theme-text-primary">Payment Method</span>
              </div>
              <span className="font-mono text-sm theme-text-secondary">
                {paymentDetails?.paymentMethodId}
              </span>
            </div>

            {paymentDetails?.subscriptionId && (
              <div className="flex items-center justify-between py-3 border-b theme-border">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium theme-text-primary">Subscription ID</span>
                </div>
                <span className="font-mono text-sm theme-text-secondary">
                  {paymentDetails.subscriptionId}
                </span>
              </div>
            )}

            {paymentDetails?.subscriptionStatus && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium theme-text-primary">Status</span>
                </div>
                <span className="font-semibold text-green-600 capitalize">
                  {paymentDetails.subscriptionStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="theme-card-bg theme-border border rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold theme-text-primary mb-4">
            What's Next?
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="theme-text-primary">
                Your monthly subscription is now active and ready to use
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="theme-text-primary">
                You can start creating workflows and deploying agents
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="theme-text-primary">
                You'll be billed monthly - check your email for confirmation
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="theme-text-primary">
                Manage your subscription anytime from your dashboard
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="primary" className="w-full sm:w-auto">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/workflows">
            <Button variant="secondary" className="w-full sm:w-auto">
              Create Workflow
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
