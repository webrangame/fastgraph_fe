import { useState, useEffect, useRef, useCallback } from 'react';
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
  triggerAutoOrchestrate: (command: string) => Promise<string>; // New function
  resetAutoOrchestration: () => void; // New function
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

  // New function that can be called from usePromptHandler
  const triggerAutoOrchestrate = useCallback(async (command: string): Promise<string> => {
    try {
      console.log('🔵 triggerAutoOrchestrate called with command:', command);
      console.log('🔵 hasAutoOrchestrated.current:', hasAutoOrchestrated.current);
      
      // Prevent duplicate executions
      if (hasAutoOrchestrated.current) {
        console.log('🔵 Skipping execution - already auto-orchestrated');
        return 'Auto-orchestration already completed';
      }
      
      const result = await autoOrchestrate({ command }).unwrap();
      
      // Process agents and connections
      const { agents: processedAgents, connections: processedConnections } = 
        processAgentsFromResponse(result);
      
      console.log('Setting agents:', processedAgents);
      console.log('Setting connections:', processedConnections);
      
      setAgents(processedAgents);
      setConnections(processedConnections);
      onAgentsProcessed(processedAgents, processedConnections);
      
      // Mark as executed to prevent future calls
      hasAutoOrchestrated.current = true;
      console.log('🔵 Auto-orchestration completed, hasAutoOrchestrated set to true');
      
      return result.response || 'Auto-orchestration completed successfully!';
    } catch (error) {
      console.error('Auto orchestrate failed:', error);
      throw new Error('Failed to auto-orchestrate. Please try again.');
    }
  }, [autoOrchestrate, onAgentsProcessed]);

  // Reset function to allow manual reset of auto-orchestration state
  const resetAutoOrchestration = useCallback(() => {
    console.log('🔄 Resetting auto-orchestration state');
    hasAutoOrchestrated.current = false;
    setAgents(null);
    setConnections(null);
  }, []);

  useEffect(() => {
    const autoOrchestrateFirstWorkflow = async () => {
      console.log('🟡 useEffect: autoOrchestrateFirstWorkflow called');
      console.log('🟡 workflows.length:', workflows.length);
      console.log('🟡 hasAutoOrchestrated.current:', hasAutoOrchestrated.current);
      
      // Prevent multiple executions in development due to React strict mode
      if (hasAutoOrchestrated.current) {
        console.log('🟡 Skipping - already auto-orchestrated');
        return;
      }
      
      if (workflows.length > 0) {
        const firstWorkflowDescription = workflows[0]?.description;
        console.log('🟡 First workflow description:', firstWorkflowDescription);
        
        if (firstWorkflowDescription) {
          console.log('🟡 Starting auto-orchestration with command:', firstWorkflowDescription);
          try {
<<<<<<< HEAD
            // Use the centralized triggerAutoOrchestrate function instead of direct API call
            await triggerAutoOrchestrate(firstWorkflowDescription);
            
            // Note: triggerAutoOrchestrate already handles:
            // - API call
            // - Processing agents and connections
            // - Setting agents and connections state
            // - Calling onAgentsProcessed
            // - Setting hasAutoOrchestrated.current = true
            
            console.log('🟡 Auto-orchestration completed successfully');
=======
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
            
            // Mark as executed to prevent multiple calls
            hasAutoOrchestrated.current = true;
>>>>>>> 2b23a83d2cd9736e3331d24222043680a1ac0461
          } catch (error) {
            console.error('🟡 Auto orchestrate failed:', error);
          }
        } else {
          console.log('🟡 No workflow description found');
        }
      } else {
        console.log('🟡 No workflows available');
      }
    };

    autoOrchestrateFirstWorkflow();
  }, [workflows.length, triggerAutoOrchestrate]);

  return {
    isAutoOrchestrating,
    autoOrchestrateError,
    agents,
    connections,
<<<<<<< HEAD
    triggerAutoOrchestrate, // Export the new function
    resetAutoOrchestration, // Export the reset function
=======
    finalData,
    finalizedResult
>>>>>>> 2b23a83d2cd9736e3331d24222043680a1ac0461
  };
}