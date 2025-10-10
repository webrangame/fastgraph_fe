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
  finalizedArtifactLinks?: any[];
  executionResults?: {
    [agentName: string]: {
      result?: any;
      success?: boolean;
      outputs?: Record<string, any>;
      [key: string]: any;
    };
  };
}

export function processAgentsFromResponse(result: any): AgentProcessingResult {
  // Try multiple possible locations for the data
  const autoOrchestrateResponse = result.auto_orchestrate_response || result;
  const swarmSpec = autoOrchestrateResponse?.swarm_result?.swarm_spec;
  const executionPlan = autoOrchestrateResponse?.swarm_result?.swarm_spec?.execution_plan;
  const finalData = autoOrchestrateResponse?.swarm_result?.final_data || autoOrchestrateResponse?.final_data || {};
  const executionResults = autoOrchestrateResponse?.swarm_result?.execution_results?.results || autoOrchestrateResponse?.execution_results?.results || {};
  const finalizedResultRaw = (result as any)?.finalizedResult;
  // Try multiple possible locations and naming conventions for finalizedArtifactLinks
  let finalizedArtifactLinks = 
    (result as any)?.finalizedArtifactLinks || 
    (result as any)?.finalized_artifact_links || 
    (result as any)?.auto_orchestrate_response?.finalizedArtifactLinks ||
    (result as any)?.auto_orchestrate_response?.finalized_artifact_links ||
    [];
  
  // Search for artifact links anywhere in the response
  const searchForArtifacts = (obj: any, path = ''): string[] => {
    if (!obj || typeof obj !== 'object') return [];
    
    // Check if current object has artifacts array
    if (Array.isArray(obj.artifacts)) {
      return obj.artifacts.filter((a: any) => a?.url).map((a: any) => a.url);
    }
    
    // Check common field names
    const artifactFields = ['finalizedArtifactLinks', 'finalized_artifact_links', 'artifacts', 'media_links', 'artifactLinks'];
    for (const field of artifactFields) {
      if (Array.isArray(obj[field])) {
        return obj[field].filter((item: any) => item?.url || typeof item === 'string').map((item: any) => item?.url || item);
      }
    }
    
    // Check for URL patterns in strings
    const urlPattern = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|mp4|mp3|wav|pdf|doc|docx|txt|json)/gi;
    const foundUrls: string[] = [];
    
    const findUrlsInValue = (value: any): void => {
      if (typeof value === 'string') {
        const matches = value.match(urlPattern);
        if (matches) {
          foundUrls.push(...matches);
        }
      } else if (Array.isArray(value)) {
        value.forEach(findUrlsInValue);
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(findUrlsInValue);
      }
    };
    
    findUrlsInValue(obj);
    
    // Recursively search nested objects
    let found: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        const nested = searchForArtifacts(value, `${path}.${key}`);
        if (nested.length > 0) {
          found = [...found, ...nested];
        }
      }
    }
    
    return [...found, ...foundUrls];
  };
  
  const foundArtifacts = searchForArtifacts(result);
  
  // If we didn't find artifacts in the expected location but found them via search, use those
  if (finalizedArtifactLinks.length === 0 && foundArtifacts.length > 0) {
    finalizedArtifactLinks = foundArtifacts.map(url => ({ type: 'image', url }));
  }
  
  console.log('🔍 agentProcessor Debug:', {
    hasResult: !!result,
    hasAutoOrchestrateResponse: !!autoOrchestrateResponse,
    hasSwarmSpec: !!swarmSpec,
    hasExecutionPlan: !!executionPlan,
    swarmSpecKeys: swarmSpec ? Object.keys(swarmSpec) : [],
    executionPlanKeys: executionPlan ? Object.keys(executionPlan) : [],
    hasFinalizedArtifactLinks: !!result?.finalizedArtifactLinks,
    hasFinalizedArtifactLinksUnderscore: !!result?.finalized_artifact_links,
    finalizedArtifactLinksLength: finalizedArtifactLinks?.length,
    finalizedArtifactLinksData: finalizedArtifactLinks,
    foundArtifactsFromSearch: foundArtifacts,
    fullResultKeys: result ? Object.keys(result) : [],
    autoOrchestrateResponseKeys: result?.auto_orchestrate_response ? Object.keys(result.auto_orchestrate_response) : [],
    // Final data debugging
    finalDataKeys: finalData ? Object.keys(finalData) : [],
    finalData: finalData,
    // Deep search for artifacts in the result
    deepSearchResult: JSON.stringify(result, null, 2).substring(0, 1000) + '...'
  });

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
  
  // If we don't have structured agents, try to create a simple agent from the M Language spec
  if (!swarmSpec?.agents || !executionPlan?.data_flow) {
    console.log('⚠️ No structured agents found, trying to create from M Language spec...');
    
    // Try to extract agent info from the M Language spec string
    const mLanguageSpec = autoOrchestrateResponse?.m_language_spec || '';
    if (mLanguageSpec && typeof mLanguageSpec === 'string') {
      const agentMatch = mLanguageSpec.match(/agent\s+(\w+)\s*\{[^}]*role:\s*"([^"]*)"[^}]*capabilities:\s*"([^"]*)"[^}]*\}/);
      if (agentMatch) {
        const [, agentName, role, capabilities] = agentMatch;
        const agentsRecord: Record<string, ProcessedAgent> = {
          [agentName]: {
            name: agentName,
            role: role,
            capabilities: capabilities.split(',').map(c => c.trim()),
            inputs: ['user_command'],
            outputs: ['analysis_result'],
            logs: [],
            inputValues: { user_command: autoOrchestrateResponse?.workflow_prompt || 'No prompt available' }
          }
        };
        
        const connections: AgentConnection[] = [];
        
        console.log('✅ Created fallback agent from M Language spec:', agentsRecord);
        return { agents: agentsRecord, connections, finalData, finalizedResult: finalizedResultParsed, finalizedArtifactLinks, executionResults };
      }
    }
    
    console.log('❌ Could not create agents from available data');
    return { agents: {}, connections: [], finalData, finalizedResult: finalizedResultParsed, finalizedArtifactLinks, executionResults };
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
      
      // If no input values found in finalData, try to find them in other locations
      if (Object.keys(inputValues).length === 0) {
        // Try to find input values in the execution results for this agent
        const agentExec = (executionResults as any)[name];
        if (agentExec && agentExec.inputs) {
          Object.assign(inputValues, agentExec.inputs);
        }
        
        // Try to find input values in the agent's data directly
        if (agentExec && agentExec.data && typeof agentExec.data === 'object') {
          Object.assign(inputValues, agentExec.data);
        }
        
        // Try to find input values in the workflow prompt or command
        if (autoOrchestrateResponse?.workflow_prompt) {
          inputValues['workflow_prompt'] = autoOrchestrateResponse.workflow_prompt;
        }
        if (autoOrchestrateResponse?.command) {
          inputValues['command'] = autoOrchestrateResponse.command;
        }
      }
      
      agentsRecord[name].inputValues = inputValues;
      
      console.log(`🔍 Agent ${name} Input Values Debug:`, {
        inputs: data.inputs,
        finalDataKeys: finalData ? Object.keys(finalData) : [],
        inputValues,
        hasInputValues: Object.keys(inputValues).length > 0
      });
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

    console.log(`🔍 Agent ${agentName} Processing:`, {
      hasExec: !!exec,
      execKeys: exec ? Object.keys(exec) : [],
      hasLlmInference: !!exec?.llm_inference,
      llmInferenceKeys: exec?.llm_inference ? Object.keys(exec.llm_inference) : [],
      inputPrompt: exec?.llm_inference?.input_prompt,
      inputPromp: exec?.llm_inference?.input_promp,
      inputValues: agent.inputValues,
      inputValuesKeys: agent.inputValues ? Object.keys(agent.inputValues) : [],
      // Debug the full execution result structure
      execStructure: exec ? JSON.stringify(exec, null, 2).substring(0, 500) + '...' : 'No exec'
    });

    if (exec) {
      // Attach LLM input prompt if available
      let inputPrompt = exec?.llm_inference?.input_prompt ?? exec?.llm_inference?.input_promp;
      
      // If no input prompt found in llm_inference, try other locations
      if (!inputPrompt || typeof inputPrompt !== 'string' || inputPrompt.length === 0) {
        // Try to find input prompt in other locations
        inputPrompt = exec?.input_prompt ?? 
                     exec?.prompt ?? 
                     exec?.input ?? 
                     exec?.message ??
                     exec?.query;
      }
      
      // If still no input prompt, try to use the workflow command as fallback
      if (!inputPrompt || typeof inputPrompt !== 'string' || inputPrompt.length === 0) {
        if (autoOrchestrateResponse?.workflow_prompt) {
          inputPrompt = autoOrchestrateResponse.workflow_prompt;
        } else if (autoOrchestrateResponse?.command) {
          inputPrompt = autoOrchestrateResponse.command;
        }
      }
      
      if (typeof inputPrompt === 'string' && inputPrompt.length > 0) {
        agent.agentInput = inputPrompt;
        console.log(`✅ Set agentInput for ${agentName}:`, inputPrompt.substring(0, 100) + '...');
      } else {
        console.log(`⚠️ No agentInput found for ${agentName}`);
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
    
    // If no agentInput was found and no execution results, try to use workflow command as fallback
    if (!agent.agentInput && !exec) {
      if (autoOrchestrateResponse?.workflow_prompt) {
        agent.agentInput = autoOrchestrateResponse.workflow_prompt;
        console.log(`✅ Set fallback agentInput for ${agentName} from workflow_prompt`);
      } else if (autoOrchestrateResponse?.command) {
        agent.agentInput = autoOrchestrateResponse.command;
        console.log(`✅ Set fallback agentInput for ${agentName} from command`);
      }
    }
  });
  
  // Create connections based on input/output matching
  const connections = createConnections(agentsRecord);
  
  return { agents: agentsRecord, connections, finalData, finalizedResult: finalizedResultParsed, finalizedArtifactLinks, executionResults };
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