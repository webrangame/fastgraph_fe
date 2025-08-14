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
import { useSelector, useDispatch } from 'react-redux';
import { setWorkflows, addWorkflow, removeWorkflow, updateWorkflow } from '@/redux/slice/workflowSlice';
import { RootState } from '@/types/redux';
import { useAutoOrchestrateMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';

export default function WorkflowsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Redux state
  const dispatch = useDispatch();
  const reduxWorkflows = useSelector((state: RootState) => state.workflows.workflows);
  const workflowStatus = useSelector((state: RootState) => state.workflows.status);
  const workflowError = useSelector((state: RootState) => state.workflows.error);

  console.log('reduxWorkflows', reduxWorkflows[0]?.description);

  const [autoOrchestrate, { 
    isLoading: isAutoOrchestrating, 
    error: autoOrchestrateError,
    data: autoOrchestrateData 
  }] = useAutoOrchestrateMutation();

   useEffect(() => {
    const loadWorkflows = async () => {
      try {
        // If you have an API to load workflows, call it here
        // For now, we'll check if Redux store has workflows
        if (reduxWorkflows.length > 0) {
          console.log('Loading workflows from Redux store:', reduxWorkflows);
          
          // Auto orchestrate with first workflow's description
          const firstWorkflowDescription = reduxWorkflows[0]?.description;
          if (firstWorkflowDescription) {
            console.log('Auto orchestrating with command:', firstWorkflowDescription);
            try {
              const result = await autoOrchestrate({ 
                command: firstWorkflowDescription 
              }).unwrap();
              console.log('Auto orchestrate result:', result);
              // Handle the result as needed (e.g., update workflow, show notification, etc.)
            } catch (error) {
              console.error('Auto orchestrate failed:', error);
            }
          }
          
          // You might need to sync these with your workflow manager
          // This depends on how your useWorkflowManager hook works
        } 
      } catch (error) {
        console.error('Error loading workflows:', error);
      }
    };

    loadWorkflows();
  }, [dispatch, reduxWorkflows.length, autoOrchestrate]);



  const {
    workflows,
    activeWorkflow,
    currentWorkflow,
    selectedNode,
    isRunning,
    setActiveWorkflow,
    setSelectedNode,
    createNewWorkflow: originalCreateNewWorkflow,
    closeWorkflow,
    deleteWorkflow: originalDeleteWorkflow,
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

  // Load workflows from Redux store on component mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        // If you have an API to load workflows, call it here
        // For now, we'll check if Redux store has workflows
        if (reduxWorkflows.length > 0) {
          console.log('Loading workflows from Redux store:', reduxWorkflows);
          // You might need to sync these with your workflow manager
          // This depends on how your useWorkflowManager hook works
        } else {
          // Load workflows from API or localStorage
          const storedWorkflows = localStorage.getItem('workflows');
          if (storedWorkflows) {
            const parsedWorkflows = JSON.parse(storedWorkflows);
            dispatch(setWorkflows(parsedWorkflows));
          }
        }
      } catch (error) {
        console.error('Error loading workflows:', error);
      }
    };

    loadWorkflows();
  }, [dispatch, reduxWorkflows.length]);

  // Sync Redux workflows with workflow manager when Redux state changes
  useEffect(() => {
    if (reduxWorkflows.length > 0) {
      // You might need to update this based on how your useWorkflowManager works
      // This is a placeholder for syncing the workflows
      console.log('Syncing Redux workflows with workflow manager:', reduxWorkflows);
    }
  }, [reduxWorkflows]);

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
    if (currentWorkflow) {
      // Save to Redux store
      dispatch(updateWorkflow(currentWorkflow));
      
      // Also save to localStorage for persistence
      const updatedWorkflows = reduxWorkflows.map((w: any) =>
        w.id === currentWorkflow.id ? currentWorkflow : w
      );
      if (!reduxWorkflows.find((w: any) => w.id === currentWorkflow.id)) {
        updatedWorkflows.push(currentWorkflow);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
    }
  };

  const createNewWorkflow = () => {
    originalCreateNewWorkflow();
    // The useWorkflowManager hook doesn't return a value from createNewWorkflow
    // We'll need to get the new workflow from the state or create it here
  };

  const deleteWorkflow = (workflowId?: string) => {
    // Remove from Redux store
    const idToDelete = workflowId || currentWorkflow?.id;
    if (idToDelete) {
      dispatch(removeWorkflow(idToDelete));
      
      // Also remove from localStorage
      const updatedWorkflows = reduxWorkflows.filter((w: any) => w.id !== idToDelete);
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
    }
    
    // Call original delete function
    originalDeleteWorkflow();
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
          workflows={reduxWorkflows.length > 0 ? reduxWorkflows : workflows}
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
              {workflowStatus === 'loading' && (
                <span className="text-sm theme-text-muted">Loading workflows...</span>
              )}
              {workflowError && (
                <span className="text-sm text-red-500">Error: {workflowError}</span>
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
                onClick={() => deleteWorkflow()}
                disabled={!currentWorkflow}
              >
                Delete
              </Button>
            </div>
          </div>
          
          <WorkflowTabs
            workflows={reduxWorkflows.length > 0 ? reduxWorkflows : workflows}
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