export interface ProcessedAgent {
  name: string;
  role: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
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
}

export function processAgentsFromResponse(result: any): AgentProcessingResult {
  const swarmSpec = result.auto_orchestrate_response?.swarm_result?.swarm_spec;
  const executionPlan = result.auto_orchestrate_response?.swarm_result?.swarm_spec?.execution_plan;
  
  if (!swarmSpec?.agents || !executionPlan?.data_flow) {
    return { agents: {}, connections: [] };
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
  
  // Create connections based on input/output matching
  const connections = createConnections(agentsRecord);
  
  return { agents: agentsRecord, connections };
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