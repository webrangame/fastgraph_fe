import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, getWorkflowById, deleteWorkflow } from '@/lib/mockDataStore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dataId: string }> }
) {
  try {
    const { dataId } = await params;
    
    console.log('🗑️ DELETE /api/v1/data/[dataId] - dataId:', dataId);
    
    // Find and delete the workflow
    const deletedWorkflow = deleteWorkflow(dataId);
    
    if (!deletedWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Workflow deleted:', deletedWorkflow.dataName);
    
    return NextResponse.json(
      { 
        message: 'Workflow deleted successfully',
        deletedWorkflow: {
          dataId: deletedWorkflow.dataId,
          dataName: deletedWorkflow.dataName
        }
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('❌ Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dataId: string }> }
) {
  try {
    const { dataId } = await params;
    
    console.log('📋 GET /api/v1/data/[dataId] - dataId:', dataId);
    
    // Find the workflow
    const workflow = getWorkflowById(dataId);
    
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(workflow, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}
