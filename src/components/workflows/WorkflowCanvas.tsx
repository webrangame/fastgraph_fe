"use client";

import { Bot, X, PenTool, Calculator, Zap } from "lucide-react";
import { Workflow, WorkflowNode, WorkflowCanvasProps } from "@/types/workflow";
import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom node types for different agent roles
const getNodeStyle = (role: string) => {
  switch (role) {
    case 'Creative Writer':
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: '#667eea',
        textColor: 'white',
        icon: PenTool,
        emoji: '✏️'
      };
    case 'Word Counter':
      return {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderColor: '#f093fb', 
        textColor: 'white',
        icon: Calculator,
        emoji: '🔢'
      };
    default:
      return {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        borderColor: '#a8edea',
        textColor: '#333',
        icon: Bot,
        emoji: '🤖'
      };
  }
};

// Smaller React Flow node component with proper handles
const CustomAgentNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div 
      className={`relative theme-card-bg rounded-lg border-2 transition-all theme-shadow cursor-pointer group ${
        selected 
          ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
          : 'theme-border hover:border-gray-400'
      }`}
      style={{
        padding: '8px 12px',
        minWidth: '120px',
        maxWidth: '140px',
        fontSize: '11px'
      }}
    >
      {/* React Flow Handles - Essential for connections */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#6366f1',
          width: 8,
          height: 8,
          border: '2px solid white',
          left: -4
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#10b981',
          width: 8,
          height: 8,
          border: '2px solid white',
          right: -4
        }}
      />
      
      {/* Compact agent content */}
      <div className="flex items-center space-x-2">
        <div className="p-1 rounded-md bg-blue-500 flex-shrink-0">
          <Bot className="w-3 h-3 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="theme-text-primary font-medium text-xs leading-tight truncate">
            {data.label}
          </div>
          <div className="theme-text-muted text-xs leading-tight truncate">
            {data.role}
          </div>
        </div>
      </div>
    </div>
  );
};

// Node types for React Flow
const nodeTypes = {
  agent: CustomAgentNode,
};

