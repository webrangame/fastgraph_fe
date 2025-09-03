import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
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
