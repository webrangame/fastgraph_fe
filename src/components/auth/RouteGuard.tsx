'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slice/authSlice';
import { Loader } from '../ui/Loader';
import Cookies from 'js-cookie';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      // Check if user is authenticated (either from Redux state or cookies)
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      const isAuthenticated = user || accessToken || refreshToken;

      console.log('RouteGuard Debug:', {
        pathname,
        isPublicRoute,
        user: !!user,
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        isAuthenticated
      });

      if (isPublicRoute) {
        // If on public route (like login) and user is authenticated, redirect to dashboard
        if (isAuthenticated) {
          console.log('Redirecting authenticated user from public route to dashboard');
          router.replace('/dashboard');
        } else {
          // Allow access to public routes for unauthenticated users
          console.log('Allowing access to public route for unauthenticated user');
          setIsLoading(false);
        }
      } else {
        // If on protected route and user is not authenticated, redirect to login
        if (!isAuthenticated) {
          console.log('Redirecting unauthenticated user from protected route to login');
          router.replace('/login');
        } else {
          // User is authenticated, allow access to protected routes
          console.log('Allowing access to protected route for authenticated user');
          setIsLoading(false);
        }
      }
    }
  }, [user, router, isHydrated, pathname, isPublicRoute]);

  // Show loading while checking authentication or during hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // Render children based on route type and authentication status
  if (isPublicRoute) {
    // For public routes, render children (login page)
    return <>{children}</>;
  } else {
    // For protected routes, only render if authenticated
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    return (user || accessToken || refreshToken) ? <>{children}</> : null;
  }
}
