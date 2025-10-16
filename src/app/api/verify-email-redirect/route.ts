import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Backend verification link detected, redirecting to frontend:', token);

    // Get the frontend URL from environment or use localhost for development
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/verify-email?token=${token}`;

    console.log('🔗 Redirecting to frontend:', redirectUrl);

    // Redirect to the frontend verification page
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Error redirecting verification:', error);
    return NextResponse.json(
      { error: 'Failed to redirect verification' },
      { status: 500 }
    );
  }
}
