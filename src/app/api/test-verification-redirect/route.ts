import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    
    // Generate a test token that simulates what the backend would send
    const testToken = `e5da920e37512f196a38c85a4c5209e3f5be5f646fa432bb8711b496d05fb2f0`;
    
    // Get the frontend URL
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Simulate the backend's verification link (what's currently broken)
    const backendVerificationUrl = `https://jobaapi.hattonn.com/verify-email?token=${testToken}`;
    
    // The correct frontend verification link
    const frontendVerificationUrl = `${frontendUrl}/verify-email?token=${testToken}`;
    
    // Our redirect endpoint (if we had control over the backend)
    const redirectEndpoint = `${frontendUrl}/api/verify-email-redirect?token=${testToken}`;

    console.log('🧪 Test verification URLs generated for:', email);

    return NextResponse.json({
      message: 'Test verification URLs generated',
      email: email,
      token: testToken,
      urls: {
        // This is what the backend currently generates (broken)
        backendVerificationUrl: backendVerificationUrl,
        // This is what it should generate (correct)
        frontendVerificationUrl: frontendVerificationUrl,
        // This is our redirect solution
        redirectEndpoint: redirectEndpoint
      },
      instructions: {
        problem: 'Backend generates verification links pointing to itself instead of frontend',
        solution: 'Backend needs to be configured to generate frontend URLs',
        workaround: 'Use redirect endpoint to handle backend verification links'
      }
    });

  } catch (error) {
    console.error('Error generating test verification URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate test URLs' },
      { status: 500 }
    );
  }
}
