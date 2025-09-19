import { useState, useEffect, useRef } from 'react';
import { useAutoOrchestrateMutation, useInstallDataMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
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
 
  const [autoOrchestrate, {
    isLoading: isAutoOrchestrating,
    error: autoOrchestrateError
  }] = useAutoOrchestrateMutation();

  const [installData] = useInstallDataMutation();

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
      // Skip if already executed
      if (hasAutoOrchestrated.current) {
        return;
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
              
              const saveResult = await installData({
                dataName: workflows[0].name,
                description: firstWorkflowDescription,
                dataType: 'json',
                dataContent: {
                  autoOrchestrateResult: resultWithArtifacts,
                },
                overwrite: true
              }).unwrap();
              console.log('Auto orchestrate result saved successfully:', saveResult);
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