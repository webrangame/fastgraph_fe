import { NextRequest, NextResponse } from 'next/server';
import { auditStore } from '@/lib/auditStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 POST /api/v1/audit/log - Received data:', body);
    
    // Extract fields with fallbacks for different naming conventions
    const {
      createdBy, // from useAuditLog hook
      userId,    // alternative field name
      action,
      resource,
      description,
      details,
      task,
      endpoint,
      method,
      statusCode,
      metadata,
      userAgent
    } = body;
    
    // Use createdBy if available, otherwise userId
    const finalUserId = createdBy || userId;
    
    console.log('📊 Processed audit data:', { 
      userId: finalUserId, 
      action, 
      resource, 
      description 
    });
    
    // Validate required fields
    if (!finalUserId) {
      console.error('❌ Missing userId/createdBy field');
      return NextResponse.json(
        { error: 'userId/createdBy is required' },
        { status: 400 }
      );
    }
    
    if (!action) {
      console.error('❌ Missing action field');
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }
    
    // Create audit log entry using the audit store
    const auditLog = auditStore.addLog({
      userId: finalUserId,
      action,
      details: {
        description,
        details,
        task,
        endpoint,
        method,
        statusCode,
        metadata,
        ...(details || {})
      },
      resource: resource || 'unknown',
      resourceId: metadata?.workflowId || metadata?.agentId || metadata?.dataId || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: userAgent || request.headers.get('user-agent') || 'unknown'
    });
    
    console.log('✅ Audit log created successfully:', auditLog.id);
    
    return NextResponse.json(
      { 
        message: 'Audit log saved successfully',
        auditId: auditLog.id,
        timestamp: auditLog.timestamp
      },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create audit log',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
