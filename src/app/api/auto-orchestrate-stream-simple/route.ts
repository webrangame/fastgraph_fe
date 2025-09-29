import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const command = searchParams.get('command');

  console.log('🔗 Simple auto-orchestrate stream API called with command:', command);

  if (!command) {
    console.error('❌ No command provided');
    return NextResponse.json(
      { error: 'Command parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Create the external API URL
    const externalUrl = `https://fatgraph-prod-twu675cviq-uc.a.run.app/autoOrchestrateStreamSSE?command=${encodeURIComponent(command)}`;
    console.log('🌐 Connecting to external API:', externalUrl);
    
    // Make the request to the external API
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    console.log('📡 External API response status:', response.status);
    console.log('📡 External API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    // Return the response directly with proper headers
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to external API' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
