'use client';

import { WorkflowCanvas } from '@/components/workflows/WorkflowCanvas';
import { WorkflowsSidebar } from '@/components/workflows/WorkflowsSidebar';
import { PromptInput } from '@/components/workflows/PromptInput';
import { MobileAgentDrawer } from '@/components/workflows/mobile/MobileAgentDrawer';
import { WorkflowHeader } from '@/components/workflows/WorkflowHeader';
import { StreamingProgress } from '@/components/workflows/StreamingProgress';
import { useWorkflowManager } from '@/hooks/workflows/useWorkflowManager';
import { usePromptHandler } from '@/hooks/workflows/usePromptHandler';
import { useAutoOrchestrate } from '@/hooks/workflows/useAutoOrchestrate';
import { useEvolveAgentMutation } from '../../../../redux/api/evolveAgent/evolveAgentApi';
import { WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';
import { useDispatch, useSelector } from 'react-redux';
import { addWorkflow, removeAllWorkflows, updateWorkflow, removeWorkflow, setWorkflows } from '@/redux/slice/workflowSlice';
import { useGetDataCreatedByQuery, useInstallDataMutation, useGetMockAgentDataQuery } from '../../../../redux/api/autoOrchestrate/autoOrchestrateApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { processAgentsFromResponse } from '@/services/workflows/agentProcessor';
import { useAuditLog } from '@/hooks/useAuditLog';
import { generateCustomAgentMockData, generateCustomAgentId } from '@/lib/customAgentMockData';
import { AgentFormData } from '@/components/workflows/NewAgentPopup';

export default function WorkflowsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { logWorkflowAction, logDataAction } = useAuditLog();
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
  const handleAgentsProcessed = useCallback((processedAgents: Record<string, any>, processedConnections: any[], processedFinalData?: any, processedFinalizedArtifactLinks?: any[]) => {
    setAgents(processedAgents);
    setConnections(processedConnections);
    setFinalData(processedFinalData);
    if (processedFinalizedArtifactLinks) {
      setFinalizedArtifactLinks(processedFinalizedArtifactLinks);
    }
  }, []);
  
  const { 
    isAutoOrchestrating, 
    autoOrchestrateError,
    finalizedResult: orchestratedFinalizedResult, 
    finalizedArtifactLinks: orchestratedFinalizedArtifactLinks, 
    executionResults, 
    streamData,
    progress,
    resetAutoOrchestrate,
    startAutoOrchestrate,
    stopAutoOrchestrate
  } = useAutoOrchestrate({
    workflows,
    onAgentsProcessed: handleAgentsProcessed
  });
  
  console.log('🔍 Dashboard Debug:', {
    localFinalizedArtifactLinksLength: finalizedArtifactLinks?.length,
    orchestratedFinalizedArtifactLinksLength: orchestratedFinalizedArtifactLinks?.length,
    finalPassedToCanvas: (finalizedArtifactLinks || orchestratedFinalizedArtifactLinks)?.length,
    localFinalizedArtifactLinks: finalizedArtifactLinks,
    orchestratedFinalizedArtifactLinks: orchestratedFinalizedArtifactLinks,
    agentsCount: agents ? Object.keys(agents).length : 0,
    connectionsCount: connections ? connections.length : 0
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

  // Fetch mock agent data for the current workflow
  const { 
    data: mockAgentData, 
    error: mockAgentError, 
    isLoading: isLoadingMockAgent,
    refetch: refetchMockAgent
  } = useGetMockAgentDataQuery(activeWorkflow, {
    skip: !activeWorkflow // Skip if no active workflow
  });

  // Debug mock agent data changes and handle canvas updates
  useEffect(() => {
    if (activeWorkflow) {
      console.log('🔄 Mock agent data query triggered for workflow:', activeWorkflow);
      console.log('📊 Mock agent data state:', {
        data: mockAgentData,
        error: mockAgentError,
        isLoading: isLoadingMockAgent,
        hasData: !!mockAgentData,
        hasId: mockAgentData?.id ? true : false,
        isArray: Array.isArray(mockAgentData),
        length: Array.isArray(mockAgentData) ? mockAgentData.length : 'not array',
        dataKeys: mockAgentData ? Object.keys(mockAgentData) : 'no data'
      });
      
      if (mockAgentData) {
        console.log('✅ Mock agent data received:', mockAgentData);
        
        // Handle array format
        if (Array.isArray(mockAgentData) && mockAgentData.length > 0) {
          console.log('🎭 UPDATING CANVAS WITH MOCK AGENT DATA (ARRAY FORMAT):', mockAgentData);
          
          // Convert array of agents to individual agents in canvas
          const mockAgents: { [key: string]: any } = {};
          mockAgentData.forEach((agent, index) => {
            const mockAgentId = `mock-agent-${activeWorkflow}-${index}`;
            mockAgents[mockAgentId] = {
              id: mockAgentId,
              name: agent.agentName || `Mock Agent ${index + 1}`,
              role: agent.role || 'validation',
              capabilities: ['analyze', 'validate'],
              inputs: ['data'],
              outputs: ['results'],
              logs: ['initialized'],
              isMockAgent: true,
              workflowId: activeWorkflow,
              originalAgentId: agent.agentId,
              createdAt: agent.createdAt,
              createdBy: agent.createdBy,
              isUserEvolved: agent.isUserEvolved
            };
          });
          
          // Update canvas with mock agents FIRST (priority display)
          setAgents(prevAgents => {
            // Clear any existing mock agents first
            const clearedAgents = Object.fromEntries(
              Object.entries(prevAgents || {}).filter(([key, value]: [string, any]) => !value.isMockAgent)
            );
            
            return {
              ...mockAgents,  // Mock agents FIRST
              ...clearedAgents // Other agents SECOND
            };
          });
          
          console.log('✅ Mock agents updated in canvas (ARRAY FORMAT) - PRIORITY DISPLAY');
          console.log('🎯 Mock agents will appear FIRST in UI:', Object.keys(mockAgents));
        } else if (mockAgentData.id) {
          console.log('🎭 UPDATING CANVAS WITH MOCK AGENT DATA (OBJECT FORMAT):', mockAgentData);
          
          const mockAgentId = `mock-agent-${activeWorkflow}`;
          const mockAgent = {
            id: mockAgentId,
            name: mockAgentData.name || `Mock Agent for ${activeWorkflow}`,
            role: mockAgentData.role || 'validation',
            capabilities: mockAgentData.capabilities || ['analyze', 'validate'],
            inputs: mockAgentData.inputs || ['data'],
            outputs: mockAgentData.outputs || ['results'],
            logs: mockAgentData.logs || ['initialized'],
            isMockAgent: true,
            workflowId: activeWorkflow
          };
          
          // Update canvas with mock agent FIRST (priority display)
          setAgents(prevAgents => {
            // Clear any existing mock agents first
            const clearedAgents = Object.fromEntries(
              Object.entries(prevAgents || {}).filter(([key, value]: [string, any]) => !value.isMockAgent)
            );
            
            return {
              [mockAgentId]: mockAgent, // Mock agent FIRST
              ...clearedAgents // Other agents SECOND
            };
          });
          
          console.log('✅ Mock agent updated in canvas (OBJECT FORMAT) - PRIORITY DISPLAY');
          console.log('🎯 Mock agent will appear FIRST in UI:', mockAgentId);
        }
        
        console.log('🔍 Mock agent data details:', {
          id: mockAgentData.id,
          name: mockAgentData.name,
          role: mockAgentData.role,
          capabilities: mockAgentData.capabilities,
          inputs: mockAgentData.inputs,
          outputs: mockAgentData.outputs,
          logs: mockAgentData.logs
        });
      } else if (mockAgentError) {
        console.log('❌ Mock agent data error:', mockAgentError);
        console.log('❌ Error details:', {
          message: (mockAgentError as any)?.message,
          status: (mockAgentError as any)?.status,
          data: (mockAgentError as any)?.data
        });
      } else {
        console.log('⏳ Mock agent data loading or no data');
      }
    }
  }, [activeWorkflow, mockAgentData, mockAgentError, isLoadingMockAgent]);

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
    console.log('Available API workflow data:', apiWorkflowData?.length || 0);
    
    // Mock agent data will be fetched automatically by the useGetMockAgentDataQuery hook
    console.log('📡 Mock agent data query will be triggered automatically for workflow:', workflowId);
    console.log('🔐 Current user:', currentUser?.id || currentUser?.userId || 'No user');
    console.log('🔐 Auth state:', {
      hasUser: !!currentUser,
      userId: currentUser?.id || currentUser?.userId,
      hasAccessToken: !!currentUser?.accessToken
    });
    
    // FORCE COMPLETE STATE RESET
    console.log('🧹 CLEARING ALL STATE...');
    
    // Clear active workflow first
    setActiveWorkflow(null);
    
    // Clear all canvas data including mock agent data
    setAgents(null);
    setConnections(null);
    setFinalData(null);
    setFinalizedResult(null);
    setCachedExecutionResults(null);
    
    // Clear mock agent data when switching workflows
    console.log('🧹 Clearing mock agent data for workflow switch');
    
    // Clear Redux workflows
    dispatch(removeAllWorkflows());
    
    // Wait a moment for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find the selected workflow from API data
    if (apiWorkflowData && Array.isArray(apiWorkflowData)) {
      const selectedApiItem = apiWorkflowData.find((item: any) => item.dataId === workflowId);
      
      console.log('🔍 Selected API item:', {
        found: !!selectedApiItem,
        dataId: selectedApiItem?.dataId,
        dataName: selectedApiItem?.dataName,
        hasAutoOrchestrateResult: !!selectedApiItem?.dataContent?.autoOrchestrateResult,
        hasRawData: !!selectedApiItem?.dataContent?.rawData,
        dataContentKeys: selectedApiItem?.dataContent ? Object.keys(selectedApiItem.dataContent) : 'no dataContent'
      });
      
      if (selectedApiItem && selectedApiItem.dataContent?.autoOrchestrateResult) {
        const workflowData = selectedApiItem.dataContent.autoOrchestrateResult;
        const rawData = selectedApiItem.dataContent.rawData;

        // Build agents and connections from raw data (not the processed autoOrchestrateResult)
        console.log('🔍 Existing Workflow - rawData structure:', {
          rawDataKeys: rawData ? Object.keys(rawData) : 'no rawData',
          hasAutoOrchestrateResponse: !!rawData?.auto_orchestrate_response,
          autoOrchestrateResponseKeys: rawData?.auto_orchestrate_response ? Object.keys(rawData.auto_orchestrate_response) : 'none',
          rawData: rawData
        });
        
        const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult, finalizedArtifactLinks: processedFinalizedArtifactLinks, executionResults: processedExecutionResults } = processAgentsFromResponse(rawData);
        
        console.log('🔍 Existing Workflow - processed result:', {
          processedFinalizedArtifactLinksLength: processedFinalizedArtifactLinks?.length,
          processedFinalizedArtifactLinks: processedFinalizedArtifactLinks,
          processedAgentsCount: Object.keys(processedAgents).length,
          processedConnectionsCount: processedConnections.length,
          processedFinalDataKeys: processedFinalData ? Object.keys(processedFinalData) : 'no finalData'
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
        let finalAgents = {};
        
        // SECONDARY: Add processed workflow agents if available
        if (processedAgents && Object.keys(processedAgents).length > 0) {
          console.log('🤖 ADDING PROCESSED WORKFLOW AGENTS:', Object.keys(processedAgents));
          finalAgents = {
            ...finalAgents,
            ...processedAgents
          };
          console.log('✅ Processed workflow agents added to canvas');
        }
        
        if (Object.keys(finalAgents).length > 0) {
          console.log('🤖 LOADING AGENTS:', Object.keys(finalAgents));
          setAgents(finalAgents);
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
      
      // Mock agent data will be handled by the useEffect when it's fetched
      console.log('📡 Mock agent data will be handled by useEffect when fetched');
      toast.error('No workflow data available');
    }
  }, [apiWorkflowData, setActiveWorkflow, dispatch, mockAgentData, refetchMockAgent]);

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

  // Function to add action to undo stack
  const addToUndoStack = (action: { type: string; description: string; data?: any }) => {
    setUndoStack(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  // Handle workflow regeneration when new prompt is entered
  const handleWorkflowRegenerate = useCallback(async (prompt: string) => {
    if (!actualCurrentWorkflow) return;
    
    setIsRegenerating(true);
    
    try {
      // Create new workflow data with the new prompt
      const regeneratedWorkflowData = {
        id: actualCurrentWorkflow.id,
        name: actualCurrentWorkflow.name,
        description: prompt,
        status: 'draft' as const,
        lastModified: 'Just now',
        nodes: [],
        connections: []
      };

      // Clear existing state
      setAgents(null);
      setConnections(null);
      setFinalData(null);
      setFinalizedResult(null);
      setFinalizedArtifactLinks([]);
      setCachedExecutionResults(null);
      if (resetAutoOrchestrate) {
        resetAutoOrchestrate();
      }

      // Update the workflow in Redux store
      dispatch(setWorkflows([regeneratedWorkflowData]));

      // Persist the new prompt
      await installData({
        dataName: actualCurrentWorkflow.name,
        description: prompt,
        numberOfAgents: 0,
        dataType: 'json',
        dataContent: {
          command: prompt
        },
        overwrite: true
      }).unwrap();

      // Log the regeneration
      await logDataAction('update', {
        dataName: actualCurrentWorkflow.name,
        description: prompt,
        dataType: 'json',
        numberOfAgents: 0
      });

      await logWorkflowAction('update', regeneratedWorkflowData);

      // Add to undo stack
      addToUndoStack({
        type: 'REGENERATE_WORKFLOW',
        description: `Regenerated workflow "${actualCurrentWorkflow.name}" with new prompt`,
        data: { workflowId: regeneratedWorkflowData.id, workflowData: regeneratedWorkflowData }
      });

      toast.success('Workflow regenerated with new prompt! Auto-orchestration starting...');
      
      // Start auto-orchestration with the new prompt
      await startAutoOrchestrate(prompt);
    } catch (error) {
      console.error('Failed to regenerate workflow:', error);
      toast.error('Failed to regenerate workflow. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [actualCurrentWorkflow, dispatch, installData, logDataAction, logWorkflowAction, resetAutoOrchestrate, addToUndoStack, startAutoOrchestrate]);

  const { handlePromptSubmit, isProcessing } = usePromptHandler({
    currentWorkflow: actualCurrentWorkflow,
    selectedNode,
    addNodeToWorkflow,
    deleteNode,
    executeWorkflow,
    onWorkflowRegenerate: handleWorkflowRegenerate
  });

  // Track regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);

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


  const handleWorkflowSubmit = async (data: WorkflowFormData) => {
    console.log('Creating/regenerating workflow with command:', data);
    try {
      // Check if there's an existing workflow to regenerate
      const existingWorkflow = workflows.find((w: any) => w.name === data.name);
      const isRegenerating = !!existingWorkflow;

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

      // Prepare workflow data (new or regenerated)
      const workflowId = isRegenerating ? existingWorkflow.id : Date.now().toString();
      const workflowData = {
        id: workflowId,
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
        numberOfAgents:0,
        dataType: 'json',
        dataContent: {
          command: data.description
        },
        overwrite: true
      }).unwrap();

      // Log data installation audit
      await logDataAction(isRegenerating ? 'update' : 'create', {
        dataName: data.name,
        description: data.description,
        dataType: 'json',
        numberOfAgents: 0
      });

      // 🎯 Load as the only active workflow (single tab)
      dispatch(setWorkflows([workflowData]));
      setActiveWorkflow(workflowId);

      // Log workflow creation/regeneration audit
      await logWorkflowAction(isRegenerating ? 'update' : 'create', workflowData);

      // Add to undo stack
      addToUndoStack({
        type: isRegenerating ? 'REGENERATE_WORKFLOW' : 'CREATE_WORKFLOW',
        description: isRegenerating ? `Regenerated workflow "${data.name}"` : `Created workflow "${data.name}"`,
        data: { workflowId: workflowData.id, workflowData }
      });

      // Start auto-orchestration with the workflow description
      await startAutoOrchestrate(data.description);
      
      toast.success(isRegenerating ? 'Workflow regenerated! Auto-orchestration starting...' : 'Workflow created! Auto-orchestration starting...');
    } catch (error) {
      console.error('Failed to create/regenerate workflow:', error);
      toast.error('Failed to create/regenerate workflow. Please try again.');
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

  // Handle custom agent creation from NewAgentPopup
  const handleCustomAgentCreate = useCallback(async (data: AgentFormData) => {
    console.log('🎨 Creating custom agent:', data);
    
    try {
      // Use existing mock agent data if available
      if (mockAgentData && Array.isArray(mockAgentData) && mockAgentData.length > 0) {
        console.log('✅ Using existing mock agent data (ARRAY FORMAT):', mockAgentData);
        
        // Use the first agent from the array as template
        const templateAgent = mockAgentData[0];
        const customAgentId = generateCustomAgentId();
        const apiAgentData = {
          id: customAgentId,
          name: data.agentName,
          role: data.description,
          capabilities: ['analyze', 'validate'],
          inputs: ['data'],
          outputs: ['results'],
          logs: ['initialized'],
          isMockAgent: false, // This is a custom agent, not a mock agent
          workflowId: activeWorkflow,
          originalAgentId: templateAgent.agentId,
          createdAt: new Date().toISOString(),
          createdBy: templateAgent.createdBy,
          isUserEvolved: false
        };
        
        console.log('Using existing mock data as template:', apiAgentData);
        console.log('🔍 Mock agent data validation:', {
          isArray: Array.isArray(mockAgentData),
          length: mockAgentData.length,
          templateAgent: templateAgent,
          workflowId: activeWorkflow
        });
        
        // Add the custom agent to the agents state
        setAgents(prevAgents => {
          // Clear any existing mock agents first
          const clearedAgents = Object.fromEntries(
            Object.entries(prevAgents || {}).filter(([key, value]: [string, any]) => !value.isMockAgent)
          );
          
          const newAgents = {
            ...clearedAgents,
            [customAgentId]: apiAgentData
          };
          
          console.log('Updated agents:', Object.keys(newAgents));
          return newAgents;
        });
        
        // Show success toast with purple theme styling
        toast.success(
          <div>
            <div className="font-bold">Custom Agent Created</div>
            <div className="text-sm opacity-90">{data.agentName}</div>
          </div>,
          {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: '#fff',
              border: '1px solid #8b5cf6',
              boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.4)',
            },
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#fff',
            },
          }
        );
        
        // Add to undo stack
        addToUndoStack({
          type: 'customAgentCreate',
          description: `Created custom agent: ${data.agentName}`,
          data: { agentId: customAgentId, agentData: apiAgentData }
        });
        
        console.log('✅ Custom agent added to canvas with existing mock data (ARRAY FORMAT)');
      } else if (mockAgentData && mockAgentData.id) {
        console.log('✅ Using existing mock agent data (OBJECT FORMAT):', mockAgentData);
        
        // Use the existing mock agent data
        const customAgentId = generateCustomAgentId();
        const apiAgentData = {
          ...mockAgentData,
          name: data.agentName,
          role: data.description,
          // Override with form data while keeping API structure
        };
        
        console.log('Using existing mock data:', apiAgentData);
        console.log('🔍 Mock agent data validation:', {
          hasId: !!mockAgentData.id,
          hasName: !!mockAgentData.name,
          hasRole: !!mockAgentData.role,
          workflowId: activeWorkflow
        });
        
        // Add the custom agent to the agents state
        setAgents(prevAgents => {
          // Clear any existing mock agents first
          const clearedAgents = Object.fromEntries(
            Object.entries(prevAgents || {}).filter(([key, value]: [string, any]) => !value.isMockAgent)
          );
          
          const newAgents = {
            ...clearedAgents,
            [customAgentId]: apiAgentData
          };
          
          console.log('Updated agents:', Object.keys(newAgents));
          return newAgents;
        });
        
        // Show success toast with purple theme styling
        toast.success(
          <div>
            <div className="font-bold">Custom Agent Created</div>
            <div className="text-sm opacity-90">{data.agentName}</div>
          </div>,
          {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: '#fff',
              border: '1px solid #8b5cf6',
              boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.4)',
            },
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#fff',
            },
          }
        );
        
        // Add to undo stack
        addToUndoStack({
          type: 'customAgentCreate',
          description: `Created custom agent: ${data.agentName}`,
          data: { agentId: customAgentId, agentData: apiAgentData }
        });
        
        console.log('✅ Custom agent added to canvas with existing mock data (OBJECT FORMAT)');
      } else {
        console.warn('No mock agent data available, falling back to local generation');
        console.log('❌ No valid mock agent data available for workflow:', activeWorkflow);
        console.log('🔍 Mock agent data check:', {
          mockAgentData: mockAgentData,
          hasData: !!mockAgentData,
          isArray: Array.isArray(mockAgentData),
          hasId: mockAgentData?.id ? true : false,
          length: Array.isArray(mockAgentData) ? mockAgentData.length : 'not array'
        });
        
        // Fallback to local generation if API fails
        const customAgentId = generateCustomAgentId();
        const fallbackMockData = generateCustomAgentMockData(data.agentName, data.description);
        
        setAgents(prevAgents => {
          const newAgents = {
            ...prevAgents,
            [customAgentId]: fallbackMockData
          };
          return newAgents;
        });
        
        toast.success(`Custom Agent Created: ${data.agentName}`);
        console.log('✅ Custom agent added to canvas with fallback data');
      }
    } catch (error) {
      console.error('Error fetching mock agent data:', error);
      
      // Fallback to local generation on error
      const customAgentId = generateCustomAgentId();
      const fallbackMockData = generateCustomAgentMockData(data.agentName, data.description);
      
      setAgents(prevAgents => {
        const newAgents = {
          ...prevAgents,
          [customAgentId]: fallbackMockData
        };
        return newAgents;
      });
      
      toast.error('Failed to fetch agent data, using fallback');
      console.log('✅ Custom agent added to canvas with fallback data');
    }
  }, [addToUndoStack, mockAgentData, activeWorkflow]);

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
        onCreateCustomAgent={handleCustomAgentCreate}
        onUndo={handleUndo}
        canUndo={canUndo}
        onExecute={executeWorkflow}
        onStop={stopWorkflow}
        onSave={handleSave}
        onDelete={handleDeleteWorkflow}
        onMenuToggle={handleMobileMenuToggle}
        userId={currentUser?.id || currentUser?.userId || "1"}
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
      
      {/* Streaming Progress - Bottom Right */}
      <StreamingProgress
        isStreaming={isAutoOrchestrating}
        progress={progress}
        error={autoOrchestrateError}
        onStop={stopAutoOrchestrate}
      />

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
          isRegenerating={isRegenerating}
        />
    </div>
  );
}