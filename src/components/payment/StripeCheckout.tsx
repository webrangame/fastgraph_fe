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
      // Use the provided Stripe test link
      const stripeTestUrl = 'https://buy.stripe.com/test_fZu7sEgCV4cK9qif96bMQ00';
      
      // Redirect directly to the Stripe test checkout
      window.location.href = stripeTestUrl;

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
