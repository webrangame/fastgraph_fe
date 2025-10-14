'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';
import { selectCurrentUser } from '@/redux/slice/authSlice';

interface StripeCheckoutProps {
  planName: string;
  isAnnual: boolean;
  price: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function StripeCheckout({ 
  planName, 
  isAnnual, 
  price, 
  onSuccess, 
  onError, 
  className = '',
  children 
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectCurrentUser);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Check if user is logged in
      if (!user?.email) {
        throw new Error('User must be logged in to proceed with payment');
      }

      // Create checkout session with package information
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          isAnnual,
          price,
          userId: user.email, // Use logged-in user's email
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle different response types from our API
      if (data.paymentLinkUrl) {
        // Use Stripe Snapbox payment link
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
        throw new Error('No valid payment URL received from server');
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Checkout error:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4" />
          <span>{children || `${planName} Plan`}</span>
        </div>
      )}
    </Button>
  );
}
