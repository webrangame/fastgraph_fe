'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';
import { useCancelPaymentPlanMutation } from '../../../lib/api/authApi';

interface UnsubscribeButtonProps {
  subscriptionId: string;
  customerEmail: string;
  planName: string;
  planId?: string; // Add planId for the external API call
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function UnsubscribeButton({ 
  subscriptionId, 
  customerEmail, 
  planName,
  planId = '1', // Default to '1' if not provided
  onSuccess,
  onError 
}: UnsubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelType, setCancelType] = useState<'end_of_period' | 'immediate' | null>(null);
  
  // Use Redux mutation for external API call
  const [cancelPaymentPlan, { isLoading: isCancellingPlan }] = useCancelPaymentPlanMutation();

  const handleUnsubscribe = async (type: 'end_of_period' | 'immediate') => {
    setIsLoading(true);
    setCancelType(type);

    try {
      // First, cancel the Stripe subscription
      const endpoint = type === 'immediate' ? 'DELETE' : 'POST';
      const stripeResponse = await fetch('/api/stripe/unsubscribe', {
        method: endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          customerEmail,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (stripeData.error) {
        throw new Error(stripeData.error);
      }

      console.log('✅ Stripe unsubscribe successful:', stripeData);

      // Then, call the external API to cancel the payment plan
      try {
        const externalResult = await cancelPaymentPlan(planId).unwrap();
        console.log('✅ External API cancel successful:', externalResult);
      } catch (externalError) {
        console.warn('⚠️ External API cancel failed, but Stripe cancel succeeded:', externalError);
        // Don't throw error here since Stripe cancellation succeeded
      }

      onSuccess?.();
      setShowConfirmModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('❌ Unsubscribe error:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setCancelType(null);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setShowConfirmModal(true)}
        className="w-full justify-center bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
      >
        Cancel Subscription
      </Button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Subscription
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel your <strong>{planName}</strong> subscription?
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleUnsubscribe('end_of_period')}
                disabled={isLoading || isCancellingPlan}
                className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  Cancel at end of billing period
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Keep access until your current period ends
                </div>
                {isLoading && cancelType === 'end_of_period' && (
                  <div className="text-sm text-blue-600 mt-1">Processing...</div>
                )}
                {isCancellingPlan && cancelType === 'end_of_period' && (
                  <div className="text-sm text-blue-600 mt-1">Updating external systems...</div>
                )}
              </button>

              <button
                onClick={() => handleUnsubscribe('immediate')}
                disabled={isLoading || isCancellingPlan}
                className="w-full p-3 text-left border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="font-medium text-red-700 dark:text-red-400">
                  Cancel immediately
                </div>
                <div className="text-sm text-red-500 dark:text-red-400">
                  Lose access right away
                </div>
                {isLoading && cancelType === 'immediate' && (
                  <div className="text-sm text-blue-600 mt-1">Processing...</div>
                )}
                {isCancellingPlan && cancelType === 'immediate' && (
                  <div className="text-sm text-blue-600 mt-1">Updating external systems...</div>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoading || isCancellingPlan}
                className="flex-1"
              >
                Keep Subscription
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
