import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Generate a test verification token
    const testToken = `test_verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔑 Generated test verification token:', testToken, 'for email:', email);

    return NextResponse.json({
      message: 'Test verification token generated',
      email: email,
      token: testToken,
      verificationUrl: `http://localhost:3000/verify-email?token=${testToken}`
    });

  } catch (error) {
    console.error('Error generating test token:', error);
    return NextResponse.json(
      { error: 'Failed to generate test token' },
      { status: 500 }
    );
  }
}
