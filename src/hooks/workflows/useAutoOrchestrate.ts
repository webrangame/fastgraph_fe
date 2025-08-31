import { useState, useEffect, useRef, useCallback } from 'react';
import { useAutoOrchestrateMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import { mockAutoOrchestrateResult } from '@/services/workflows/mockData';
import { processAgentsFromResponse } from '@/services/workflows/agentProcessor';
import type { ProcessedAgent, AgentConnection } from '@/services/workflows/agentProcessor';

interface UseAutoOrchestrateProps {
  workflows: any[];
  onAgentsProcessed: (agents: Record<string, ProcessedAgent>, connections: AgentConnection[]) => void;
}

interface UseAutoOrchestrateReturn {
  isAutoOrchestrating: boolean;
  autoOrchestrateError: any;
  agents: Record<string, ProcessedAgent> | null;
  connections: AgentConnection[] | null;
  triggerAutoOrchestrate: (command: string) => Promise<string>; // New function
}

export function useAutoOrchestrate({ 
  workflows, 
  onAgentsProcessed 
}: UseAutoOrchestrateProps): UseAutoOrchestrateReturn {
  const [agents, setAgents] = useState<Record<string, ProcessedAgent> | null>(null);
  const [connections, setConnections] = useState<AgentConnection[] | null>(null);
  const hasAutoOrchestrated = useRef(false);

  const [autoOrchestrate, {
    isLoading: isAutoOrchestrating,
    error: autoOrchestrateError
  }] = useAutoOrchestrateMutation();

  // New function that can be called from usePromptHandler
  const triggerAutoOrchestrate = useCallback(async (command: string): Promise<string> => {
    try {
      console.log('Triggering auto-orchestration with command:', command);
      const result = await autoOrchestrate({ command }).unwrap();
      
      // Process agents and connections
      const { agents: processedAgents, connections: processedConnections } = 
        processAgentsFromResponse(result);
      
      console.log('Setting agents:', processedAgents);
      console.log('Setting connections:', processedConnections);
      
      setAgents(processedAgents);
      setConnections(processedConnections);
      onAgentsProcessed(processedAgents, processedConnections);
      
      return result.response || 'Auto-orchestration completed successfully!';
    } catch (error) {
      console.error('Auto orchestrate failed:', error);
      throw new Error('Failed to auto-orchestrate. Please try again.');
    }
  }, [autoOrchestrate, onAgentsProcessed]);

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

            const result = await autoOrchestrate({ command: firstWorkflowDescription }).unwrap();
             //const result = mockAutoOrchestrateResult;

            // Process agents and connections
            const { agents: processedAgents, connections: processedConnections } = 
              processAgentsFromResponse(result);
            
            console.log('Setting agents:', processedAgents);
            console.log('Setting connections:', processedConnections);
            
            setAgents(processedAgents);
            setConnections(processedConnections);
            onAgentsProcessed(processedAgents, processedConnections);
            
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
    triggerAutoOrchestrate, // Export the new function
  };
}