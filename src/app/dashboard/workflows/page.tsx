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
}

interface PropertiesPanelProps {
  selectedNode: string | null;
  workflow: Workflow | undefined;
}

// Node types similar to n8n
const nodeTypes: NodeType[] = [
  {
    id: 'trigger',
    name: 'Email Trigger',
    icon: Mail,
    color: 'bg-green-500',
    category: 'Triggers'
  },
  {
    id: 'agent',
    name: 'AI Agent',
    icon: Bot,
    color: 'bg-blue-500',
    category: 'Agents'
  },
  {
    id: 'condition',
    name: 'Condition',
    icon: GitBranch,
    color: 'bg-yellow-500',
    category: 'Logic'
  },
  {
    id: 'action',
    name: 'Action',
    icon: Zap,
    color: 'bg-purple-500',
    category: 'Actions'
  }
];

// Sample workflows
const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Customer Service Router',
    status: 'active',
    lastModified: '2 hours ago',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Email Trigger', x: 100, y: 200 },
      { id: 'n2', type: 'agent', label: 'Main Agent', x: 300, y: 200 },
      { id: 'n3', type: 'condition', label: 'Route Logic', x: 500, y: 200 },
      { id: 'n4', type: 'agent', label: 'Billing Agent', x: 700, y: 150 },
      { id: 'n5', type: 'agent', label: 'Return Agent', x: 700, y: 250 }
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n3', to: 'n5' }
    ]
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
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Node */}
      <div className={`relative bg-gray-800 rounded-lg p-4 border-2 transition-all ${
        isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-gray-600 hover:border-gray-500'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${nodeType?.color || 'bg-gray-500'}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-medium text-sm">{node.label}</div>
            <div className="text-gray-400 text-xs">{nodeType?.name}</div>
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

function WorkflowCanvas({ workflow, selectedNode, setSelectedNode, onDeleteNode }: WorkflowCanvasProps) {
  if (!workflow) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Workflow Selected</h3>
          <p className="text-gray-400">Create a new workflow to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
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
              stroke="#4B5563"
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
              fill="#4B5563"
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

function NodePanel() {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-4">
          {['Triggers', 'Agents', 'Logic', 'Actions'].map(category => (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-300">{category}</h3>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-1">
                {nodeTypes
                  .filter(type => type.category === category)
                  .map(type => (
                    <div
                      key={type.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                      draggable
                    >
                      <div className={`p-1.5 rounded ${type.color}`}>
                        <type.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        {type.name}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesPanel({ selectedNode, workflow }: PropertiesPanelProps) {
  const node = workflow?.nodes.find((n: WorkflowNode) => n.id === selectedNode);
  
  if (!selectedNode || !node) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-center text-gray-400 mt-8">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a node to configure</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Node Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Node Name
          </label>
          <input
            type="text"
            value={node.label}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {node.type === 'agent' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Model
              </label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>GPT-4</option>
                <option>GPT-3.5</option>
                <option>Claude</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                rows={4}
                placeholder="Enter system prompt..."
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        
        {node.type === 'condition' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Condition Logic
            </label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Contains keywords</option>
              <option>Sentiment analysis</option>
              <option>Custom logic</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>('1');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const currentWorkflow = workflows.find((w: Workflow) => w.id === activeWorkflow);
  
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
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">Workflow Builder</h1>
            {currentWorkflow && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentWorkflow.status === 'running' ? 'bg-green-400 animate-pulse' :
                  currentWorkflow.status === 'active' ? 'bg-green-400' :
                  currentWorkflow.status === 'stopped' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-400 capitalize">{currentWorkflow.status}</span>
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
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center space-x-2 transition-colors"
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
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center space-x-2 transition-colors"
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg cursor-pointer relative ${
                  activeWorkflow === workflow.id
                    ? 'bg-gray-900 text-white border-t-2 border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {workflows.length < 5 && (
            <button
              onClick={createNewWorkflow}
              className="flex items-center space-x-1 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Workflow</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <NodePanel />
        <WorkflowCanvas 
          workflow={currentWorkflow}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          onDeleteNode={deleteNode}
        />
        <PropertiesPanel 
          selectedNode={selectedNode}
          workflow={currentWorkflow}
        />
      </div>
    </div>
  );
}