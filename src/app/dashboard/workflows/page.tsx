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
  Square,
  Send,
  MessageCircle,
  Minimize2,
  Maximize2
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

interface PromptMessage {
  id: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system';
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
    nodes: [],
    connections: []
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
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 40;
    
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
      
      {/* Empty Canvas Message */}
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
          
          const x1 = fromNode.x + 120;
          const y1 = fromNode.y + 40;
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

function PromptInput({ 
  onSubmit, 
  isProcessing 
}: { 
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim() && !isProcessing) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group border border-cyan-400/30"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-xl shadow-xl border border-cyan-200/20 dark:border-cyan-400/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-cyan-500/80 backdrop-blur-md border-b border-cyan-400/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-white">Workflow Assistant</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                <span className="text-xs text-white/90">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Input Section */}
        <div className="p-4 bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to modify your workflow, add agents, or execute commands..."
              className="w-full h-20 p-3 pr-12 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-400/30 rounded-lg resize-none text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all" // text-sm added here
              disabled={isProcessing}
            />
            
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isProcessing}
              className={`absolute bottom-3 right-2 p-2 rounded-lg backdrop-blur-sm transition-all border ${
                inputValue.trim() && !isProcessing
                  ? 'bg-cyan-500/80 hover:bg-cyan-500 text-white shadow-md hover:shadow-lg border-cyan-400/30'
                  : 'bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-300/30 dark:border-gray-600/30'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInputValue('Add a customer service agent to the workflow')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <span>Add Agent</span>
            </button>
            
            <button
              onClick={() => setInputValue('Execute the current workflow')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              <span>Execute</span>
            </button>
            
            <button
              onClick={() => setInputValue('Show me workflow statistics')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <GitBranch className="w-3 h-3 text-white" />
              </div>
              <span>Stats</span>
            </button>
          </div>

          {/* Status Indicator */}
          {isProcessing && (
            <div className="mt-3 flex items-center space-x-3 p-3 bg-cyan-50/60 dark:bg-cyan-900/20 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 rounded-lg">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <div className="text-cyan-700 dark:text-cyan-300 font-medium">Processing your request...</div>
                <div className="text-cyan-600 dark:text-cyan-400 text-sm">This may take a few seconds</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>('1');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isProcessingPrompt, setIsProcessingPrompt] = useState<boolean>(false);
  const [promptMessages, setPromptMessages] = useState<PromptMessage[]>([]);
  
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

  const handlePromptSubmit = async (message: string) => {
    setIsProcessingPrompt(true);
    
    // Add user message to chat
    const userMessage: PromptMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user'
    };
    setPromptMessages(prev => [...prev, userMessage]);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Process the command based on message content
    let responseText = '';
    
    if (message.toLowerCase().includes('add') && message.toLowerCase().includes('agent')) {
      // Add a random agent to the workflow
      const agents = ['Customer Service Agent', 'Billing Agent', 'Technical Support Agent'];
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
      const randomIndex = Math.floor(Math.random() * agents.length);
      
      addNodeToWorkflow(
        {
          type: 'agent',
          name: agents[randomIndex],
          color: colors[randomIndex]
        },
        { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
      );
      
      responseText = `Added ${agents[randomIndex]} to your workflow!`;
    } else if (message.toLowerCase().includes('execute') || message.toLowerCase().includes('run')) {
      if (currentWorkflow && currentWorkflow.nodes.length > 0) {
        executeWorkflow();
        responseText = 'Executing your workflow now...';
      } else {
        responseText = 'Please add some agents to your workflow before executing.';
      }
    } else if (message.toLowerCase().includes('stats') || message.toLowerCase().includes('statistics')) {
      const nodeCount = currentWorkflow?.nodes.length || 0;
      const connectionCount = currentWorkflow?.connections.length || 0;
      responseText = `Current workflow has ${nodeCount} agents and ${connectionCount} connections. Status: ${currentWorkflow?.status || 'Unknown'}`;
    } else if (message.toLowerCase().includes('delete') || message.toLowerCase().includes('remove')) {
      if (selectedNode) {
        deleteNode(selectedNode);
        responseText = 'Removed the selected agent from your workflow.';
      } else {
        responseText = 'Please select an agent first to remove it.';
      }
    } else {
      responseText = 'I can help you add agents, execute workflows, show statistics, or remove selected agents. Try commands like "Add a customer service agent" or "Execute workflow".';
    }

    // Add system response
    const systemMessage: PromptMessage = {
      id: `msg_${Date.now() + 1}`,
      text: responseText,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    };
    setPromptMessages(prev => [...prev, systemMessage]);
    
    setIsProcessingPrompt(false);
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
    const updatedWorkflows = workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return { ...w, status: 'running' as const };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);
    
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

      {/* Floating Prompt Input */}
      <PromptInput 
        onSubmit={handlePromptSubmit}
        isProcessing={isProcessingPrompt}
      />
    </div>
  );
}