'use client';

import { useLogAuditMutation } from '@/redux/api/audit/auditApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';

interface AuditLogData {
  action: string;
  resource: string;
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
        user,
        auditData,
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error to avoid breaking the main operation
    }
  };

  // Convenience methods for common actions
  const logWorkflowAction = async (action: 'create' | 'update' | 'delete' | 'execute', workflowData: any) => {
    await logActivity({
      action,
      resource: 'data',
      description: `Workflow ${action}d: ${workflowData.name}`,
      details: `Workflow ID: ${workflowData.id}, Status: ${workflowData.status}`,
      task: 'workflow-management',
      endpoint: '/api/v1/workflows',
      method: action === 'create' ? 'POST' : action === 'delete' ? 'DELETE' : 'PUT',
      statusCode: 200,
      metadata: {
        workflowId: workflowData.id,
        workflowName: workflowData.name,
        workflowStatus: workflowData.status,
        nodeCount: workflowData.nodes?.length || 0,
        connectionCount: workflowData.connections?.length || 0
      }
    });
  };

  const logAgentAction = async (action: 'create' | 'update' | 'delete' | 'deploy', agentData: any) => {
    await logActivity({
      action,
      resource: 'other',
      description: `Agent ${action}d: ${agentData.role || agentData.name}`,
      details: `Agent role: ${agentData.role}, Task: ${agentData.task}`,
      task: 'agent-management',
      endpoint: '/api/v1/agents',
      method: action === 'create' ? 'POST' : action === 'delete' ? 'DELETE' : 'PUT',
      statusCode: 200,
      metadata: {
        agentRole: agentData.role,
        agentTask: agentData.task,
        agentCapabilities: agentData.capabilities,
        agentTags: agentData.tags
      }
    });
  };

  const logDataAction = async (action: 'create' | 'update' | 'delete' | 'install', dataInfo: any) => {
    await logActivity({
      action,
      resource: 'data',
      description: `Data ${action}d: ${dataInfo.dataName || dataInfo.name}`,
      details: `Data type: ${dataInfo.dataType}, Agents: ${dataInfo.numberOfAgents || 0}`,
      task: 'data-management',
      endpoint: '/api/v1/data',
      method: action === 'create' ? 'POST' : action === 'delete' ? 'DELETE' : 'PUT',
      statusCode: 200,
      metadata: {
        dataName: dataInfo.dataName || dataInfo.name,
        dataType: dataInfo.dataType,
        numberOfAgents: dataInfo.numberOfAgents,
        description: dataInfo.description
      }
    });
  };

  const logUserAction = async (action: 'login' | 'logout' | 'profile_update', userInfo: any) => {
    await logActivity({
      action,
      resource: 'user',
      description: `User ${action}: ${userInfo.fullName || userInfo.email}`,
      details: `User ID: ${userInfo.id || userInfo.userId}`,
      task: 'user-management',
      endpoint: '/api/v1/auth',
      method: action === 'login' ? 'POST' : 'PUT',
      statusCode: 200,
      metadata: {
        userId: userInfo.id || userInfo.userId,
        userEmail: userInfo.email,
        userName: userInfo.fullName
      }
    });
  };

  return {
    logActivity,
    logWorkflowAction,
    logAgentAction,
    logDataAction,
    logUserAction
  };
}
