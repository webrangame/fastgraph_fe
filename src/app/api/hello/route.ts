import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 Hello API route called');
  
  return NextResponse.json(
    { message: 'Hello API route working', timestamp: new Date().toISOString() },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}
