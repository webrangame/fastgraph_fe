'use client';

import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { AgentSidebar } from '@/components/workflows/AgentSidebar';
import { PromptInput } from '@/components/workflows/PromptInput';
import { MobileAgentDrawer } from '@/components/workflows/mobile/MobileAgentDrawer';
import { WorkflowHeader } from '@/components/workflows/WorkflowHeader';
import { useWorkflowManager } from '@/hooks/workflows/useWorkflowManager';
import { usePromptHandler } from '@/hooks/workflows/usePromptHandler';
import { useAutoOrchestrate } from '@/hooks/workflows/useAutoOrchestrate';
import { useWorkflowPersistence } from '@/hooks/workflows/useWorkflowPersistence';
import { useEvolveAgentMutation } from '../../../../redux/api/evolveAgent/evolveAgentApi';
import { WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';
import { useDispatch } from 'react-redux';
import { addWorkflow, removeAllWorkflows } from '@/redux/slice/workflowSlice';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agents, setAgents] = useState<Record<string, any> | null>(null);
  const [connections, setConnections] = useState<any[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);

  // Custom hooks for workflow management
  const { workflows, workflowStatus, workflowError, saveWorkflow, saveAutoOrchestrateWorkflow, deleteWorkflowById, isSaving } = useWorkflowPersistence();
  
  // Evolution API
  const [evolveAgent, { isLoading: isEvolving }] = useEvolveAgentMutation();
  
  // Memoize the callback to prevent infinite re-renders
  const handleAgentsProcessed = useCallback((processedAgents: Record<string, any>, processedConnections: any[], processedFinalData?: any) => {
    setAgents(processedAgents);
    setConnections(processedConnections);
    setFinalData(processedFinalData);
  }, []);
  
  const { isAutoOrchestrating, finalizedResult: orchestratedFinalizedResult, executionResults } = useAutoOrchestrate({
    workflows,
    onAgentsProcessed: handleAgentsProcessed
  });

  const {
    workflows: workflowManagerWorkflows,
    activeWorkflow,
    currentWorkflow,
    selectedNode,
    isRunning,
    setActiveWorkflow,
    setSelectedNode,
    createNewWorkflow,
    closeWorkflow,
    deleteWorkflow: originalDeleteWorkflow,
    executeWorkflow,
    stopWorkflow,
    addNodeToWorkflow,
    deleteNode
  } = useWorkflowManager();

  // Use Redux workflows if available, otherwise fallback to workflow manager
  const displayWorkflows = workflows.length > 0 ? workflows : workflowManagerWorkflows;
  
  // Find the current workflow from the correct source
  const actualCurrentWorkflow = displayWorkflows.find((w: any) => w.id === activeWorkflow) || 
                                (displayWorkflows.length > 0 ? displayWorkflows[0] : null);
  
  // Auto-select first workflow if none is active and workflows are available
  useEffect(() => {
    if (displayWorkflows.length > 0 && !activeWorkflow) {
      setActiveWorkflow(displayWorkflows[0].id);
    }
  }, [displayWorkflows, activeWorkflow, setActiveWorkflow]);

  const { handlePromptSubmit, isProcessing } = usePromptHandler({
    currentWorkflow: actualCurrentWorkflow,
    selectedNode,
    addNodeToWorkflow,
    deleteNode,
    executeWorkflow
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Event handlers
  const handleSave = () => {
    if (actualCurrentWorkflow) {
      saveWorkflow(actualCurrentWorkflow);
    }
  };

  const handleDeleteWorkflow = (workflowId?: string) => {
    const idToDelete = workflowId || actualCurrentWorkflow?.id;
    if (idToDelete) {
      deleteWorkflowById(idToDelete);
      setAgents(null);
      setConnections(null);
    }
    originalDeleteWorkflow();
  };

  const handleCloseWorkflow = (workflowId: string) => {
    if (workflows.length > 0) {
      // If using Redux workflows, delete from Redux and localStorage
      deleteWorkflowById(workflowId);
      
      // Update active workflow if the closed one was active
      if (activeWorkflow === workflowId) {
        const remainingWorkflows = workflows.filter((w: any) => w.id !== workflowId);
        setActiveWorkflow(remainingWorkflows[0]?.id || null);
      }
    } else {
      // Fall back to workflow manager for local workflows
      closeWorkflow(workflowId);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleWorkflowSubmit = (data: WorkflowFormData) => {
    console.log('Creating workflow:', data);
    
    // Create workflow data that matches the Workflow interface
    const workflowData = {
      id: Date.now().toString(),
      name: data.name,
      description: `${data.description} (Type: ${data.type})`,
      status: 'draft' as const,
      lastModified: 'Just now',
      nodes: [],
      connections: []
    };
    
    // Add to Redux store (don't remove existing workflows)
    dispatch(addWorkflow(workflowData));
    
    // Set the new workflow as active
    setActiveWorkflow(workflowData.id);
    
    toast.success('Workflow created successfully!');
  };

  const handleAgentFeedback = async (agentId: string, agentName: string, action?: string, feedback?: string | string[]) => {
    console.log('Feedback action:', action, 'for agent:', { agentId, agentName }, 'feedback:', feedback);
    
    if (action === 'save') {
      // Save feedback to database/API
      console.log('Saving feedback to system...');
      // You can implement API call here to save feedback
      // Example: await saveFeedbackAPI(agentId, feedback);
      toast.success('Feedback saved successfully!');
    } else if (action === 'evolve') {
      try {
        // Use feedback to evolve/improve the agent
        console.log('Evolving agent based on feedback...');
        
        // Extract workflowId - for now using a default, but this should come from the auto-orchestrate response
        const workflowId = "poetry_swarm"; // This should be dynamic based on current workflow
        
        const result = await evolveAgent({
          workflowId,
          agentName: agentName.replace('agent-', ''), // Remove agent- prefix if present
          feedbacks: Array.isArray(feedback) ? feedback : [feedback || ''],
          evolutionMode: 'fast_auto_evolution'
        }).unwrap();

        if (result.evolutionResults === "Success") {
          toast.success(`Agent "${agentName}" evolved successfully!`, {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          });
        }
      } catch (error) {
        console.error('Evolution failed:', error);
        toast.error('Failed to evolve agent. Please try again.', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        });
      }
    } else {
      // Legacy handling for backward compatibility
      console.log('Legacy feedback request - opening popup');
    }
  };

  return (
    <div className="h-screen theme-bg flex flex-col transition-colors duration-300">
      
      <WorkflowHeader
        isMobile={isMobile}
        currentWorkflow={actualCurrentWorkflow}
        workflows={displayWorkflows}
        activeWorkflow={activeWorkflow}
        workflowStatus={workflowStatus}
        workflowError={workflowError}
        isAutoOrchestrating={isAutoOrchestrating}
        agentCount={agents ? Object.keys(agents).length : 0}
        isRunning={isRunning}
        mobileMenuOpen={mobileMenuOpen}
        onSelectWorkflow={setActiveWorkflow}
        onCloseWorkflow={handleCloseWorkflow}
        onCreateNew={createNewWorkflow}
        onCreateWithModal={handleWorkflowSubmit}
        onExecute={executeWorkflow}
        onStop={stopWorkflow}
        onSave={handleSave}
        onDelete={handleDeleteWorkflow}
        onMenuToggle={handleMobileMenuToggle}
      />

      {/* Mobile Workflow Drawer */}
      {isMobile && (
        <MobileAgentDrawer 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onWorkflowSelect={(workflowId: string) => {
            setActiveWorkflow(workflowId);
            setMobileMenuOpen(false);
          }}
          currentWorkflowId={activeWorkflow || undefined}
        />
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Workflow Sidebar - Hidden on mobile */}
        {!isMobile && (
          <AgentSidebar 
            onWorkflowSelect={setActiveWorkflow}
            currentWorkflowId={activeWorkflow || undefined}
          />
        )}
        
        {/* Workflow Canvas - Responsive */}
        <WorkflowCanvas
          workflow={actualCurrentWorkflow}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onDeleteNode={deleteNode}
          onAddNode={addNodeToWorkflow}
          agents={agents || undefined}
          connections={connections || undefined}
          isAutoOrchestrating={isAutoOrchestrating}
          onAgentFeedback={handleAgentFeedback}
          finalData={finalData}
          finalizedResult={orchestratedFinalizedResult}
          executionResults={executionResults}
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