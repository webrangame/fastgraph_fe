'use client';

import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { WorkflowTabs } from '@/components/workflows/WorkflowTabs';
import { AgentSidebar } from '@/components/workflows/AgentSidebar';
import { PromptInput } from '@/components/workflows/PromptInput';
import { MobileWorkflowHeader } from '@/components/workflows/mobile/MobileWorkflowHeader';
import { MobileAgentDrawer } from '@/components/workflows/mobile/MobileAgentDrawer';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { usePromptHandler } from '@/hooks/usePromptHandler';
import { Play, Square, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    workflows,
    activeWorkflow,
    currentWorkflow,
    selectedNode,
    isRunning,
    setActiveWorkflow,
    setSelectedNode,
    createNewWorkflow,
    closeWorkflow,
    deleteWorkflow,
    executeWorkflow,
    stopWorkflow,
    addNodeToWorkflow,
    deleteNode
  } = useWorkflowManager();

  const { handlePromptSubmit, isProcessing } = usePromptHandler({
    currentWorkflow,
    selectedNode,
    addNodeToWorkflow,
    deleteNode,
    executeWorkflow
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getExecuteButtonProps = () => ({
    onClick: isRunning ? stopWorkflow : executeWorkflow,
    disabled: !currentWorkflow || (!isRunning && currentWorkflow.nodes.length === 0),
    variant: isRunning ? 'danger' as const : 'success' as const,
    icon: isRunning ? Square : Play,
    children: isRunning ? 'Stop' : 'Execute'
  });

  const handleSave = () => {
    console.log('Saving workflow...', currentWorkflow);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileAgentSelect = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen theme-bg flex flex-col transition-colors duration-300">
      
      {/* Mobile Header - Only visible on mobile */}
      {isMobile ? (
        <MobileWorkflowHeader
          workflows={workflows}
          activeWorkflow={activeWorkflow}
          currentWorkflow={currentWorkflow}
          isRunning={isRunning}
          onMenuToggle={handleMobileMenuToggle}
          onCreateNew={createNewWorkflow}
          onSelectWorkflow={setActiveWorkflow}
          onExecute={executeWorkflow}
          onStop={stopWorkflow}
          onSave={handleSave}
          onDelete={deleteWorkflow}
          menuOpen={mobileMenuOpen}
        />
      ) : (
        /* Desktop Header - Hidden on mobile */
        <header className="theme-header-bg theme-border border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold theme-text-primary">
                Workflow Builder
              </h1>
              {currentWorkflow && (
                <div className="flex items-center space-x-2">
                  <StatusIndicator status={currentWorkflow.status} />
                  <span className="text-sm theme-text-muted capitalize">
                    {currentWorkflow.status}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button {...getExecuteButtonProps()} />
              <Button 
                variant="primary" 
                icon={Save} 
                disabled={!currentWorkflow}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button 
                variant="danger" 
                icon={Trash2}
                onClick={deleteWorkflow}
                disabled={!currentWorkflow}
              >
                Delete
              </Button>
            </div>
          </div>
          
          <WorkflowTabs
            workflows={workflows}
            activeWorkflow={activeWorkflow}
            onSelectWorkflow={setActiveWorkflow}
            onCloseWorkflow={closeWorkflow}
            onCreateNew={createNewWorkflow}
            maxWorkflows={5}
          />
        </header>
      )}

      {/* Mobile Agent Drawer */}
      {isMobile && (
        <MobileAgentDrawer 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Agent Sidebar - Hidden on mobile */}
        {!isMobile && (
          <AgentSidebar />
        )}
        
        {/* Workflow Canvas - Responsive */}
        <WorkflowCanvas 
          workflow={currentWorkflow}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onDeleteNode={deleteNode}
          onAddNode={addNodeToWorkflow}
        />
      </div>

      {/* Prompt Input - Mobile optimized */}
      <PromptInput 
        onSubmit={handlePromptSubmit}
        isProcessing={isProcessing}
        isMobile={isMobile}
      />
    </div>
  );
}