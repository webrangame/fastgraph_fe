'use client';

import { useEffect, useState } from 'react';

export default function TestStripeDirect() {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStripe = async () => {
      try {
        // Load Stripe.js
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
          setStripeLoaded(true);
        };
        script.onerror = () => {
          setError('Failed to load Stripe.js');
        };
        document.head.appendChild(script);
      } catch (err) {
        setError('Error loading Stripe: ' + (err as Error).message);
      }
    };

    loadStripe();
  }, []);

  const testStripeConnection = () => {
    if (typeof window !== 'undefined' && (window as any).Stripe) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      console.log('Stripe instance created:', stripe);
      console.log('Publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    } else {
      setError('Stripe not loaded or window not available');
    }
  };

  const testCheckoutSession = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: 'pro',
          isAnnual: false,
          userId: 'test@example.com'
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);
      
      if (data.paymentLinkUrl) {
        // Redirect to Stripe Snapbox payment link
        console.log('Using payment link:', data.paymentLinkUrl);
        window.location.href = data.paymentLinkUrl;
      } else if (data.checkoutUrl) {
        // Use checkout session URL
        console.log('Using checkout session:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else if (data.sessionId) {
        // Fallback to regular checkout
        console.log('Using fallback checkout session:', data.sessionId);
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else {
        setError('Failed to create payment session: ' + JSON.stringify(data));
      }
    } catch (err) {
      setError('Error creating checkout session: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Stripe Direct Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Publishable Key:</strong> {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT SET'}</p>
              <p><strong>App URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Stripe Status</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Stripe Loaded:</strong> {stripeLoaded ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Window Available:</strong> {typeof window !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-x-4">
            <button
              onClick={testStripeConnection}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!stripeLoaded}
            >
              Test Stripe Connection
            </button>
            
            <button
              onClick={testCheckoutSession}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Checkout Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
