'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';
import { selectCurrentUser } from '@/redux/slice/authSlice';

export default function TestPricingStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useSelector(selectCurrentUser);

  const handleProTrial = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user is logged in
      if (!user?.email) {
        throw new Error('User must be logged in to proceed with payment');
      }

      // Test the same API call that the pricing page makes
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: 'pro',
          isAnnual: false,
          price: 49,
          userId: user.email, // Use logged-in user's email
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle different response types from our API
      if (data.paymentLinkUrl) {
        // Use Stripe Snapbox payment link
        console.log('Using payment link:', data.paymentLinkUrl);
        setSuccess('Redirecting to payment page...');
        window.location.href = data.paymentLinkUrl;
      } else if (data.checkoutUrl) {
        // Use checkout session URL
        console.log('Using checkout session:', data.checkoutUrl);
        setSuccess('Redirecting to payment page...');
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) {
        // Fallback to regular checkout
        console.log('Using fallback checkout session:', data.sessionId);
        setSuccess('Redirecting to payment page...');
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else {
        throw new Error('No valid payment URL received from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Checkout error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Pricing Stripe Integration</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Pro Plan Test</h2>
            <p className="text-gray-600 mb-4">
              This tests the exact same API call that the pricing page makes when you click "Start Pro Trial"
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>Success:</strong> {success}
            </div>
          )}

          <Button
            onClick={handleProTrial}
            disabled={isLoading}
            className="w-full justify-center"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Start Pro Trial</span>
              </div>
            )}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Details:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Plan: Pro</li>
              <li>• Price: $49/month</li>
              <li>• User Email: {user?.email || 'Not logged in'}</li>
              <li>• API Endpoint: /api/stripe/create-checkout-session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
