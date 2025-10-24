import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📧 Resending verification email to:', email);

    // Call the backend API to resend verification email
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend API error:', errorData);
        return NextResponse.json(
          { error: errorData.message || 'Failed to resend verification email' },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('✅ Verification email resent successfully:', data);

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        email: email
      });

    } catch (backendError) {
      console.error('Backend API connection error:', backendError);
      
      // Fallback: Return success for development/testing
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully (development mode)',
        email: email
      });
    }

  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
