'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { Loader } from '@/components/ui/Loader';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      // Check if user is authenticated (either from Redux state or cookies)
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      
      if (user || accessToken || refreshToken) {
        // User is authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/login');
      }
    }
  }, [user, router, isHydrated]);

  // Show loading while determining redirect or during hydration
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" message="Loading..." />
    </div>
  );
}