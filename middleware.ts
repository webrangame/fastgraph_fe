import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Check if tokens exist and are not expired
  let isAuthenticated = false;
  if (accessToken || refreshToken) {
    // Check if access token is expired by parsing the JWT
    if (accessToken) {
      try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        isAuthenticated = payload.exp > currentTime;
        
        if (!isAuthenticated) {
          console.log('🔴 Middleware: Access token expired');
        }
      } catch (error) {
        console.log('🔴 Middleware: Invalid access token format');
        isAuthenticated = false;
      }
    } else if (refreshToken) {
      // If no access token but refresh token exists, consider authenticated
      // The API will handle token refresh
      isAuthenticated = true;
      console.log('🟡 Middleware: Using refresh token for authentication');
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/test-stripe-direct', '/test-pricing-stripe', '/dashboard/payment-success'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // API routes that don't need middleware protection
  const isApiRoute = pathname.startsWith('/api/');
  
  // Static files and Next.js internal routes
  const isStaticFile = pathname.startsWith('/_next/') || 
                      pathname.startsWith('/favicon.ico') || 
                      pathname.startsWith('/public/') ||
                      pathname.includes('.');

  // Skip middleware for API routes and static files
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Only log middleware debug for non-API routes to reduce noise
  if (!isApiRoute) {
    console.log('🔍 Middleware Debug:', {
      pathname,
      isPublicRoute,
      isApiRoute,
      isStaticFile,
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }

  // Handle public routes
  if (isPublicRoute) {
    // If user is authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated) {
      console.log('🔄 Middleware: Redirecting authenticated user from', pathname, 'to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes for unauthenticated users
    console.log('✅ Middleware: Allowing access to public route:', pathname);
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isAuthenticated) {
    console.log('🚫 Middleware: Redirecting unauthenticated user to login from:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User is authenticated, allow access to protected routes
  console.log('✅ Middleware: Allowing access to protected route:', pathname);
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
     * - files with extensions (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
};
