/**
 * Mock data generator for custom user-created agents
 * Generates realistic agent data with capabilities, inputs, outputs, and logs
 */

export interface CustomAgentData {
  name: string;
  role: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  logs: Array<{
    id: string;
    message: string;
    timestamp: number;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
  isCustom: boolean;
  inputValues?: Record<string, any>;
}

/**
 * Generate mock data for a custom agent
 */
export function generateCustomAgentMockData(
  agentName: string,
  description: string
): CustomAgentData {
  // Generate capabilities based on role description keywords
  const capabilities = generateCapabilitiesFromDescription(description);
  
  // Generate inputs/outputs based on capabilities
  const { inputs, outputs } = generateIOFromCapabilities(capabilities);
  
  // Generate initial logs
  const logs = [
    {
      id: `log-${Date.now()}-1`,
      message: `Custom agent "${agentName}" initialized successfully`,
      timestamp: Date.now(),
      type: 'success' as const
    },
    {
      id: `log-${Date.now()}-2`,
      message: `Role: ${description}`,
      timestamp: Date.now() + 100,
      type: 'info' as const
    },
    {
      id: `log-${Date.now()}-3`,
      message: `Capabilities loaded: ${capabilities.join(', ')}`,
      timestamp: Date.now() + 200,
      type: 'info' as const
    },
    {
      id: `log-${Date.now()}-4`,
      message: 'Agent is ready to process tasks',
      timestamp: Date.now() + 300,
      type: 'success' as const
    }
  ];

  return {
    name: agentName,
    role: description,
    capabilities,
    inputs,
    outputs,
    logs,
    isCustom: true,
    inputValues: {}
  };
}

/**
 * Generate capabilities based on role description
 */
function generateCapabilitiesFromDescription(description: string): string[] {
  const desc = description.toLowerCase();
  const capabilities: string[] = [];
  
  // Cognitive capabilities
  if (desc.includes('research') || desc.includes('analyze') || desc.includes('investigate')) {
    capabilities.push('research', 'analysis');
  }
  if (desc.includes('plan') || desc.includes('organize') || desc.includes('schedule')) {
    capabilities.push('planning');
  }
  if (desc.includes('think') || desc.includes('reason') || desc.includes('logic')) {
    capabilities.push('reasoning');
  }
  if (desc.includes('solve') || desc.includes('problem')) {
    capabilities.push('problem-solving');
  }
  
  // Creative capabilities
  if (desc.includes('write') || desc.includes('content') || desc.includes('article')) {
    capabilities.push('writing', 'content-creation');
  }
  if (desc.includes('design') || desc.includes('visual') || desc.includes('ui')) {
    capabilities.push('design');
  }
  if (desc.includes('create') || desc.includes('generate') || desc.includes('idea')) {
    capabilities.push('ideation');
  }
  if (desc.includes('story') || desc.includes('narrative')) {
    capabilities.push('storytelling');
  }
  
  // Technical capabilities
  if (desc.includes('api') || desc.includes('integrate') || desc.includes('connect')) {
    capabilities.push('api-calls', 'integration');
  }
  if (desc.includes('data') || desc.includes('process') || desc.includes('transform')) {
    capabilities.push('data-processing');
  }
  if (desc.includes('automat') || desc.includes('workflow')) {
    capabilities.push('automation');
  }
  if (desc.includes('code') || desc.includes('program') || desc.includes('develop')) {
    capabilities.push('coding');
  }
  
  // Communication capabilities
  if (desc.includes('translate') || desc.includes('language')) {
    capabilities.push('translation');
  }
  if (desc.includes('summar') || desc.includes('condense')) {
    capabilities.push('summarization');
  }
  if (desc.includes('present') || desc.includes('report')) {
    capabilities.push('presentation');
  }
  if (desc.includes('document') || desc.includes('guide')) {
    capabilities.push('documentation');
  }
  if (desc.includes('feedback') || desc.includes('review')) {
    capabilities.push('feedback');
  }
  
  // If no capabilities matched, add generic ones
  if (capabilities.length === 0) {
    capabilities.push('analysis', 'processing', 'communication');
  }
  
  // Remove duplicates and return
  return [...new Set(capabilities)];
}

/**
 * Generate inputs and outputs based on capabilities
 */
function generateIOFromCapabilities(capabilities: string[]): {
  inputs: string[];
  outputs: string[];
} {
  const inputs: string[] = [];
  const outputs: string[] = [];
  
  // Map capabilities to typical inputs/outputs
  const capabilityIO: Record<string, { inputs: string[]; outputs: string[] }> = {
    'research': {
      inputs: ['search_query', 'topic'],
      outputs: ['research_data', 'findings']
    },
    'analysis': {
      inputs: ['data', 'research_data'],
      outputs: ['analysis_report', 'insights']
    },
    'writing': {
      inputs: ['topic', 'research_data', 'requirements'],
      outputs: ['article', 'content', 'text_output']
    },
    'content-creation': {
      inputs: ['brief', 'guidelines'],
      outputs: ['content', 'media']
    },
    'design': {
      inputs: ['requirements', 'specifications'],
      outputs: ['design', 'visual_output']
    },
    'api-calls': {
      inputs: ['api_endpoint', 'parameters'],
      outputs: ['api_response', 'data']
    },
    'data-processing': {
      inputs: ['raw_data'],
      outputs: ['processed_data', 'formatted_data']
    },
    'automation': {
      inputs: ['task_definition', 'parameters'],
      outputs: ['execution_result', 'status']
    },
    'translation': {
      inputs: ['text', 'source_language', 'target_language'],
      outputs: ['translated_text']
    },
    'summarization': {
      inputs: ['document', 'text'],
      outputs: ['summary', 'key_points']
    },
    'documentation': {
      inputs: ['content', 'specifications'],
      outputs: ['documentation', 'guide']
    }
  };
  
  // Collect inputs and outputs from capabilities
  capabilities.forEach(cap => {
    const io = capabilityIO[cap];
    if (io) {
      inputs.push(...io.inputs);
      outputs.push(...io.outputs);
    }
  });
  
  // If no I/O mapped, add generic ones
  if (inputs.length === 0) {
    inputs.push('user_input', 'parameters');
  }
  if (outputs.length === 0) {
    outputs.push('result', 'output');
  }
  
  // Remove duplicates
  return {
    inputs: [...new Set(inputs)],
    outputs: [...new Set(outputs)]
  };
}

/**
 * Generate a unique ID for custom agents (using mock-agent- prefix for consistency)
 */
export function generateCustomAgentId(): string {
  return `mock-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

