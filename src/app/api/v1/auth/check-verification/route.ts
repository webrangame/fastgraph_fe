import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual verification status check
    // This would typically:
    // 1. Query the database for the user by email
    // 2. Check if the user's email is verified
    // 3. Return the verification status

    console.log('🔍 Checking verification status for:', email);

    // For now, return a mock response
    // In production, you would check the actual database
    return NextResponse.json({
      email: email,
      verified: false, // This would come from your database
      message: 'Email verification status checked'
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
