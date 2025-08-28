import { LucideIcon } from 'lucide-react';

export interface NodeType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  position?: {
    x: number;
    y: number;
  };
  data?: {
    label?: string;
    role?: string;
    capabilities?: string[];
  };
}

export interface Connection {
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'inactive' | 'running' | 'stopped';
  lastModified: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  description: string;
}

export interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export interface WorkflowCanvasProps {
  workflow: Workflow | undefined;
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddNode: (nodeData: any, position: { x: number; y: number }) => void;
  agents?: Record<string, AutoOrchestrateAgent>;
  connections?: any[];
  isAutoOrchestrating?: boolean;
  onAgentFeedback?: (agentId: string, agentName: string, action?: string, feedback?: string) => void;
}

export interface PromptMessage {
  id: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system';
}

export interface AgentData {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

export interface AutoOrchestrateAgent {
  name: string;
  role: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  logs?: Array<{
    timestamp?: string;
    message: string;
  }> | string[];
  // Add other properties as needed based on the API response
}