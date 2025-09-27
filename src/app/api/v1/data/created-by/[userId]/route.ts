import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows } from '@/lib/mockDataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    console.log('📋 GET /api/v1/data/created-by/[userId] - userId:', userId);
    
    // Filter workflows by userId
    const allWorkflows = getWorkflows();
    const userWorkflows = allWorkflows.filter(workflow => workflow.createdBy === userId);
    
    return NextResponse.json(userWorkflows, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}
