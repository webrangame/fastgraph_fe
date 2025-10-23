'use client';

import { useLogAuditMutation } from '@/redux/api/audit/auditApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';

interface AuditLogData {
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'install' | 'export' | 'import' | 'other';
  resource: 'data' | 'user' | 'auth' | 'mcp' | 'system' | 'other';
  description: string;
  details?: string;
  task?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const [logAudit] = useLogAuditMutation();
  const user = useSelector(selectCurrentUser);

  const logActivity = async (auditData: AuditLogData) => {
    try {
      const fullAuditData = {
        ...auditData,
        createdBy: user?.id || user?.userId || 'unknown-user',
        userAgent: navigator.userAgent,
      };

      console.log('🔍 useAuditLog: Attempting to log audit:', {
        user,
        createdBy: fullAuditData.createdBy,
        action: auditData.action,
        resource: auditData.resource
      });

      const result = await logAudit(fullAuditData).unwrap();
      console.log('✅ Audit log created successfully:', auditData.action, result);
    } catch (error) {
      console.error('❌ Failed to create audit log:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        user,
        auditData,
        fullAuditData: {
          ...auditData,
          createdBy: user?.id || user?.userId || 'unknown-user',
          userAgent: navigator.userAgent,
        }
      });
      // Don't throw error to avoid breaking the main operation
    }
  };

  // Workflow lifecycle actions
  const logWorkflowCreate = async (workflowData: any) => {
    await logActivity({
      action: 'create',
      resource: 'data',
      description: `New workflow created: ${workflowData.name}`,
      details: `Workflow ID: ${workflowData.id}, Description: ${workflowData.description}`,
      task: 'workflow-management',
      endpoint: '/api/v1/workflows',
      method: 'POST',
      statusCode: 201,
      metadata: {
        workflowId: workflowData.id,
        workflowName: workflowData.name,
        workflowDescription: workflowData.description,
        workflowStatus: workflowData.status,
        nodeCount: workflowData.nodes?.length || 0,
        connectionCount: workflowData.connections?.length || 0,
        createdAt: new Date().toISOString()
      }
    });
  };

  const logWorkflowStart = async (workflowData: any) => {
    await logActivity({
      action: 'other',
      resource: 'data',
      description: `Workflow started: ${workflowData.name}`,
      details: `Workflow ID: ${workflowData.id}, Status: ${workflowData.status}`,
      task: 'workflow-execution',
      endpoint: '/api/v1/workflows',
      method: 'POST',
      statusCode: 200,
      metadata: {
        workflowId: workflowData.id,
        workflowName: workflowData.name,
        workflowStatus: workflowData.status,
        nodeCount: workflowData.nodes?.length || 0,
        connectionCount: workflowData.connections?.length || 0,
        startTime: new Date().toISOString(),
        eventType: 'workflow_start'
      }
    });
  };

  const logWorkflowEnd = async (workflowData: any, result?: any) => {
    await logActivity({
      action: 'other',
      resource: 'data',
      description: `Workflow completed: ${workflowData.name}`,
      details: `Workflow ID: ${workflowData.id}, Status: ${workflowData.status}`,
      task: 'workflow-execution',
      endpoint: '/api/v1/workflows',
      method: 'POST',
      statusCode: 200,
      metadata: {
        workflowId: workflowData.id,
        workflowName: workflowData.name,
        workflowStatus: workflowData.status,
        nodeCount: workflowData.nodes?.length || 0,
        connectionCount: workflowData.connections?.length || 0,
        endTime: new Date().toISOString(),
        result: result || 'completed',
        eventType: 'workflow_completed'
      }
    });
  };

  return {
    logActivity,
    logWorkflowCreate,
    logWorkflowStart,
    logWorkflowEnd
  };
}
