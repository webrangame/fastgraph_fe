'use client';

import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { WorkflowTabs } from '@/components/workflows/WorkflowTabs';
import { AgentSidebar } from '@/components/workflows/AgentSidebar';
import { PromptInput } from '@/components/workflows/PromptInput';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useWorkflowManager } from '@/hooks/useWorkflowManager';
import { usePromptHandler } from '@/hooks/usePromptHandler';
import { Play, Square, Save, Trash2 } from 'lucide-react';

export default function WorkflowsPage() {
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

  const getExecuteButtonProps = () => ({
    onClick: isRunning ? stopWorkflow : executeWorkflow,
    disabled: !currentWorkflow || (!isRunning && currentWorkflow.nodes.length === 0),
    variant: isRunning ? 'danger' as const : 'success' as const,
    icon: isRunning ? Square : Play,
    children: isRunning ? 'Stop' : 'Execute'
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving workflow...', currentWorkflow);
  };

  return (
    <div className="h-screen theme-bg flex flex-col transition-colors duration-300">
      {/* Header */}
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
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <AgentSidebar />
        <WorkflowCanvas 
          workflow={currentWorkflow}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onDeleteNode={deleteNode}
          onAddNode={addNodeToWorkflow}
        />
      </div>

      <PromptInput 
        onSubmit={handlePromptSubmit}
        isProcessing={isProcessing}
      />

    
    </div>
  );
}