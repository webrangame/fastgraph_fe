'use client';

import { useEffect, useRef } from 'react';

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
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Stripe Buy Button script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.head.appendChild(script);

    // Create the Stripe Buy Button element
    const createStripeButton = () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = `
          <stripe-buy-button
            buy-button-id="buy_btn_1SHNnG55WOHFHUyZpLGsN1tP"
            publishable-key="pk_test_51SHNbP55WOHFHUyZbt1WkvQn6H8ujukPVi0OjSKtRXilJnBSFvsIauSQJgOznmHynBpjPNXu4FEP1eIJfKdXOj9w00OZSRc99F"
          >
            ${children || `${planName} Plan`}
          </stripe-buy-button>
        `;
      }
    };

    // Wait for script to load then create button
    script.onload = createStripeButton;

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [planName, children]);

  return (
    <div 
      ref={buttonRef}
      className={className}
    />
  );
}
