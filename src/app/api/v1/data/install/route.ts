import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, addWorkflow, updateWorkflow } from '@/lib/mockDataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataName, description, dataType, dataContent, numberOfAgents = 0, overwrite = false } = body;
    
    console.log('💾 POST /api/v1/data/install - dataName:', dataName);
    console.log('📊 Request body:', { dataName, description, dataType, numberOfAgents, overwrite });
    
    // Check if workflow already exists
    const existingWorkflow = getWorkflows().find(workflow => workflow.dataName === dataName);
    
    if (existingWorkflow && !overwrite) {
      return NextResponse.json(
        { error: 'Workflow already exists. Use overwrite=true to replace it.' },
        { status: 409 }
      );
    }
    
    // Create new workflow data
    const newWorkflowData = {
      dataName,
      description,
      dataType,
      dataContent,
      numberOfAgents,
      status: 'active',
      createdBy: '1', // TODO: Get from auth
      updatedBy: '1', // TODO: Get from auth
    };
    
    let newWorkflow;
    if (existingWorkflow && overwrite) {
      // Update existing workflow
      newWorkflow = updateWorkflow(existingWorkflow.dataId, newWorkflowData);
      console.log('✅ Workflow updated:', dataName);
    } else {
      // Add new workflow
      newWorkflow = addWorkflow(newWorkflowData);
      console.log('✅ Workflow created:', dataName);
    }
    
    if (!newWorkflow) {
      return NextResponse.json(
        { error: 'Failed to save workflow' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Workflow saved successfully',
        dataId: newWorkflow.dataId,
        dataName: newWorkflow.dataName,
        numberOfAgents: newWorkflow.numberOfAgents
      },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error installing workflow:', error);
    return NextResponse.json(
      { error: 'Failed to install workflow' },
      { status: 500 }
    );
  }
}
