import { Workflow, WorkflowNode } from '@/types/workflow';

export function createNewWorkflowData(index: number): Workflow {
  return {
    id: index.toString(),
    name: `Workflow ${index}`,
    description: '',
    status: 'draft',
    lastModified: 'Just now',
    nodes: [],
    connections: []
  };
}

export function updateWorkflowStatus(
  workflow: Workflow, 
  status: Workflow['status'], 
  lastModified?: string
): Workflow {
  return {
    ...workflow,
    status,
    lastModified: lastModified || workflow.lastModified
  };
}

export function addNodeToWorkflowData(
  workflow: Workflow,
  nodeData: any,
  position: { x: number; y: number }
): Workflow {
  const newNodeId = `node_${Date.now()}`;
  const newNode: WorkflowNode = {
    id: newNodeId,
    type: nodeData.type,
    label: nodeData.name,
    x: position.x,
    y: position.y
  };

  return {
    ...workflow,
    nodes: [...workflow.nodes, newNode],
    lastModified: 'Just now'
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-green-400 animate-pulse';
    case 'active':
      return 'bg-green-400';
    case 'stopped':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface AutoOrchestrateResponse {
  identified_role: string;
  role_confidence: number;
  role_method: string;
  role_reasoning: string;
  m_language_spec: string;
  swarm_result: {
    success: boolean;
    swarm_spec: {
      type: string;
      name: string;
      agents: Record<string, any>;
      workflow: any;
      config: any;
      execution_plan: any;
    };
    execution_results: {
      success: boolean;
      results: Record<string, any>;
    };
  };
  final_data: {
    user_command: string;
    technology_request: string;
    seo_request: string;
    writing_request: string;
    technology_report: string;
    seo_report: string;
    article_output: string;
  };
}

export interface WorkflowSaveData {
  workflow: {
    workflowName: string;
    command: string;
    workflowType: string;
    workflowMetaData: {
      description: string;
      tags: string[];
    };
    recStatus: number;
    finalResult: any;
    createdBy: string;
  };
  agents: Array<{
    workflowId: string;
    agentName: string;
    agentMetaData: {
      role: string;
      priority: number;
    };
    isUserEvolved: boolean;
    lastInput: any;
    lastLogs: string;
    lastOutput: any;
    lastRunAt: string;
    createdBy: string;
  }>;
}

export function transformAutoOrchestrateToWorkflow(
  response: AutoOrchestrateResponse,
  userId?: string
): WorkflowSaveData {
  const { swarm_result, final_data } = response;
  
  // Use provided userId or fallback to a default
  const finalUserId = userId || 'unknown-user';
  
  // Extract workflow information
  const workflowName = swarm_result.swarm_spec.name || 'Auto Generated Workflow';
  const command = final_data.user_command || 'Auto orchestrated workflow';
  
  // Extract agents from swarm spec
  const agents = Object.entries(swarm_result.swarm_spec.agents).map(([key, agent], index) => ({
    workflowId: `workflow_${Date.now()}`,
    agentName: agent.name || key,
    agentMetaData: {
      role: agent.role || 'general',
      priority: index + 1
    },
    isUserEvolved: false,
    lastInput: {},
    lastLogs: 'Auto orchestrated agent',
    lastOutput: swarm_result.execution_results.results[key]?.outputs || {},
    lastRunAt: new Date().toISOString(),
    createdBy: finalUserId
  }));

  // Create workflow data
  const workflow = {
    workflowName,
    command,
    workflowType: 'processing',
    workflowMetaData: {
      description: `Auto orchestrated workflow for: ${command}`,
      tags: ['auto-orchestrated', 'ai-generated']
    },
    recStatus: 1,
    finalResult: swarm_result.execution_results.results || {},
    createdBy: finalUserId
  };

  return {
    workflow,
    agents
  };
}