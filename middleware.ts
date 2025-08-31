import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = accessToken || refreshToken;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  console.log('Middleware Debug:', {
    pathname,
    isPublicRoute,
    accessToken: !!accessToken,
    refreshToken: !!refreshToken,
    isAuthenticated
  });

  if (isPublicRoute) {
    // If user is authenticated and trying to access login, redirect to dashboard
    if (isAuthenticated) {
      console.log('Middleware: Redirecting authenticated user from login to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes for unauthenticated users
    return NextResponse.next();
  }

  // Protected routes - check authentication
  if (!isAuthenticated) {
    console.log('Middleware: Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User is authenticated, allow access to protected routes
  console.log('Middleware: Allowing access to protected route');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
