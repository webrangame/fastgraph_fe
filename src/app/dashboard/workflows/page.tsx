'use client';

import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { WorkflowsSidebar } from '@/components/workflows/WorkflowsSidebar';
import { PromptInput } from '@/components/workflows/PromptInput';
import { MobileAgentDrawer } from '@/components/workflows/mobile/MobileAgentDrawer';
import { WorkflowHeader } from '@/components/workflows/WorkflowHeader';
import { useWorkflowManager } from '@/hooks/workflows/useWorkflowManager';
import { usePromptHandler } from '@/hooks/workflows/usePromptHandler';
import { useAutoOrchestrate } from '@/hooks/workflows/useAutoOrchestrate';
import { useEvolveAgentMutation } from '../../../../redux/api/evolveAgent/evolveAgentApi';
import { WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';
import { useDispatch, useSelector } from 'react-redux';
import { addWorkflow, removeAllWorkflows, updateWorkflow, removeWorkflow, setWorkflows } from '@/redux/slice/workflowSlice';
import { useGetDataCreatedByQuery, useInstallDataMutation } from '../../../../redux/api/autoOrchestrate/autoOrchestrateApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { processAgentsFromResponse } from '@/services/workflows/agentProcessor';

export default function WorkflowsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agents, setAgents] = useState<Record<string, any> | null>(null);
  const [connections, setConnections] = useState<any[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);
  const [finalizedArtifactLinks, setFinalizedArtifactLinks] = useState<any[]>([]);
  const [cachedExecutionResults, setCachedExecutionResults] = useState<any>(null);
  const [installData, { isLoading: isInstalling } ] = useInstallDataMutation();
  // Undo functionality state
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  

  // Custom hooks for workflow management
  const { workflows, workflowStatus, workflowError } = useSelector((state: any) => state.workflows);
  const currentUser = useSelector((state: any) => state.auth.user);
  
  // Fetch workflows from API and load into Redux store
  const { 
    data: apiWorkflowData, 
    error: apiError, 
    isLoading: isLoadingWorkflows 
  } = useGetDataCreatedByQuery(currentUser?.id || currentUser?.userId || "1", {
    skip: !currentUser?.id && !currentUser?.userId // Skip if no user ID
  });

  // Evolution API
  const [evolveAgent, { isLoading: isEvolving }] = useEvolveAgentMutation();
  
  // Memoize the callback to prevent infinite re-renders
  const handleAgentsProcessed = useCallback((processedAgents: Record<string, any>, processedConnections: any[], processedFinalData?: any) => {
    setAgents(processedAgents);
    setConnections(processedConnections);
    setFinalData(processedFinalData);
  }, []);
  
  const { isAutoOrchestrating, finalizedResult: orchestratedFinalizedResult, finalizedArtifactLinks: orchestratedFinalizedArtifactLinks, executionResults, resetAutoOrchestrate } = useAutoOrchestrate({
    workflows,
    onAgentsProcessed: handleAgentsProcessed
  });
  
  console.log('🔍 Dashboard Debug:', {
    localFinalizedArtifactLinksLength: finalizedArtifactLinks?.length,
    orchestratedFinalizedArtifactLinksLength: orchestratedFinalizedArtifactLinks?.length,
    finalPassedToCanvas: (finalizedArtifactLinks || orchestratedFinalizedArtifactLinks)?.length
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
  
  // Find the current workflow from the correct source - no default selection
  const actualCurrentWorkflow = displayWorkflows.find((w: any) => w.id === activeWorkflow) || null;
  
  // Handle workflow selection from sidebar - replace current workflow entirely (SINGLE TAB MODE)
  const handleSidebarWorkflowSelect = useCallback(async (workflowId: string) => {
    console.log('=== WORKFLOW SELECTION START ===');
    console.log('Sidebar workflow selected:', workflowId);
    console.log('Current active workflow:', activeWorkflow);
    console.log('Current agents:', agents ? Object.keys(agents) : 'null');
    console.log('Current connections:', connections ? connections.length : 'null');
    console.log('Current workflows in Redux:', workflows.length);
    
    // FORCE COMPLETE STATE RESET
    console.log('🧹 CLEARING ALL STATE...');
    
    // Clear active workflow first
    setActiveWorkflow(null);
    
    // Clear all canvas data
    setAgents(null);
    setConnections(null);
    setFinalData(null);
    setFinalizedResult(null);
    setCachedExecutionResults(null);
    
    // Clear Redux workflows
    dispatch(removeAllWorkflows());
    
    // Wait a moment for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find the selected workflow from API data
    if (apiWorkflowData && Array.isArray(apiWorkflowData)) {
      const selectedApiItem = apiWorkflowData.find((item: any) => item.dataId === workflowId);
      
      if (selectedApiItem && selectedApiItem.dataContent?.autoOrchestrateResult) {
        const workflowData = selectedApiItem.dataContent.autoOrchestrateResult;

        // Build agents and connections from cached autoOrchestrate result
        console.log('🔍 Existing Workflow - workflowData structure:', {
          workflowDataKeys: Object.keys(workflowData),
          hasFinalizedArtifactLinks: !!workflowData?.finalizedArtifactLinks,
          finalizedArtifactLinksLength: workflowData?.finalizedArtifactLinks?.length,
          workflowData: workflowData
        });
        
        const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult, finalizedArtifactLinks: processedFinalizedArtifactLinks, executionResults: processedExecutionResults } = processAgentsFromResponse(workflowData);
        
        console.log('🔍 Existing Workflow - processed result:', {
          processedFinalizedArtifactLinksLength: processedFinalizedArtifactLinks?.length,
          processedFinalizedArtifactLinks: processedFinalizedArtifactLinks
        });
        
        // Create the workflow object with reconstructed nodes/connections so hooks detect existing structure
        const reconstructedNodes = Object.entries(processedAgents || {}).map(([agentName, agentData]: [string, any]) => ({
          id: `agent-${agentName}`,
          data: {
            label: agentData.name || agentName,
            role: agentData.role || 'Agent',
            capabilities: agentData.capabilities || [],
            inputs: agentData.inputs || [],
            outputs: agentData.outputs || [],
            logs: agentData.logs || [],
            ...agentData
          }
        }));
        
        const selectedWorkflow = {
          id: selectedApiItem.dataId,
          name: selectedApiItem.dataName,
          description: selectedApiItem.description,
          status: selectedApiItem.status,
          lastModified: new Date(selectedApiItem.installedAt).toLocaleString(),
          nodes: reconstructedNodes,
          connections: processedConnections || []
        };
        
        console.log('🔄 LOADING NEW WORKFLOW:', selectedWorkflow.name);
        console.log('Workflow nodes:', selectedWorkflow.nodes?.length || 0);
        console.log('Workflow connections:', selectedWorkflow.connections?.length || 0);
        
        // SINGLE TAB MODE: Set only this workflow in Redux store
        console.log('📝 Setting workflow in Redux store...');
        dispatch(setWorkflows([selectedWorkflow]));
        
        // Set the selected workflow as active
        console.log('🎯 Setting active workflow:', workflowId);
        setActiveWorkflow(workflowId);
        
        // Load the new workflow data into canvas directly from processed results (no external API)
        if (processedAgents && Object.keys(processedAgents).length > 0) {
          console.log('🤖 LOADING AGENTS:', Object.keys(processedAgents));
          setAgents(processedAgents);
          console.log('✅ Agents set in state');
        }
        
        if (processedConnections && processedConnections.length > 0) {
          // Transform to canvas edge style
          const workflowConnections = processedConnections.map((conn: any, index: number) => ({
            id: conn.id || `${conn.source}-to-${conn.target}` || `connection-${index}`,
            source: conn.source,
            target: conn.target,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#6366f1',
              strokeWidth: 2,
            }
          }));
          console.log('🔗 LOADING CONNECTIONS:', workflowConnections.length);
          setConnections(workflowConnections);
          console.log('✅ Connections set in state');
        }
        
        // Save final data and execution results for the sidebars
        if (processedFinalData) {
          setFinalData(processedFinalData);
        }
        if (processedFinalizedResult) {
          setFinalizedResult(processedFinalizedResult);
        }
        if (processedFinalizedArtifactLinks) {
          setFinalizedArtifactLinks(processedFinalizedArtifactLinks);
        }
        if (processedExecutionResults) {
          setCachedExecutionResults(processedExecutionResults);
        }
        
        console.log('🎉 WORKFLOW LOADING COMPLETE');
        console.log('=== WORKFLOW SELECTION END ===');
        
        toast.success(`Loaded workflow: ${selectedWorkflow.name}`, {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        });
      } else {
        console.log('Workflow not found in API data');
        toast.error('Workflow not found');
      }
    } else {
      console.log('No API data available');
      toast.error('No workflow data available');
    }
  }, [apiWorkflowData, setActiveWorkflow, dispatch]);

  // Handle tab selection - also replace workflow entirely (same behavior as sidebar)
  const handleTabWorkflowSelect = useCallback((workflowId: string) => {
    console.log('Tab workflow selected:', workflowId);
    // Use the same replacement logic as sidebar
    handleSidebarWorkflowSelect(workflowId);
  }, [handleSidebarWorkflowSelect]);

  // Update undo availability
  useEffect(() => {
    setCanUndo(undoStack.length > 0);
  }, [undoStack]);

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
      // Update Redux store with the current workflow
      dispatch(updateWorkflow(actualCurrentWorkflow));
      toast.success('Workflow saved successfully!');
    }
  };

  const handleDeleteWorkflow = (workflowId?: string) => {
    const idToDelete = workflowId || actualCurrentWorkflow?.id;
    if (idToDelete) {
      // Remove from Redux store
      dispatch(removeWorkflow(idToDelete));
      setAgents(null);
      setConnections(null);
    }
    originalDeleteWorkflow();
  };

  const handleClearWorkflowData = () => {
    // Clear all workflows from Redux store
    dispatch(removeAllWorkflows());
    // Also clear auto orchestrate state manually
    if (resetAutoOrchestrate) {
      resetAutoOrchestrate();
    }
    toast.success('Workflow data cleared successfully!');
  };

  const handleCloseWorkflow = (workflowId: string) => {
    if (workflows.length > 0) {
      // If using Redux workflows, delete from Redux store
      dispatch(removeWorkflow(workflowId));
      
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

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Undo functionality
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      
      // Remove the last action from the stack
      setUndoStack(prev => prev.slice(0, -1));
      
      // Show a toast message
      toast.success(`Undid: ${lastAction.description || 'Last action'}`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      });
      
      console.log('Undo action:', lastAction);
    }
  };

  // Function to add action to undo stack
  const addToUndoStack = (action: { type: string; description: string; data?: any }) => {
    setUndoStack(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const handleWorkflowSubmit = async (data: WorkflowFormData) => {
    console.log('Creating workflow with command:', data);
    try {
      // 🧹 Clear existing workflow/state (single tab mode)
      setActiveWorkflow(null);
      setAgents(null);
      setConnections(null);
      setFinalData(null);
      setFinalizedResult(null);
      setFinalizedArtifactLinks([]);
      setCachedExecutionResults(null);
      if (resetAutoOrchestrate) {
        resetAutoOrchestrate();
      }
      dispatch(removeAllWorkflows());

      // Prepare a new workflow shell
      const newWorkflowId = Date.now().toString();
      const workflowData = {
        id: newWorkflowId,
        name: data.name,
        // Use the command directly so auto-orchestrate receives a clean prompt
        description: data.description,
        status: 'draft' as const,
        lastModified: 'Just now',
        nodes: [],
        connections: []
      };

      // 📡 Persist an initial record (overwrite: true)
      await installData({
        dataName: data.name,
        description: data.description,
        dataType: 'json',
        dataContent: {
          command: data.description
        },
        overwrite: true
      }).unwrap();

      // 🎯 Load as the only active workflow (single tab)
      dispatch(setWorkflows([workflowData]));
      setActiveWorkflow(newWorkflowId);

      // Add to undo stack
      addToUndoStack({
        type: 'CREATE_WORKFLOW',
        description: `Created workflow "${data.name}"`,
        data: { workflowId: workflowData.id, workflowData }
      });

      // 🤖 Auto-orchestration will start via useAutoOrchestrate effect
      toast.success('Workflow created! Auto-orchestration starting...');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow. Please try again.');
    }
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
        onSelectWorkflow={handleTabWorkflowSelect}
        onCloseWorkflow={handleCloseWorkflow}
        onCreateNew={createNewWorkflow}
        onCreateWithModal={handleWorkflowSubmit}
        onUndo={handleUndo}
        canUndo={canUndo}
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
            handleSidebarWorkflowSelect(workflowId);
            setMobileMenuOpen(false);
          }}
          currentWorkflowId={activeWorkflow || undefined}
        />
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Workflow Sidebar - Hidden on mobile */}
        {!isMobile && (
          <WorkflowsSidebar 
            onWorkflowSelect={handleSidebarWorkflowSelect}
            currentWorkflowId={activeWorkflow || undefined}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
            userId={currentUser?.id || currentUser?.userId || "1"} // Get user ID from auth slice
          />
        )}
        
        {/* Workflow Canvas - Responsive */}
        <WorkflowCanvas
          key={`canvas-${activeWorkflow || 'empty'}-${agents ? Object.keys(agents).length : 0}`}
          workflow={actualCurrentWorkflow}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onDeleteNode={deleteNode}
          onAddNode={addNodeToWorkflow}
          agents={agents || undefined}
          connections={connections || undefined}
          isAutoOrchestrating={isAutoOrchestrating || isLoadingWorkflows}
          onAgentFeedback={handleAgentFeedback}
          finalData={finalData}
          finalizedResult={finalizedResult || orchestratedFinalizedResult}
          finalizedArtifactLinks={finalizedArtifactLinks || orchestratedFinalizedArtifactLinks}
          executionResults={cachedExecutionResults || executionResults}
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