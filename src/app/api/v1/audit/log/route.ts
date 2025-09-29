import { NextRequest, NextResponse } from 'next/server';
import { auditStore } from '@/lib/auditStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, details, resource, resourceId } = body;
    
    console.log('📝 POST /api/v1/audit/log - action:', action);
    console.log('📊 Audit data:', { userId, action, details, resource, resourceId });
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }
    
    // Create audit log entry using the audit store
    const auditLog = auditStore.addLog({
      userId,
      action,
      details: details || {},
      resource: resource || 'unknown',
      resourceId: resourceId || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    console.log('✅ Audit log created:', auditLog.id);
    
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
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
