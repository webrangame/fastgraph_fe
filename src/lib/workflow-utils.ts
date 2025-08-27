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