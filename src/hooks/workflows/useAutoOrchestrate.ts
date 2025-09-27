import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAutoOrchestrateMutation, useInstallDataMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import { useLogAuditMutation } from '@/redux/api/audit/auditApi';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { mockAutoOrchestrateResult } from '@/services/workflows/mockData';
import { processAgentsFromResponse } from '@/services/workflows/agentProcessor';
import type { ProcessedAgent, AgentConnection } from '@/services/workflows/agentProcessor';
 
interface UseAutoOrchestrateProps {
  workflows: any[];
  onAgentsProcessed: (agents: Record<string, ProcessedAgent>, connections: AgentConnection[], finalData?: any) => void;
}
 
interface UseAutoOrchestrateReturn {
  isAutoOrchestrating: boolean;
  autoOrchestrateError: any;
  agents: Record<string, ProcessedAgent> | null;
  connections: AgentConnection[] | null;
  finalData: any;
  finalizedResult: any;
  finalizedArtifactLinks: any[];
  executionResults: any;
  resetAutoOrchestrate: () => void;
}
 
export function useAutoOrchestrate({
  workflows,
  onAgentsProcessed
}: UseAutoOrchestrateProps): UseAutoOrchestrateReturn {
  const [agents, setAgents] = useState<Record<string, ProcessedAgent> | null>(null);
  const [connections, setConnections] = useState<AgentConnection[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);
  const [finalizedArtifactLinks, setFinalizedArtifactLinks] = useState<any[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const hasAutoOrchestrated = useRef(false);
  
  const user = useSelector(selectCurrentUser);

  console.log('user 123', user)
 
  const [autoOrchestrate, {
    isLoading: isAutoOrchestrating,
    error: autoOrchestrateError
  }] = useAutoOrchestrateMutation();

  const [installData] = useInstallDataMutation();
  const [logAudit] = useLogAuditMutation();

  // Reset function to clear auto orchestrate state
  const resetAutoOrchestrate = () => {
    console.log('Resetting auto orchestrate state...');
    setAgents(null);
    setConnections(null);
    setFinalData(null);
    setFinalizedResult(null);
    setFinalizedArtifactLinks([]);
    setExecutionResults(null);
    hasAutoOrchestrated.current = false;
    console.log('Auto orchestrate state reset successfully');
  };
 
  useEffect(() => {
    const autoOrchestrateFirstWorkflow = async () => {
      // Reset auto-orchestrate state for new prompts
      if (hasAutoOrchestrated.current) {
        console.log('Resetting auto-orchestrate state for new prompt...');
        hasAutoOrchestrated.current = false;
        setAgents(null);
        setConnections(null);
        setFinalData(null);
        setFinalizedResult(null);
        setFinalizedArtifactLinks([]);
        setExecutionResults(null);
      }
      
      if (workflows.length > 0) {
        const firstWorkflow = workflows[0];

        // If loaded from sidebar/cache (already has nodes/connections), do not call external API
        if ((firstWorkflow?.nodes && firstWorkflow.nodes.length > 0) ||
            (firstWorkflow?.connections && firstWorkflow.connections.length > 0)) {
          console.log('Detected cached workflow structure. Skipping auto-orchestrate API call.');
          hasAutoOrchestrated.current = true;
          return;
        }

        const firstWorkflowDescription = firstWorkflow?.description;
        if (firstWorkflowDescription) {
          console.log('Auto orchestrating with command:', firstWorkflowDescription);
          try {
            // Using hardcoded example for now - replace with actual API call when ready
            const result = await autoOrchestrate({ command: firstWorkflowDescription, response_mode: 'full' }).unwrap();
            //const result = mockAutoOrchestrateResult;

            // Process agents and connections
            const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult, finalizedArtifactLinks: processedFinalizedArtifactLinks, executionResults: processedExecutionResults } = 
              processAgentsFromResponse(result);
              
            console.log('🔍 useAutoOrchestrate Debug:', {
              processedFinalizedArtifactLinksLength: processedFinalizedArtifactLinks?.length,
              processedFinalizedArtifactLinks: processedFinalizedArtifactLinks
            });
           
            setAgents(processedAgents);
            setConnections(processedConnections);
            setFinalData(processedFinalData);
            setFinalizedResult(processedFinalizedResult);
            setFinalizedArtifactLinks(processedFinalizedArtifactLinks || []);
            setExecutionResults(processedExecutionResults);
            onAgentsProcessed(processedAgents, processedConnections, processedFinalData);
            

            // Save the auto orchestrate result using useInstallDataMutation
            try {
              // Ensure the result includes finalizedArtifactLinks at the top level for consistency
              const resultWithArtifacts = {
                ...result,
                finalizedArtifactLinks: processedFinalizedArtifactLinks || []
              };
              
              const numberOfAgents = Object.keys(processedAgents).length;
              console.log('Saving auto orchestrate result with numberOfAgents:', numberOfAgents);
              console.log('Processed agents keys:', Object.keys(processedAgents));
              console.log('Processed agents:', processedAgents);
              
              const saveResult = await installData({
                dataName: workflows[0].name,
                description: firstWorkflowDescription,
                numberOfAgents: numberOfAgents,
                dataType: 'json',
                dataContent: {
                  autoOrchestrateResult: resultWithArtifacts,
                },
                overwrite: true
              }).unwrap();
              console.log('Auto orchestrate result saved successfully:', saveResult);
              console.log('Response includes numberOfAgents:', saveResult);

              // Log audit trail after successful data installation
              try {
                const auditData = {
                  action: 'create',
                  resource: 'data',
                  description: 'User created new data installation',
                  details: `Data installation with ${numberOfAgents} agents`,
                  createdBy: user?.id || user?.userId || 'unknown-user',
                  task: 'data-installation',
                 // ipAddress: '192.168.1.100', // TODO: Get actual IP from request
                  userAgent: navigator.userAgent,
                  endpoint: '/api/v1/data/install',
                  method: 'POST',
                  statusCode: 201,
                  metadata: {
                    numberOfAgents: numberOfAgents,
                    dataType: 'json',
                    workflowName: workflows[0].name,
                    description: firstWorkflowDescription
                  }
                };
                
                await logAudit(auditData).unwrap();
                console.log('Audit log created successfully for data installation');
              } catch (auditError) {
                console.error('Failed to create audit log:', auditError);
                // Don't throw error here as the main operation was successful
              }
              
            } catch (saveError) {
              console.error('Failed to save auto orchestrate result:', saveError);
              
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
  }, [workflows.length, autoOrchestrate, onAgentsProcessed]);
 
  return {
    isAutoOrchestrating,
    autoOrchestrateError,
    agents,
    connections,
    finalData,
    finalizedResult,
    finalizedArtifactLinks,
    executionResults,
    resetAutoOrchestrate
  };
}