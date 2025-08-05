'use client';

import { useState } from 'react';
import { 
  Plus, 
  Play, 
  Save, 
  Settings, 
  Trash2, 
  Copy,
  MoreHorizontal,
  Mail,
  Bot,
  Search,
  Zap,
  GitBranch,
  X,
  ChevronDown,
  LucideIcon,
  Square
} from 'lucide-react';

// Type definitions
interface NodeType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'inactive' | 'running' | 'stopped';
  lastModified: string;
  nodes: WorkflowNode[];
  connections: Connection[];
}

interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

interface WorkflowCanvasProps {
  workflow: Workflow | undefined;
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddNode: (nodeData: any, position: { x: number; y: number }) => void;
}

// Node types (keeping only for existing workflow compatibility)
const nodeTypes: NodeType[] = [];

// Sample created agents
const createdAgents = [
  {
    id: 'customer-service-agent',
    name: 'Customer Service Agent',
    icon: Bot,
    color: 'bg-blue-500',
    category: 'Agents'
  },
  {
    id: 'billing-agent',
    name: 'Billing Agent', 
    icon: Bot,
    color: 'bg-green-500',
    category: 'Agents'
  },
  {
    id: 'technical-support-agent',
    name: 'Technical Support Agent',
    icon: Bot,
    color: 'bg-purple-500', 
    category: 'Agents'
  }
];

// Sample workflows (empty canvas)
const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Customer Service Router',
    status: 'active',
    lastModified: '2 hours ago',
    nodes: [], // Empty - no pre-loaded nodes
    connections: [] // Empty - no pre-loaded connections
  }
];

