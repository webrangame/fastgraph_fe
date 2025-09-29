import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, addWorkflow, updateWorkflow } from '@/lib/mockDataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataName, description, dataType, dataContent, numberOfAgents = 0, overwrite = false } = body;
    
    console.log('💾 POST /api/v1/data/install - dataName:', dataName);
    console.log('📊 Request body:', { 
      dataName, 
      description, 
      dataType, 
      numberOfAgents, 
      overwrite,
      dataContentType: typeof dataContent,
      dataContentKeys: dataContent && typeof dataContent === 'object' ? Object.keys(dataContent) : 'not-object',
      dataContentSize: dataContent ? JSON.stringify(dataContent).length : 0
    });
    
    // Validate required fields
    if (!dataName) {
      return NextResponse.json(
        { error: 'dataName is required' },
        { status: 400 }
      );
    }
    
    if (!dataType) {
      return NextResponse.json(
        { error: 'dataType is required' },
        { status: 400 }
      );
    }
    
    // Validate dataType
    const allowedDataTypes = ['json', 'csv', 'xml', 'text', 'binary'];
    if (!allowedDataTypes.includes(dataType)) {
      return NextResponse.json(
        { 
          error: 'Bad Request',
          message: [`dataType must be one of the following values: ${allowedDataTypes.join(', ')}`],
          statusCode: 400
        },
        { status: 400 }
      );
    }
    
    // Check data content size (limit to 10MB)
    const dataContentStr = JSON.stringify(dataContent || {});
    if (dataContentStr.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Data content too large (max 10MB)' },
        { status: 413 }
      );
    }
    
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
      dataContent: dataContent || {}, // Ensure dataContent is always an object
      numberOfAgents,
      status: 'active',
      createdBy: '1', // TODO: Get from auth
      updatedBy: '1', // TODO: Get from auth
    };
    
    console.log('📝 Creating workflow data:', {
      dataName: newWorkflowData.dataName,
      dataType: newWorkflowData.dataType,
      numberOfAgents: newWorkflowData.numberOfAgents,
      dataContentKeys: Object.keys(newWorkflowData.dataContent)
    });
    
    let newWorkflow;
    try {
      if (existingWorkflow && overwrite) {
        // Update existing workflow
        newWorkflow = updateWorkflow(existingWorkflow.dataId, newWorkflowData);
        console.log('✅ Workflow updated:', dataName);
      } else {
        // Add new workflow
        newWorkflow = addWorkflow(newWorkflowData);
        console.log('✅ Workflow created:', dataName);
      }
    } catch (workflowError) {
      console.error('❌ Error in workflow operation:', workflowError);
      return NextResponse.json(
        { error: 'Failed to save workflow data', details: workflowError.message },
        { status: 500 }
      );
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
