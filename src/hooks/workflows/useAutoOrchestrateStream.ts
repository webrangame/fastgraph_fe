import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAutoOrchestrateStreamMutation, useInstallDataMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { processAgentsFromResponse } from '@/services/workflows/agentProcessor';
import type { ProcessedAgent, AgentConnection } from '@/services/workflows/agentProcessor';

interface UseAutoOrchestrateStreamProps {
  workflows: any[];
  onAgentsProcessed: (agents: Record<string, ProcessedAgent>, connections: AgentConnection[], finalData?: any) => void;
}

interface UseAutoOrchestrateStreamReturn {
  isAutoOrchestrating: boolean;
  error: any;
  agents: Record<string, ProcessedAgent> | null;
  connections: AgentConnection[] | null;
  finalData: any;
  finalizedResult: any;
  finalizedArtifactLinks: any[];
  executionResults: any;
  streamData: any;
  progress: {
    step: string;
    progress: number;
    message: string;
  } | null;
  resetAutoOrchestrate: () => void;
  startAutoOrchestrate: (command: string) => void;
  stopAutoOrchestrate: () => void;
}

export function useAutoOrchestrateStream({
  workflows,
  onAgentsProcessed
}: UseAutoOrchestrateStreamProps): UseAutoOrchestrateStreamReturn {
  const [agents, setAgents] = useState<Record<string, ProcessedAgent> | null>(null);
  const [connections, setConnections] = useState<AgentConnection[] | null>(null);
  const [finalData, setFinalData] = useState<any>(null);
  const [finalizedResult, setFinalizedResult] = useState<any>(null);
  const [finalizedArtifactLinks, setFinalizedArtifactLinks] = useState<any[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [progress, setProgress] = useState<{ step: string; progress: number; message: string } | null>(null);
  const [isAutoOrchestrating, setIsAutoOrchestrating] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const user = useSelector(selectCurrentUser);

  const [autoOrchestrateStream] = useAutoOrchestrateStreamMutation();
  const [installData] = useInstallDataMutation();

  // Reset function to clear auto orchestrate state
  const resetAutoOrchestrate = useCallback(() => {
    console.log('Resetting auto orchestrate state...');
    setAgents(null);
    setConnections(null);
    setFinalData(null);
    setFinalizedResult(null);
    setFinalizedArtifactLinks([]);
    setExecutionResults(null);
    setStreamData(null);
    setProgress(null);
    setError(null);
    setIsAutoOrchestrating(false);
    
    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    console.log('Auto orchestrate state reset successfully');
  }, []);

  const stopAutoOrchestrate = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsAutoOrchestrating(false);
  }, []);

  const startAutoOrchestrate = useCallback(async (command: string) => {
    if (!command) {
      console.error('No command provided for auto orchestrate');
      return;
    }

    // Reset state before starting
    resetAutoOrchestrate();
    setIsAutoOrchestrating(true);
    setError(null);

    try {
      // Create EventSource for SSE
      const url = `https://fatgraph-prod-twu675cviq-uc.a.run.app/autoOrchestrateStreamSSE?command=${encodeURIComponent(command)}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      let accumulatedData: any = null;
      let currentStep = '';
      let currentProgress = 0;

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE Data received:', data);

          // Update stream data
          setStreamData(data);

          // Handle different event types
          if (data.event === 'workflow_start') {
            console.log('Workflow started');
            accumulatedData = data;
          } else if (data.event === 'step_start') {
            currentStep = data.step;
            setProgress({
              step: data.step,
              progress: 0,
              message: data.message || `Starting ${data.step}...`
            });
          } else if (data.event === 'progress') {
            currentProgress = data.progress;
            setProgress({
              step: currentStep,
              progress: data.progress,
              message: data.message || `Processing ${currentStep}... ${data.progress}%`
            });
          } else if (data.event === 'step_complete') {
            console.log(`Step ${data.step} completed:`, data.result);
            setProgress({
              step: data.step,
              progress: 100,
              message: `${data.step} completed`
            });
          } else if (data.event === 'workflow_complete') {
            console.log('Workflow completed:', data);
            accumulatedData = data;
            
            // Process the final result
            if (data.auto_orchestrate_response) {
              const { agents: processedAgents, connections: processedConnections, finalData: processedFinalData, finalizedResult: processedFinalizedResult, finalizedArtifactLinks: processedFinalizedArtifactLinks, executionResults: processedExecutionResults } = 
                processAgentsFromResponse(data.auto_orchestrate_response);
              
              setAgents(processedAgents);
              setConnections(processedConnections);
              setFinalData(processedFinalData);
              setFinalizedResult(processedFinalizedResult);
              setFinalizedArtifactLinks(processedFinalizedArtifactLinks || []);
              setExecutionResults(processedExecutionResults);
              onAgentsProcessed(processedAgents, processedConnections, processedFinalData);

              // Save the auto orchestrate result using useInstallDataMutation
              if (user?.id && processedFinalData) {
                try {
                  await installData({
                    dataName: `${command}`,
                    description: `Auto orchestrate result for: ${command}`,
                    dataType: 'auto_orchestrate',
                    dataContent: processedFinalData,
                    numberOfAgents: Object.keys(processedAgents).length,
                    overwrite: false
                  }).unwrap();

                } catch (error) {
                  console.error('Error saving auto orchestrate data:', error);
                }
              }
            }

            setIsAutoOrchestrating(false);
            eventSource.close();
            eventSourceRef.current = null;
          }

          // Update accumulated data for any data events
          if (data.auto_orchestrate_response) {
            accumulatedData = data;
          }

        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
          setError(parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setError(error);
        setIsAutoOrchestrating(false);
        eventSource.close();
        eventSourceRef.current = null;
      };

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

    } catch (error) {
      console.error('Error starting auto orchestrate stream:', error);
      setError(error);
      setIsAutoOrchestrating(false);
    }
  }, [user, installData, onAgentsProcessed, resetAutoOrchestrate]);

  return {
    isAutoOrchestrating,
    error,
    agents,
    connections,
    finalData,
    finalizedResult,
    finalizedArtifactLinks,
    executionResults,
    streamData,
    progress,
    resetAutoOrchestrate,
    startAutoOrchestrate,
    stopAutoOrchestrate
  };
}
