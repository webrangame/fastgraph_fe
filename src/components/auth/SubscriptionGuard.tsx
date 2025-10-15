'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { useGetUserSubscriptionQuery } from '../../../lib/api/authApi';
import { Loader } from '@/components/ui/Loader';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require subscription
  const subscriptionFreeRoutes = ['/dashboard/pricing', '/dashboard/payment-success'];
  const isSubscriptionFreeRoute = subscriptionFreeRoutes.includes(pathname);

  // Fetch user subscription data
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading, 
    error: subscriptionError 
  } = useGetUserSubscriptionQuery(user?.id || '1', {
    skip: !user?.id || isSubscriptionFreeRoute // Skip if no user ID or on subscription-free routes
  });

  // Check if user has active subscription
  const hasActiveSubscription = subscriptionData && 
    subscriptionData.status === 'active' && 
    !subscriptionData.cancelAtPeriodEnd;

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !subscriptionLoading) {
      // If on subscription-free route, allow access
      if (isSubscriptionFreeRoute) {
        setIsLoading(false);
        return;
      }

      // If user has active subscription, allow access
      if (hasActiveSubscription) {
        setIsLoading(false);
        return;
      }

      // If no active subscription and not on pricing page, redirect to pricing
      if (!hasActiveSubscription && !isSubscriptionFreeRoute) {
        console.log('🔄 No active subscription found, redirecting to pricing page');
        router.replace('/dashboard/pricing');
        return;
      }

      setIsLoading(false);
    }
  }, [isHydrated, subscriptionLoading, hasActiveSubscription, isSubscriptionFreeRoute, router]);

  // Show loading while checking subscription or during hydration
  if (!isHydrated || isLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" message="Checking subscription status..." />
      </div>
    );
  }

  // If user has active subscription or on subscription-free route, render children
  return (hasActiveSubscription || isSubscriptionFreeRoute) ? <>{children}</> : null;
}