export function WorkflowCanvas({
  workflow,
  selectedNode,
  onSelectNode,
  onDeleteNode,
  onAddNode,
  agents,
  connections,
  isAutoOrchestrating,
}: WorkflowCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Initialize nodes based on agents and edges based on connections
  useEffect(() => {
    if (agents) {
      const agentNodes: Node[] = Object.entries(agents).map(([name, agent], index) => ({
        id: `agent-${name}`,
        position: { 
          x: 100 + (index % 3) * 200, // Better spacing for smaller nodes
          y: 150 + Math.floor(index / 3) * 120 
        },
        data: {
          label: agent.name || name,
          role: agent.role,
          capabilities: agent.capabilities || []
        },
        type: 'agent',
        style: {
          width: 120,
          height: 60
        }
      }));
      
      console.log('Setting agent nodes:', agentNodes);
      setNodes(agentNodes);

      // Create connections based on agent input/output relationships
      if (agents && Object.keys(agents).length > 1) {
        const agentEntries = Object.entries(agents);
        const generatedConnections: Edge[] = [];
        
        console.log('Available agents for connections:', agentEntries.map(([name, agent]) => ({
          name,
          inputs: agent.inputs,
          outputs: agent.outputs
        })));
        
        // Create connections based on input/output flow
        agentEntries.forEach(([sourceName, sourceAgent], sourceIndex) => {
          if (sourceAgent.outputs && sourceAgent.outputs.length > 0) {
            sourceAgent.outputs.forEach((output: string) => {
              agentEntries.forEach(([targetName, targetAgent], targetIndex) => {
                if (sourceName !== targetName && targetAgent.inputs && targetAgent.inputs.includes(output)) {
                  const connectionId = `${sourceName}-to-${targetName}`;
                  
                  // Avoid duplicate connections
                  if (!generatedConnections.find(conn => conn.id === connectionId)) {
                    generatedConnections.push({
                      id: connectionId,
                      source: `agent-${sourceName}`,
                      target: `agent-${targetName}`,
                      type: 'smoothstep',
                      animated: true,
                      style: {
                        stroke: '#6366f1',
                        strokeWidth: 2,
                      },
                      markerEnd: {
                        type: 'arrowclosed',
                        width: 15,
                        height: 15,
                        color: '#6366f1',
                      },
                      label: output,
                      labelStyle: {
                        fontSize: 10,
                        fontWeight: 500,
                      },
                      labelBgPadding: [8, 4],
                      labelBgBorderRadius: 4,
                      labelBgStyle: {
                        fill: '#f8fafc',
                        color: '#475569',
                        fillOpacity: 0.9,
                      },
                    });
                  }
                }
              });
            });
          }
        });
        
        // If no connections generated from input/output matching, create a simple sequential flow
        if (generatedConnections.length === 0 && agentEntries.length >= 2) {
          console.log('No input/output matches found, creating sequential flow');
          for (let i = 0; i < agentEntries.length - 1; i++) {
            const [sourceName] = agentEntries[i];
            const [targetName] = agentEntries[i + 1];
            
            generatedConnections.push({
              id: `seq-${sourceName}-to-${targetName}`,
              source: `agent-${sourceName}`,
              target: `agent-${targetName}`,
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#6366f1',
                strokeWidth: 2,
              },
              markerEnd: {
                type: 'arrowclosed',
                width: 15,
                height: 15,
                color: '#6366f1',
              },
              label: 'sequential',
              labelStyle: {
                fontSize: 10,
                fontWeight: 500,
              },
              labelBgPadding: [8, 4],
              labelBgBorderRadius: 4,
              labelBgStyle: {
                fill: '#f8fafc',
                color: '#475569',
                fillOpacity: 0.9,
              },
            });
          }
        }
        
        console.log('Generated connections:', generatedConnections);
        setEdges(generatedConnections);
        
        // If still no connections but we have at least 2 agents, force a test connection
        if (generatedConnections.length === 0 && agentEntries.length >= 2) {
          console.log('Forcing a test connection between first two agents');
          const [firstName] = agentEntries[0];
          const [secondName] = agentEntries[1];
          
          const testConnection: Edge = {
            id: `test-${firstName}-to-${secondName}`,
            source: `agent-${firstName}`,
            target: `agent-${secondName}`,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#ef4444',
              strokeWidth: 3,
            },
            markerEnd: {
              type: 'arrowclosed',
              width: 15,
              height: 15,
              color: '#ef4444',
            },
            label: 'test connection',
            labelStyle: {
              fontSize: 10,
              fontWeight: 500,
              color: '#ef4444'
            },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            labelBgStyle: {
              fill: '#fef2f2',
              color: '#ef4444',
              fillOpacity: 0.9,
            },
          };
          
          setEdges([testConnection]);
        }
      }
    }
    
    // Also handle explicit connections if provided (takes priority)
    if (connections && connections.length > 0) {
      console.log('Using explicit connections:', connections);
      const reactFlowEdges: Edge[] = connections.map((connection, index) => ({
        id: connection.id || `edge-${index}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep', // Force smoothstep type
        animated: true,
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 15,
          height: 15,
          color: '#6366f1',
        },
        label: connection.label || 'data flow',
        labelStyle: {
          fontSize: 10,
          fontWeight: 500,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: '#f8fafc',
          color: '#475569',
          fillOpacity: 0.9,
        },
      }));
      
      setEdges(reactFlowEdges);
      return; // Use explicit connections and skip auto-generation
    }
  }, [agents, connections]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 15,
          height: 15,
          color: '#6366f1',
        },
      };
      setEdges((edgesSnapshot) => addEdge(newEdge, edgesSnapshot));
    },
    []
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedAgent(node.id);
    if (onSelectNode) {
      onSelectNode(node.id);
    }
  }, [onSelectNode]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addNodeToCanvas = (e: React.DragEvent, nodeData: any) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 40;

    if (onAddNode) {
      onAddNode(nodeData, { x, y });
    }
  };

  // Mobile touch handlers for adding nodes
  const handleCanvasTap = (e: React.TouchEvent) => {
    if (!isMobile) return;

    // Double tap to add a default node
    const now = Date.now();
    const target = e.currentTarget as any;
    const lastTap = target.lastTap || 0;

    if (now - lastTap < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      const x = touch.clientX - rect.left - 60;
      const y = touch.clientY - rect.top - 40;

      // Add a default agent node on double tap
      const defaultAgent = {
        type: "agent",
        name: "New Agent",
        color: "bg-blue-500",
      };

      if (onAddNode) {
        onAddNode(defaultAgent, { x, y });
      }
    }

    target.lastTap = now;
  };

  if (!workflow && !agents) {
    return (
      <div className="flex-1 theme-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Bot
            className={`${
              isMobile ? "w-12 h-12" : "w-16 h-16"
            } theme-text-muted mx-auto mb-4`}
          />
          <h3
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold theme-text-primary mb-2`}
          >
            No Workflow Selected
          </h3>
          <p className={`theme-text-secondary ${isMobile ? "text-sm" : ""}`}>
            Create a new workflow to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 theme-bg relative overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const nodeDataString = e.dataTransfer.getData("text/plain");
        if (nodeDataString) {
          try {
            const nodeData = JSON.parse(nodeDataString);
            addNodeToCanvas(e, nodeData);
          } catch (error) {
            console.error("Error parsing node data:", error);
          }
        }
      }}
      onTouchEnd={isMobile ? handleCanvasTap : undefined}
    >
      {/* Auto Orchestrate Loading Bar */}
      {isAutoOrchestrating && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-r-full transition-all duration-300 ease-out"
            style={{ 
              width: '100%', 
              animation: 'progress-animation 3s ease-in-out infinite' 
            }}
          />
        </div>
      )}
      
      {/* React Flow Container */}
      <div style={{ width: "100%", height: "100%" }} className="relative">
        {/* Debug info */}
        {(nodes.length > 0 || edges.length > 0) && (
          <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs z-50">
            <div>Nodes: {nodes.length}</div>
            <div>Edges: {edges.length}</div>
            {edges.length > 0 && (
              <div>Connections: {edges.map(e => `${e.source}→${e.target}`).join(', ')}</div>
            )}
          </div>
        )}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ 
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
          style={{
            background: 'transparent'
          }}
          connectionLineStyle={{
            stroke: '#6366f1',
            strokeWidth: 3,
            strokeDasharray: '5,5',
          }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          // Force edge rendering
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Ctrl']}
          panOnScroll={false}
          selectionOnDrag={false}
          panOnDrag={[1]}
          selectNodesOnDrag={false}
        />
      </div>
      
      {/* Enhanced Grid background with smaller pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, var(--text-muted) 1px, transparent 1px),
            linear-gradient(var(--text-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? "20px 20px, 20px 20px, 20px 20px" : "20px 20px, 20px 20px, 20px 20px",
        }}
      />
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes progress-animation {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 100%; }
        }
        
        @keyframes flow-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Compact agent details panel */}
      {selectedAgent && agents && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs border theme-border z-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm theme-text-primary">
              {agents[selectedAgent.replace('agent-', '')]?.name || 'Agent Details'}
            </h3>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {(() => {
            const agent = agents[selectedAgent.replace('agent-', '')];
            if (!agent) return null;
            
            return (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="theme-text-secondary">Role:</span>
                  <span className="ml-2 theme-text-primary">{agent.role}</span>
                </div>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div>
                    <span className="theme-text-secondary">Capabilities:</span>
                    <div className="mt-1">
                      <span className="theme-text-muted text-xs">
                        {agent.capabilities.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="theme-text-secondary">Status:</span>
                  <span className="ml-2 text-green-600">Connected</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty Canvas Message - only show if no agents */}
      {(!agents || Object.keys(agents).length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="text-center max-w-sm">
            <div
              className={`${
                isMobile ? "w-16 h-16" : "w-24 h-24"
              } theme-card-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed theme-border`}
            >
              <Bot
                className={`${
                  isMobile ? "w-8 h-8" : "w-12 h-12"
                } theme-text-muted`}
              />
            </div>
            <h3
              className={`${
                isMobile ? "text-base" : "text-lg"
              } font-semibold theme-text-primary mb-2`}
            >
              {isMobile
                ? "Tap menu to add agents"
                : "Drag agents here to build your workflow"}
            </h3>
            <p
              className={`theme-text-secondary ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              {isMobile
                ? "Use the agent panel to add agents to your workflow"
                : "Select agents from the left panel and drag them onto the canvas"}
            </p>
            {isMobile && (
              <p className="theme-text-muted text-xs mt-2">
                Double-tap empty space to add a new agent
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}