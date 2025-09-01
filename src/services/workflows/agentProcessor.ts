export interface ProcessedAgent {
  name: string;
  role: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  logs?: Array<{
    id?: string;
    timestamp?: number | string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    status?: 'pending' | 'completed' | 'failed';
  }> | string[];
  inputValues?: Record<string, any>;
  agentInput?: string;
}

export interface AgentConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle: null;
  targetHandle: null;
  type: string;
}

export interface AgentProcessingResult {
  agents: Record<string, ProcessedAgent>;
  connections: AgentConnection[];
  finalData?: any;
  finalizedResult?: any;
}

export function processAgentsFromResponse(result: any): AgentProcessingResult {
  const swarmSpec = result.auto_orchestrate_response?.swarm_result?.swarm_spec;
  const executionPlan = result.auto_orchestrate_response?.swarm_result?.swarm_spec?.execution_plan;
  const finalData = result.auto_orchestrate_response?.swarm_result?.final_data || {};
  const executionResults = result.auto_orchestrate_response?.swarm_result?.execution_results?.results || {};
  const finalizedResultRaw = (result as any)?.finalizedResult;

  // Attempt to parse finalizedResult if it's provided as a stringified Python-like dict
  const parseFinalizedResult = (input: any): any => {
    if (!input) return undefined;
    if (typeof input === 'object') return input;
    if (typeof input === 'string') {
      // First, try JSON.parse directly
      try {
        return JSON.parse(input);
      } catch (_) {
        // Try a more comprehensive normalization for Python-like syntax
        try {
          let normalized = input
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/\bNone\b/g, 'null');
          
          // Handle escaped quotes in nested strings
          // First, protect already escaped quotes
          normalized = normalized.replace(/\\"/g, '__ESCAPED_QUOTE__');
          
          // Replace single quotes around keys and string values
          // Keys: 'key': -> "key":
          normalized = normalized.replace(/'([^']*?)'\s*:/g, '"$1":');
          // Values: : 'value' -> : "value" (but be careful with nested structures)
          normalized = normalized.replace(/:\s*'([^']*)'/g, ': "$1"');
          
          // Restore escaped quotes but properly escaped for JSON
          normalized = normalized.replace(/__ESCAPED_QUOTE__/g, '\\"');
          
          return JSON.parse(normalized);
        } catch (parseError) {
          console.warn('Failed to parse finalizedResult:', parseError);
          // If all parsing fails, return the original string so the EndNodeSidebar can handle it
          return input;
        }
      }
    }
    return undefined;
  };

  const finalizedResultParsed = parseFinalizedResult(finalizedResultRaw);
  
  if (!swarmSpec?.agents || !executionPlan?.data_flow) {
    return { agents: {}, connections: [], finalData, finalizedResult: finalizedResultParsed };
  }

  // Combine agent info from swarm_spec.agents and execution_plan.data_flow
  const agentsRecord: Record<string, ProcessedAgent> = {};
  
  // Get agent details from swarm_spec.agents (role, capabilities)
  Object.entries(swarmSpec.agents).forEach(([name, agent]: [string, any]) => {
    agentsRecord[name] = {
      name: agent.name || name,
      role: agent.role || "Agent",
      capabilities: agent.capabilities || [],
      inputs: [],
      outputs: [],
      logs: [],
      inputValues: {}
    };
  });
  
  // Update inputs/outputs from execution_plan.data_flow
  Object.entries(executionPlan.data_flow).forEach(([name, data]: [string, any]) => {
    if (agentsRecord[name]) {
      agentsRecord[name].inputs = data.inputs || [];
      agentsRecord[name].outputs = data.outputs || [];
      // Attach input values from final_data if present
      const inputValues: Record<string, any> = {};
      (data.inputs || []).forEach((inputKey: string) => {
        if (finalData && Object.prototype.hasOwnProperty.call(finalData, inputKey)) {
          inputValues[inputKey] = (finalData as any)[inputKey];
        }
      });
      agentsRecord[name].inputValues = inputValues;
    } else {
      // If agent not in swarm_spec, create minimal entry
      agentsRecord[name] = {
        name: name,
        role: "Agent",
        capabilities: [],
        inputs: data.inputs || [],
        outputs: data.outputs || [],
        inputValues: (data.inputs || []).reduce((acc: Record<string, any>, key: string) => {
          if (finalData && Object.prototype.hasOwnProperty.call(finalData, key)) {
            acc[key] = (finalData as any)[key];
          }
          return acc;
        }, {})
      };
    }
  });

  // Attach execution logs per agent if available
  Object.entries(agentsRecord).forEach(([agentName, agent]) => {
    const exec = (executionResults as any)[agentName];
    const collectedLogs: Array<{ id: string; timestamp?: number | string; message: string; type?: 'info' | 'warning' | 'error' | 'success'; status?: 'pending' | 'completed' | 'failed'; }> = [];

    if (exec) {
      // Attach LLM input prompt if available
      const inputPrompt = exec?.llm_inference?.input_prompt ?? exec?.llm_inference?.input_promp;
      if (typeof inputPrompt === 'string' && inputPrompt.length > 0) {
        agent.agentInput = inputPrompt;
      }

      // Top-level execution_logs (array of strings)
      if (Array.isArray(exec.execution_logs)) {
        exec.execution_logs.forEach((line: string, idx: number) => {
          const parsed = parseLogLine(line);
          collectedLogs.push({ id: `${agentName}-exec-${idx}`, ...parsed });
        });
      }

      // Output-specific logs
      if (exec.outputs && typeof exec.outputs === 'object') {
        Object.entries(exec.outputs).forEach(([outputKey, outputObj]: [string, any]) => {
          const logs = outputObj?._execution_logs?.execution_logs;
          if (Array.isArray(logs)) {
            logs.forEach((line: string, idx: number) => {
              const parsed = parseLogLine(line);
              collectedLogs.push({ id: `${agentName}-${outputKey}-${idx}`, ...parsed });
            });
          }
        });
      }

      // Add a final status log
      if (typeof exec.success === 'boolean') {
        collectedLogs.push({
          id: `${agentName}-status`,
          message: exec.success ? 'Agent execution completed successfully' : 'Agent execution failed',
          type: exec.success ? 'success' : 'error',
          status: exec.success ? 'completed' : 'failed',
          timestamp: Date.now()
        });
      }
    }

    if (collectedLogs.length > 0) {
      agent.logs = collectedLogs;
    }
  });
  
  // Create connections based on input/output matching
  const connections = createConnections(agentsRecord);
  
  return { agents: agentsRecord, connections, finalData, finalizedResult: finalizedResultParsed };
}

function createConnections(agentsRecord: Record<string, ProcessedAgent>): AgentConnection[] {
  const connections: AgentConnection[] = [];
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
            sourceHandle: null,
            targetHandle: null,
            type: 'default'
          });
        }
      });
    });
  });
  
  return connections;
}

function parseLogLine(line: string): { message: string; timestamp?: number | string; type?: 'info' | 'warning' | 'error' | 'success' } {
  // Example line: "[05:38:48.863] LLM inference completed in 5.559s"
  const timeMatch = line.match(/^\[(.*?)\]\s*(.*)$/);
  if (timeMatch) {
    const [, time, rest] = timeMatch;
    return { message: rest, timestamp: time, type: inferTypeFromMessage(rest) };
  }
  return { message: line, type: inferTypeFromMessage(line) };
}

function inferTypeFromMessage(message: string): 'info' | 'warning' | 'error' | 'success' {
  const lower = message.toLowerCase();
  if (lower.includes('error') || lower.includes('failed')) return 'error';
  if (lower.includes('warning')) return 'warning';
  if (lower.includes('success') || lower.includes('completed successfully')) return 'success';
  return 'info';
}