function WorkflowNode({ node, isSelected, onClick, onDelete }: WorkflowNodeProps) {
  const nodeType = nodeTypes.find(type => type.id === node.type);
  const Icon = nodeType?.icon || Bot;

  return (
    <div 
      className={`absolute cursor-pointer group ${isSelected ? 'z-10' : 'z-0'}`}
      style={{ left: node.x, top: node.y }}
      onClick={() => onClick(node.id)}
    >
      {/* Connection points */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted rounded-full border-2 theme-border opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--text-muted)', borderColor: 'var(--border-color)' }}></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted rounded-full border-2 theme-border opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--text-muted)', borderColor: 'var(--border-color)' }}></div>
      
      {/* Node */}
      <div className={`relative theme-card-bg rounded-lg p-4 border-2 transition-all theme-shadow ${
        isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'theme-border hover:border-gray-400'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${node.type === 'agent' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="theme-text-primary font-medium text-sm">{node.label}</div>
            <div className="theme-text-muted text-xs">Agent</div>
          </div>
        </div>
        
        {/* Delete button */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

function WorkflowCanvas({ workflow, selectedNode, setSelectedNode, onDeleteNode, onAddNode }: WorkflowCanvasProps) {
  const addNodeToCanvas = (e: React.DragEvent, nodeData: any) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // Center the node
    const y = e.clientY - rect.top - 40;  // Center the node
    
    onAddNode(nodeData, { x, y });
  };

  if (!workflow) {
    return (
      <div className="flex-1 theme-bg flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 theme-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold theme-text-primary mb-2">No Workflow Selected</h3>
          <p className="theme-text-secondary">Create a new workflow to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 theme-bg relative overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const nodeDataString = e.dataTransfer.getData('text/plain');
        if (nodeDataString) {
          const nodeData = JSON.parse(nodeDataString);
          addNodeToCanvas(e, nodeData);
        }
      }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--text-muted) 1px, transparent 1px),
          linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Empty Canvas Message - Only show when no nodes */}
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 theme-card-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed theme-border">
              <Bot className="w-12 h-12 theme-text-muted" />
            </div>
            <h3 className="text-lg font-semibold theme-text-primary mb-2">Drag agents here to build your workflow</h3>
            <p className="theme-text-secondary text-sm">Select agents from the left panel and drag them onto the canvas</p>
          </div>
        </div>
      )}
      
      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {workflow.connections.map((conn: Connection, index: number) => {
          const fromNode = workflow.nodes.find((n: WorkflowNode) => n.id === conn.from);
          const toNode = workflow.nodes.find((n: WorkflowNode) => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          const x1 = fromNode.x + 120; // Node width approximation
          const y1 = fromNode.y + 40;  // Node height approximation / 2
          const x2 = toNode.x;
          const y2 = toNode.y + 40;
          
          return (
            <path
              key={index}
              d={`M ${x1} ${y1} C ${x1 + 50} ${y1} ${x2 - 50} ${y2} ${x2} ${y2}`}
              stroke="var(--text-secondary)"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--text-secondary)"
            />
          </marker>
        </defs>
      </svg>
      
      {/* Nodes */}
      {workflow.nodes.map((node: WorkflowNode) => (
        <WorkflowNode
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          onClick={setSelectedNode}
          onDelete={onDeleteNode}
        />
      ))}
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>('1');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const currentWorkflow = workflows.find((w: Workflow) => w.id === activeWorkflow);

  const addNodeToWorkflow = (nodeData: any, position: { x: number; y: number }) => {
    if (!activeWorkflow) return;
    
    const newNodeId = `node_${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: nodeData.type,
      label: nodeData.name,
      x: position.x,
      y: position.y
    };
    
    const updatedWorkflows = workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return {
          ...w,
          nodes: [...w.nodes, newNode],
          lastModified: 'Just now'
        };
      }
      return w;
    });
    
    setWorkflows(updatedWorkflows);
  };

  const createNewWorkflow = () => {
    if (workflows.length >= 5) {
      alert('Maximum 5 workflows allowed');
      return;
    }
    
    const newId = (workflows.length + 1).toString();
    const newWorkflow: Workflow = {
      id: newId,
      name: `Workflow ${newId}`,
      status: 'draft',
      lastModified: 'Just now',
      nodes: [],
      connections: []
    };
    
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflow(newId);
  };
  
  const closeWorkflow = (workflowId: string) => {
    const updatedWorkflows = workflows.filter((w: Workflow) => w.id !== workflowId);
    setWorkflows(updatedWorkflows);
    
    if (activeWorkflow === workflowId) {
      setActiveWorkflow(updatedWorkflows[0]?.id || null);
    }
  };
  
  const deleteNode = (nodeId: string) => {
    const updatedWorkflows = workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return {
          ...w,
          nodes: w.nodes.filter((n: WorkflowNode) => n.id !== nodeId),
          connections: w.connections.filter((c: Connection) => c.from !== nodeId && c.to !== nodeId)
        };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);
    setSelectedNode(null);
  };

  const executeWorkflow = () => {
    if (!currentWorkflow) return;
    
    setIsRunning(true);
    // Update workflow status
    const updatedWorkflows = workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return { ...w, status: 'running' as const };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);
    
    // Simulate workflow execution (remove this in real implementation)
    setTimeout(() => {
      setIsRunning(false);
      const completedWorkflows = workflows.map((w: Workflow) => {
        if (w.id === activeWorkflow) {
          return { ...w, status: 'active' as const, lastModified: 'Just now' };
        }
        return w;
      });
      setWorkflows(completedWorkflows);
    }, 3000);
  };

  const stopWorkflow = () => {
    setIsRunning(false);
    const updatedWorkflows = workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return { ...w, status: 'stopped' as const, lastModified: 'Just now' };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);
  };

  const deleteWorkflow = () => {
    if (!currentWorkflow) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${currentWorkflow.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    const updatedWorkflows = workflows.filter((w: Workflow) => w.id !== activeWorkflow);
    setWorkflows(updatedWorkflows);
    setActiveWorkflow(updatedWorkflows[0]?.id || null);
    setSelectedNode(null);
  };

  return (
    <div className="h-screen theme-bg flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="theme-header-bg theme-border" style={{ borderBottomWidth: '1px' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold theme-text-primary">Workflow Builder</h1>
            {currentWorkflow && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentWorkflow.status === 'running' ? 'bg-green-400 animate-pulse' :
                  currentWorkflow.status === 'active' ? 'bg-green-400' :
                  currentWorkflow.status === 'stopped' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm theme-text-muted capitalize">{currentWorkflow.status}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Execute/Stop Button */}
            {isRunning ? (
              <button 
                onClick={stopWorkflow}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white flex items-center space-x-2 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            ) : (
              <button 
                onClick={executeWorkflow}
                disabled={!currentWorkflow || currentWorkflow.nodes.length === 0}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white flex items-center space-x-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Execute</span>
              </button>
            )}
            
            {/* Save Button */}
            <button 
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white flex items-center space-x-2 transition-colors"
              disabled={!currentWorkflow}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            {/* Delete Workflow Button */}
            <button 
              onClick={deleteWorkflow}
              disabled={!currentWorkflow}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        {/* Workflow Tabs */}
        <div className="flex items-center px-4 pb-2">
          <div className="flex space-x-1 flex-1">
            {workflows.map((workflow: Workflow) => (
              <div
                key={workflow.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg cursor-pointer relative transition-colors ${
                  activeWorkflow === workflow.id
                    ? 'theme-bg theme-text-primary border-t-2 border-blue-500'
                    : 'theme-input-bg theme-text-secondary theme-hover-bg'
                }`}
                onClick={() => setActiveWorkflow(workflow.id)}
              >
                {/* Status Indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  workflow.status === 'running' ? 'bg-green-400 animate-pulse' :
                  workflow.status === 'active' ? 'bg-green-400' :
                  workflow.status === 'stopped' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                
                <span className="text-sm font-medium">{workflow.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWorkflow(workflow.id);
                  }}
                  className="theme-text-muted hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {workflows.length < 5 && (
            <button
              onClick={createNewWorkflow}
              className="flex items-center space-x-1 px-3 py-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Workflow</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 theme-sidebar-bg theme-border" style={{ borderRightWidth: '1px' }}>
          <div className="p-4">
            {/* Agents Title */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold theme-text-secondary">Available Agents</h3>
            </div>
            
            {/* Agent List - Draggable */}
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg theme-hover-bg cursor-grab active:cursor-grabbing group transition-colors"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'agent',
                    name: 'Customer Service Agent',
                    color: 'bg-blue-500'
                  }));
                }}
              >
                <div className="p-2 rounded-lg bg-blue-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm theme-text-secondary group-hover:theme-text-primary font-medium transition-colors">
                  Customer Service Agent
                </span>
              </div>
              
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg theme-hover-bg cursor-grab active:cursor-grabbing group transition-colors"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'agent',
                    name: 'Billing Agent',
                    color: 'bg-green-500'
                  }));
                }}
              >
                <div className="p-2 rounded-lg bg-green-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm theme-text-secondary group-hover:theme-text-primary font-medium transition-colors">
                  Billing Agent
                </span>
              </div>
              
              <div 
                className="flex items-center space-x-3 p-3 rounded-lg theme-hover-bg cursor-grab active:cursor-grabbing group transition-colors"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'agent',
                    name: 'Technical Support Agent',
                    color: 'bg-purple-500'
                  }));
                }}
              >
                <div className="p-2 rounded-lg bg-purple-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm theme-text-secondary group-hover:theme-text-primary font-medium transition-colors">
                  Technical Support Agent
                </span>
              </div>
            </div>
          </div>
        </div>
        <WorkflowCanvas 
          workflow={currentWorkflow}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          onDeleteNode={deleteNode}
          onAddNode={addNodeToWorkflow}
        />
      </div>
    </div>
  );
}