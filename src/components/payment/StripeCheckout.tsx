'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';

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

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
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
          userId: '1', // TODO: Get from auth context
        }),
      });

      const { sessionId, error: sessionError } = await response.json();

      if (sessionError) {
        throw new Error(sessionError);
      }

      // Redirect to Stripe Checkout with package information
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;

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
