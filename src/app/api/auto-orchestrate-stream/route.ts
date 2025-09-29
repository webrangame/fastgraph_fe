import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const command = searchParams.get('command');

  console.log('🔗 Auto-orchestrate stream API called with command:', command);

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

    // Create a readable stream to proxy the SSE data
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          console.log('❌ No response body reader available');
          controller.close();
          return;
        }

        let isClosed = false;

        const pump = async () => {
          try {
            while (!isClosed) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('📡 Stream ended - closing controller');
                if (!isClosed) {
                  controller.close();
                  isClosed = true;
                }
                break;
              }
              
              if (!isClosed) {
                controller.enqueue(value);
              }
            }
          } catch (error) {
            console.error('Stream error:', error);
            if (!isClosed) {
              controller.error(error);
              isClosed = true;
            }
          }
        };

        // Handle cleanup
        const cleanup = () => {
          isClosed = true;
          reader.releaseLock();
        };

        // Start pumping
        pump().finally(cleanup);
      },
      
      cancel() {
        console.log('📡 Stream cancelled by client');
      }
    });

    // Return the stream with proper SSE headers
    return new NextResponse(stream, {
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
