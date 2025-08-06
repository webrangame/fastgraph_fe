'use client';

import { Bot, X } from 'lucide-react';
import { Workflow, WorkflowNode, WorkflowCanvasProps } from '@/types/workflow';

export function WorkflowCanvas({ 
  workflow, 
  selectedNode, 
  onSelectNode, 
  onDeleteNode, 
  onAddNode 
}: WorkflowCanvasProps) {
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
      
      {/* Nodes */}
      {workflow.nodes.map((node: WorkflowNode) => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          onClick={() => onSelectNode(node.id)}
          onDelete={onDeleteNode}
        />
      ))}
    </div>
  );
}

function WorkflowNodeComponent({ 
  node, 
  isSelected, 
  onClick, 
  onDelete 
}: {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (nodeId: string) => void;
}) {
  return (
    <div 
      className={`absolute cursor-pointer group ${isSelected ? 'z-10' : 'z-0'}`}
      style={{ left: node.x, top: node.y }}
      onClick={onClick}
    >
      <div className={`relative theme-card-bg rounded-lg p-4 border-2 transition-all theme-shadow ${
        isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'theme-border hover:border-gray-400'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="theme-text-primary font-medium text-sm">{node.label}</div>
            <div className="theme-text-muted text-xs">Agent</div>
          </div>
        </div>
        
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