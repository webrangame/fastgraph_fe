'use client';

import { Bot, X } from 'lucide-react';
import { Workflow, WorkflowNode, WorkflowCanvasProps } from '@/types/workflow';
import { useState, useEffect } from 'react';

export function WorkflowCanvas({ 
  workflow, 
  selectedNode, 
  onSelectNode, 
  onDeleteNode, 
  onAddNode 
}: WorkflowCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addNodeToCanvas = (e: React.DragEvent, nodeData: any) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 40;
    
    onAddNode(nodeData, { x, y });
  };

  // Mobile touch handlers for adding nodes
  const handleCanvasTap = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    // Double tap to add a default node (you can customize this)
    const now = Date.now();
    const lastTap = (e.currentTarget as any).lastTap || 0;
    
    if (now - lastTap < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      const x = touch.clientX - rect.left - 60;
      const y = touch.clientY - rect.top - 40;
      
      // Add a default agent node on double tap
      const defaultAgent = {
        type: 'agent',
        name: 'New Agent',
        color: 'bg-blue-500'
      };
      
      onAddNode(defaultAgent, { x, y });
    }
    
    (e.currentTarget as any).lastTap = now;
  };

  if (!workflow) {
    return (
      <div className="flex-1 theme-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Bot className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} theme-text-muted mx-auto mb-4`} />
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold theme-text-primary mb-2`}>
            No Workflow Selected
          </h3>
          <p className={`theme-text-secondary ${isMobile ? 'text-sm' : ''}`}>
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
        const nodeDataString = e.dataTransfer.getData('text/plain');
        if (nodeDataString) {
          const nodeData = JSON.parse(nodeDataString);
          addNodeToCanvas(e, nodeData);
        }
      }}
      onTouchEnd={isMobile ? handleCanvasTap : undefined}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--text-muted) 1px, transparent 1px),
          linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)
        `,
        backgroundSize: isMobile ? '15px 15px' : '20px 20px'
      }}></div>
      
      {/* Empty Canvas Message */}
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} theme-card-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed theme-border`}>
              <Bot className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} theme-text-muted`} />
            </div>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold theme-text-primary mb-2`}>
              {isMobile ? 'Tap menu to add agents' : 'Drag agents here to build your workflow'}
            </h3>
            <p className={`theme-text-secondary ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile 
                ? 'Use the menu button to open agents panel and tap agents to add them'
                : 'Select agents from the left panel and drag them onto the canvas'
              }
            </p>
            {isMobile && (
              <p className="theme-text-muted text-xs mt-2">
                Double-tap empty space to add a new agent
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Nodes */}
      <div className={isMobile ? 'p-2' : ''}>
        {workflow.nodes.map((node: WorkflowNode) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onClick={() => onSelectNode(node.id)}
            onDelete={onDeleteNode}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowNodeComponent({ 
  node, 
  isSelected, 
  onClick, 
  onDelete,
  isMobile = false
}: {
  node: WorkflowNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (nodeId: string) => void;
  isMobile?: boolean;
}) {
  return (
    <div 
      className={`absolute cursor-pointer group ${isSelected ? 'z-10' : 'z-0'}`}
      style={{ left: node.x, top: node.y }}
      onClick={onClick}
    >
      <div className={`relative theme-card-bg rounded-lg border-2 transition-all theme-shadow ${
        isMobile ? 'p-3 min-w-[120px]' : 'p-4 min-w-[140px]'
      } ${
        isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'theme-border hover:border-gray-400'
      }`}>
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
          <div className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg bg-blue-500`}>
            <Bot className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`theme-text-primary font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {node.label}
            </div>
            <div className={`theme-text-muted ${isMobile ? 'text-xs' : 'text-xs'}`}>
              Agent
            </div>
          </div>
        </div>
        
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className={`absolute ${isMobile ? '-top-1 -right-1 w-5 h-5' : '-top-2 -right-2 w-6 h-6'} bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors touch-manipulation`}
          >
            <X className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`} />
          </button>
        )}
      </div>
    </div>
  );
}