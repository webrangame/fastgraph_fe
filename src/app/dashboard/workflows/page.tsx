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
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agents, setAgents] = useState<Record<string, any> | null>(null);
  const [connections, setConnections] = useState<any[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);

  // Custom hooks for workflow management
  const { workflows, workflowStatus, workflowError, saveWorkflow, deleteWorkflowById } = useWorkflowPersistence();
  
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

  const { handlePromptSubmit, isProcessing } = usePromptHandler({
    currentWorkflow,
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
    if (currentWorkflow) {
      saveWorkflow(currentWorkflow);
    }
  };

  const handleDeleteWorkflow = (workflowId?: string) => {
    const idToDelete = workflowId || currentWorkflow?.id;
    if (idToDelete) {
      deleteWorkflowById(idToDelete);
      setAgents(null);
      setConnections(null);
    }
    originalDeleteWorkflow();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

  // Use Redux workflows if available, otherwise fallback to workflow manager
  const displayWorkflows = workflows.length > 0 ? workflows : workflowManagerWorkflows;

  return (
    <div className="h-screen theme-bg flex flex-col transition-colors duration-300">
      
      <WorkflowHeader
        isMobile={isMobile}
        currentWorkflow={currentWorkflow}
        workflows={displayWorkflows}
        activeWorkflow={activeWorkflow}
        workflowStatus={workflowStatus}
        workflowError={workflowError}
        isAutoOrchestrating={isAutoOrchestrating}
        agentCount={agents ? Object.keys(agents).length : 0}
        isRunning={isRunning}
        mobileMenuOpen={mobileMenuOpen}
        onSelectWorkflow={setActiveWorkflow}
        onCloseWorkflow={closeWorkflow}
        onCreateNew={createNewWorkflow}
        onExecute={executeWorkflow}
        onStop={stopWorkflow}
        onSave={handleSave}
        onDelete={handleDeleteWorkflow}
        onMenuToggle={handleMobileMenuToggle}
      />

      {/* Mobile Agent Drawer */}
      {isMobile && (
        <MobileAgentDrawer 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          agents={agents || undefined}
        />
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Agent Sidebar - Hidden on mobile */}
        {!isMobile && (
          <AgentSidebar agents={agents || undefined} />
        )}
        
        {/* Workflow Canvas - Responsive */}
        <WorkflowCanvas
          workflow={currentWorkflow}
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