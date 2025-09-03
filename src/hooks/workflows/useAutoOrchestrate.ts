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
}
 
export function useAutoOrchestrate({
  workflows,
  onAgentsProcessed
}: UseAutoOrchestrateProps): UseAutoOrchestrateReturn {
  const [agents, setAgents] = useState<Record<string, ProcessedAgent> | null>(null);
  const [connections, setConnections] = useState<AgentConnection[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);
  const hasAutoOrchestrated = useRef(false);
 
  const [autoOrchestrate, {
    isLoading: isAutoOrchestrating,
    error: autoOrchestrateError
  }] = useAutoOrchestrateMutation();

  const [installData] = useInstallDataMutation();
 
  useEffect(() => {
    const autoOrchestrateFirstWorkflow = async () => {
      // Prevent multiple executions in development due to React strict mode
      if (hasAutoOrchestrated.current) {
        return;
      }
     
      if (workflows.length > 0) {
 
        console.log("iii")
        const firstWorkflowDescription = workflows[0]?.description;
        if (firstWorkflowDescription) {
          console.log('Auto orchestrating with command:', firstWorkflowDescription);
          try {
                        // Using hardcoded example for now - replace with actual API call when ready
              const result = await autoOrchestrate({ command: firstWorkflowDescription, response_mode: 'full' }).unwrap();
             //const result = mockAutoOrchestrateResult;

            // Process agents and connections
            const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult } =
              processAgentsFromResponse(result);
           
            console.log('Setting agents:', processedAgents);
            console.log('Setting connections:', processedConnections);
            console.log('Setting finalData:', processedFinalData);
           
            setAgents(processedAgents);
            setConnections(processedConnections);
            setFinalData(processedFinalData);
            setFinalizedResult(processedFinalizedResult);
            onAgentsProcessed(processedAgents, processedConnections, processedFinalData);

            // Save the auto orchestrate result using useInstallDataMutation
            try {
              console.log('Saving auto orchestrate result...');
              const saveResult = await installData({
                dataName: `${firstWorkflowDescription}`,
                description: `Auto orchestrate result for command: ${firstWorkflowDescription}`,
                dataType: 'json',
                dataContent: {
                  originalCommand: firstWorkflowDescription,
                  autoOrchestrateResult: result,
                  processedAgents: processedAgents,
                  processedConnections: processedConnections,
                  finalData: processedFinalData,
                  finalizedResult: processedFinalizedResult,
                  metadata: {
                    savedAt: new Date().toISOString(),
                    version: '1.0',
                    type: 'auto_orchestrate_result'
                  }
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
    finalizedResult
  };
}