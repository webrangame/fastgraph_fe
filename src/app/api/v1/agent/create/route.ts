import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow_id, name, role, execute_now = false } = body;

    // Validate required fields
    if (!workflow_id || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: workflow_id, name, and role are required' },
        { status: 400 }
      );
    }

    console.log('🤖 Creating agent:', { workflow_id, name, role, execute_now });

    // Call the external API
    const externalUrl = 'https://fatgraph-prod-twu675cviq-uc.a.run.app/agent';
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id,
        name,
        role,
        execute_now
      })
    });

    console.log('📡 External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ External API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create agent', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Agent created successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
