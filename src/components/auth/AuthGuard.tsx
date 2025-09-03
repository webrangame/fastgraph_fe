'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slice/authSlice';
import { Loader } from '../ui/Loader';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      // Check if user is authenticated (either from Redux state or cookies)
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      
      if (!user && !accessToken && !refreshToken) {
        // No authentication found, redirect to login
        router.replace('/login');
      } else if (user || accessToken || refreshToken) {
        // User is authenticated, allow access
        setIsLoading(false);
      }
    }
  }, [user, router, isHydrated]);

  // Periodic token validation check
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    const checkTokenValidity = () => {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      
      if (!accessToken && !refreshToken) {
        // No valid tokens found, redirect to login
        router.replace('/login');
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isHydrated, isLoading, router]);

  // Show loading while checking authentication or during hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // If user is authenticated, render children
  return (user || Cookies.get('access_token') || Cookies.get('refresh_token')) ? <>{children}</> : null;
}
