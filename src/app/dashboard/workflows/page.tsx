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
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkflows, addWorkflow, removeWorkflow, updateWorkflow } from '@/redux/slice/workflowSlice';
import { RootState } from '@/types/redux';
import { useAutoOrchestrateMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';

export default function WorkflowsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agents, setAgents] = useState<Record<string, any> | null>(null);
  const [connections, setConnections] = useState<any[] | null>(null);
  const hasAutoOrchestrated = useRef(false);
  
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
        if (reduxWorkflows.length > 0) {
          console.log('Loading workflows from Redux store:', reduxWorkflows);
        } else {
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

  // Auto orchestrate with first workflow's description when workflows are loaded
  useEffect(() => {
    const autoOrchestrateFirstWorkflow = async () => {
      // Prevent multiple executions in development due to React strict mode
      if (hasAutoOrchestrated.current) {
        return;
      }
      
      if (reduxWorkflows.length > 0) {
        const firstWorkflowDescription = reduxWorkflows[0]?.description;
        if (firstWorkflowDescription) {
          console.log('Auto orchestrating with command:', firstWorkflowDescription);
          try {
            // Using hardcoded example for now - replace with actual API call when ready
            // const result = await autoOrchestrate({ command: firstWorkflowDescription }).unwrap();

            const result = {
              "received_command": "write a poem and then count its words",
              "auto_orchestrate_response": {
                "identified_role": "Content Writer",
                "role_confidence": 0.85,
                "role_method": "enhanced_prompting",
                "role_reasoning": "The command involves two main tasks: writing a poem and counting its words. The primary task type is Creative, as it involves creating literary content. The required expertise domain is writing, specifically in poetry, which does not demand highly specialized industry knowledge but does require a good command of language and creativity. The expected deliverable is a written poem, with an additional task of word counting, which is straightforward and typically involves a basic level of analytical skill. This is a simple task with a limited scope, needing primarily writing skills. Therefore, a Content Writer, who specializes in crafting written content and can perform basic word processing tasks, is the most appropriate professional role for this command.",
                "m_language_spec": "swarm poetry_swarm {\n    agent poet_agent {\n        role: \"Creative Writer\"\n        capabilities: \"llm\"\n        inputs: \"poem_request\"\n        outputs: \"poem_output\"\n        config: { model: \"gpt-4\", temperature: 0.7 }\n    }\n    agent word_counter_agent {\n        role: \"Word Counter\"\n        capabilities: \"llm,analysis\"\n        inputs: \"poem_output\"\n        outputs: \"word_count\"\n        config: { model: \"gpt-4\", temperature: 0.5 }\n    }\n    workflow sequential {\n        poet_agent(input: \"poem_request\", output: \"poem_output\")\n        word_counter_agent(input: \"poem_output\", output: \"word_count\")\n    }\n}",
                "swarm_result": {
                  "success": true,
                  "swarm_spec": {
                    "type": "swarm",
                    "name": "poetry_swarm",
                    "agents": {
                      "poet_agent": {
                        "name": "poet_agent",
                        "role": "Creative Writer",
                        "capabilities": [
                          "llm"
                        ],
                        "inputs": [
                          "poem_request"
                        ],
                        "outputs": [
                          "poem_output"
                        ],
                        "config": {
                          "model": "gpt-4",
                          "temperature": 0.7
                        },
                        "type": "llm"
                      },
                      "word_counter_agent": {
                        "name": "word_counter_agent",
                        "role": "Word Counter",
                        "capabilities": [
                          "llm",
                          "analysis"
                        ],
                        "inputs": [
                          "poem_output"
                        ],
                        "outputs": [
                          "word_count"
                        ],
                        "config": {
                          "model": "gpt-4",
                          "temperature": 0.5
                        },
                        "type": "llm"
                      },
                      "quality_checker_agent": {
                        "name": "quality_checker_agent",
                        "role": "Quality Checker",
                        "capabilities": [
                          "llm",
                          "validation"
                        ],
                        "inputs": [
                          "word_count"
                        ],
                        "outputs": [
                          "quality_report"
                        ],
                        "config": {
                          "model": "gpt-4",
                          "temperature": 0.3
                        },
                        "type": "llm"
                      },
                      "formatter_agent": {
                        "name": "formatter_agent",
                        "role": "Document Formatter",
                        "capabilities": [
                          "formatting",
                          "export"
                        ],
                        "inputs": [
                          "poem_output",
                          "quality_report"
                        ],
                        "outputs": [
                          "formatted_document"
                        ],
                        "config": {
                          "format": "markdown"
                        },
                        "type": "formatter"
                      }
                    },
                    "workflow": {
                      "type": "sequential",
                      "steps": [
                        {
                          "agent": "poet_agent",
                          "inputs": [
                            "poem_request"
                          ],
                          "outputs": [
                            "poem_output"
                          ],
                          "transform": null,
                          "filter": null,
                          "timeout": null,
                          "retry": null,
                          "error_handler": null
                        },
                        {
                          "agent": "word_counter_agent",
                          "inputs": [
                            "poem_output"
                          ],
                          "outputs": [
                            "word_count"
                          ],
                          "transform": null,
                          "filter": null,
                          "timeout": null,
                          "retry": null,
                          "error_handler": null
                        },
                        {
                          "agent": "quality_checker_agent",
                          "inputs": [
                            "word_count"
                          ],
                          "outputs": [
                            "quality_report"
                          ],
                          "transform": null,
                          "filter": null,
                          "timeout": null,
                          "retry": null,
                          "error_handler": null
                        },
                        {
                          "agent": "formatter_agent",
                          "inputs": [
                            "poem_output",
                            "quality_report"
                          ],
                          "outputs": [
                            "formatted_document"
                          ],
                          "transform": null,
                          "filter": null,
                          "timeout": null,
                          "retry": null,
                          "error_handler": null
                        }
                      ],
                      "conditions": null,
                      "max_iterations": null,
                      "execution_strategy": "linear"
                    },
                    "config": {},
                    "execution_plan": {
                      "phases": [
                        {
                          "phase_id": 0,
                          "step_id": 0,
                          "agent": "poet_agent",
                          "dependencies": [],
                          "inputs": [
                            "poem_request"
                          ],
                          "outputs": [
                            "poem_output"
                          ],
                          "execution_type": "sequential"
                        },
                        {
                          "phase_id": 1,
                          "step_id": 1,
                          "agent": "word_counter_agent",
                          "dependencies": [
                            "poet_agent"
                          ],
                          "inputs": [
                            "poem_output"
                          ],
                          "outputs": [
                            "word_count"
                          ],
                          "execution_type": "sequential"
                        }
                      ],
                      "dependencies": {
                        "poet_agent": [],
                        "word_counter_agent": [
                          "poet_agent"
                        ]
                      },
                      "data_flow": {
                        "poet_agent": {
                          "inputs": [
                            "poem_request"
                          ],
                          "outputs": [
                            "poem_output"
                          ],
                          "transform": null,
                          "filter": null
                        },
                        "word_counter_agent": {
                          "inputs": [
                            "poem_output"
                          ],
                          "outputs": [
                            "word_count"
                          ],
                          "transform": null,
                          "filter": null
                        },
                        "quality_checker_agent": {
                          "inputs": [
                            "word_count"
                          ],
                          "outputs": [
                            "quality_report"
                          ],
                          "transform": null,
                          "filter": null
                        },
                        "formatter_agent": {
                          "inputs": [
                            "poem_output",
                            "quality_report"
                          ],
                          "outputs": [
                            "formatted_document"
                          ],
                          "transform": null,
                          "filter": null
                        }
                      },
                      "error_handling": {},
                      "monitoring": {}
                    }
                  }
                }
              }
            };

          // - poet_agent outputs: ["poem_output"]
          // - word_counter_agent inputs: ["poem_output"] ✓ Connection created
          // - formatter_agent inputs: ["poem_output", "quality_report"] ✓ Connection created

            // Extract agents from the response
            const swarmSpec = result.auto_orchestrate_response?.swarm_result?.swarm_spec;
            const executionPlan = result.auto_orchestrate_response?.swarm_result?.swarm_spec?.execution_plan;
            
            if (swarmSpec?.agents && executionPlan?.data_flow) {
              // Combine agent info from swarm_spec.agents and execution_plan.data_flow
              const agentsRecord: Record<string, any> = {};
              
              // Get agent details from swarm_spec.agents (role, capabilities)
              Object.entries(swarmSpec.agents).forEach(([name, agent]: [string, any]) => {
                agentsRecord[name] = {
                  name: agent.name || name,
                  role: agent.role || "Agent",
                  capabilities: agent.capabilities || [],
                  // Default empty arrays for inputs/outputs, will be updated from data_flow
                  inputs: [],
                  outputs: []
                };
              });
              
              // Update inputs/outputs from execution_plan.data_flow
              Object.entries(executionPlan.data_flow).forEach(([name, data]: [string, any]) => {
                if (agentsRecord[name]) {
                  agentsRecord[name].inputs = data.inputs || [];
                  agentsRecord[name].outputs = data.outputs || [];
                } else {
                  // If agent not in swarm_spec, create minimal entry
                  agentsRecord[name] = {
                    name: name,
                    role: "Agent",
                    capabilities: [],
                    inputs: data.inputs || [],
                    outputs: data.outputs || []
                  };
                }
              });
              
              // Enhanced connection creation with proper React Flow format
              const connections: any[] = [];
              const agentsArray = Object.entries(agentsRecord);
              
              // For each agent, check its outputs against other agents' inputs
              agentsArray.forEach(([sourceAgentName, sourceAgent]) => {
                sourceAgent.outputs?.forEach((output: string) => {
                  agentsArray.forEach(([targetAgentName, targetAgent]) => {
                    // Skip if it's the same agent
                    if (sourceAgentName === targetAgentName) return;
                    
                    // Check if target agent has this output as an input
                    if (targetAgent.inputs?.includes(output)) {
                      connections.push({
                        id: `connection-${sourceAgentName}-${targetAgentName}`,
                        source: `agent-${sourceAgentName}`,
                        target: `agent-${targetAgentName}`,
                        sourceHandle: null, // Let React Flow handle automatically
                        targetHandle: null, // Let React Flow handle automatically
                        type: 'default' // Use React Flow's default edge type
                      });
                    }
                  });
                });
              });
              
              console.log('Setting agents:', agentsRecord);
              console.log('Setting connections:', connections);
              
              setAgents(agentsRecord);
              setConnections(connections);
            }
            
            // Mark as executed to prevent multiple calls
            hasAutoOrchestrated.current = true;
          } catch (error) {
            console.error('Auto orchestrate failed:', error);
          }
        }
      }
    };

    autoOrchestrateFirstWorkflow();
  }, [reduxWorkflows.length, autoOrchestrate]);

  // Sync Redux workflows with workflow manager when Redux state changes
  useEffect(() => {
    if (reduxWorkflows.length > 0) {
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
  };

  // Enhanced workflow deletion with proper cleanup
  const handleDeleteWorkflow = (workflowId?: string) => {
    const idToDelete = workflowId || currentWorkflow?.id;
    if (idToDelete) {
      // Remove from Redux store
      dispatch(removeWorkflow(idToDelete));
      
      // Also remove from localStorage
      const updatedWorkflows = reduxWorkflows.filter((w: any) => w.id !== idToDelete);
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      
      // Clear agents and connections when deleting workflow
      setAgents(null);
      setConnections(null);
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
          onDelete={handleDeleteWorkflow}
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
              {/* Auto-orchestration status */}
              {isAutoOrchestrating && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-600">Auto-orchestrating...</span>
                </div>
              )}
              {/* Agents loaded status */}
              {agents && (
                <span className="text-sm text-green-600">
                  ✓ {Object.keys(agents).length} agents loaded
                </span>
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
                onClick={() => handleDeleteWorkflow()}
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
          agents={agents || undefined}
          connections={connections || undefined}
          isAutoOrchestrating={isAutoOrchestrating}
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