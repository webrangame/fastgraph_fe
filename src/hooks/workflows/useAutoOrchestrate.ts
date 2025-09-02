import { useState, useEffect, useRef } from 'react';
import { useAutoOrchestrateMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
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
  executionResults: any;
}

export function useAutoOrchestrate({ 
  workflows, 
  onAgentsProcessed 
}: UseAutoOrchestrateProps): UseAutoOrchestrateReturn {
  const [agents, setAgents] = useState<Record<string, ProcessedAgent> | null>(null);
  const [connections, setConnections] = useState<AgentConnection[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const hasAutoOrchestrated = useRef(false);

  const [autoOrchestrate, {
    isLoading: isAutoOrchestrating,
    error: autoOrchestrateError
  }] = useAutoOrchestrateMutation();

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
            const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult, executionResults: processedExecutionResults } = 
              processAgentsFromResponse(result);
            
            console.log('Setting agents:', processedAgents);
            console.log('Setting connections:', processedConnections);
            console.log('Setting finalData:', processedFinalData);
            console.log('Setting executionResults:', processedExecutionResults);
            
            setAgents(processedAgents);
            setConnections(processedConnections);
            setFinalData(processedFinalData);
            setFinalizedResult(processedFinalizedResult);
            setExecutionResults(processedExecutionResults);
            onAgentsProcessed(processedAgents, processedConnections, processedFinalData);
            
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
    executionResults
  };
}