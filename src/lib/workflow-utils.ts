import { Workflow, WorkflowNode } from '@/types/workflow';

export function createNewWorkflowData(index: number): Workflow {
  return {
    id: index.toString(),
    name: `Workflow ${index}`,
    description: '',
    status: 'draft',
    lastModified: 'Just now',
    nodes: [],
    connections: []
  };
}

export function updateWorkflowStatus(
  workflow: Workflow, 
  status: Workflow['status'], 
  lastModified?: string
): Workflow {
  return {
    ...workflow,
    status,
    lastModified: lastModified || workflow.lastModified
  };
}

export function addNodeToWorkflowData(
  workflow: Workflow,
  nodeData: any,
  position: { x: number; y: number }
): Workflow {
  const newNodeId = `node_${Date.now()}`;
  const newNode: WorkflowNode = {
    id: newNodeId,
    type: nodeData.type,
    label: nodeData.name,
    x: position.x,
    y: position.y
  };

  return {
    ...workflow,
    nodes: [...workflow.nodes, newNode],
    lastModified: 'Just now'
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-green-400 animate-pulse';
    case 'active':
      return 'bg-green-400';
    case 'stopped':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface AutoOrchestrateResponse {
  identified_role: string;
  role_confidence: number;
  role_method: string;
  role_reasoning: string;
  m_language_spec: string;
  swarm_result: {
    success: boolean;
    swarm_spec: {
      type: string;
      name: string;
      agents: Record<string, any>;
      workflow: any;
      config: any;
      execution_plan: any;
    };
    execution_results: {
      success: boolean;
      results: Record<string, any>;
    };
  };
  final_data: {
    user_command: string;
    technology_request: string;
    seo_request: string;
    writing_request: string;
    technology_report: string;
    seo_report: string;
    article_output: string;
  };
}

export interface WorkflowSaveData {
  workflow: {
    workflowName: string;
    command: string;
    workflowType: string;
    workflowMetaData: {
      description: string;
      tags: string[];
    };
    recStatus: number;
    finalResult: any;
    createdBy: string;
  };
  agents: Array<{
    workflowId: string;
    agentName: string;
    agentMetaData: {
      role: string;
      priority: number;
    };
    isUserEvolved: boolean;
    lastInput: any;
    lastLogs: string;
    lastOutput: any;
    lastRunAt: string;
    createdBy: string;
  }>;
}

// Hybrid capability display system
export interface HybridCapability {
  id: string;
  name: string;
  icon: string;
  category: 'cognitive' | 'creative' | 'technical' | 'communication';
  color: string;
  description: string;
  examples?: string[];
}

export const CAPABILITY_DEFINITIONS: Record<string, Omit<HybridCapability, 'id'>> = {
  // Cognitive capabilities
  'research': {
    name: 'Research',
    icon: '🔍',
    category: 'cognitive',
    color: '#3B82F6',
    description: 'Gather, analyze, and synthesize information from various sources',
    examples: ['Web scraping', 'Fact-checking', 'Source validation', 'Data mining']
  },
  'analysis': {
    name: 'Analysis',
    icon: '📊',
    category: 'cognitive',
    color: '#3B82F6',
    description: 'Break down complex problems and identify patterns',
    examples: ['Data analysis', 'Trend identification', 'Statistical modeling', 'Report generation']
  },
  'planning': {
    name: 'Planning',
    icon: '🗓️',
    category: 'cognitive',
    color: '#3B82F6',
    description: 'Create structured approaches and strategic roadmaps',
    examples: ['Project planning', 'Task scheduling', 'Resource allocation', 'Timeline creation']
  },
  'reasoning': {
    name: 'Reasoning',
    icon: '🧠',
    category: 'cognitive',
    color: '#3B82F6',
    description: 'Apply logical thinking and problem-solving methodologies',
    examples: ['Logical deduction', 'Critical thinking', 'Decision making', 'Problem solving']
  },
  'problem-solving': {
    name: 'Problem Solving',
    icon: '🧩',
    category: 'cognitive',
    color: '#3B82F6',
    description: 'Identify issues and develop effective solutions',
    examples: ['Root cause analysis', 'Solution design', 'Troubleshooting', 'Optimization']
  },

  // Creative capabilities
  'writing': {
    name: 'Writing',
    icon: '✍️',
    category: 'creative',
    color: '#8B5CF6',
    description: 'Create compelling written content across various formats',
    examples: ['Blog posts', 'Technical docs', 'Creative writing', 'Copywriting']
  },
  'design': {
    name: 'Design',
    icon: '🎨',
    category: 'creative',
    color: '#8B5CF6',
    description: 'Create visual concepts and user experiences',
    examples: ['UI/UX design', 'Graphic design', 'Layout creation', 'Visual branding']
  },
  'ideation': {
    name: 'Ideation',
    icon: '💡',
    category: 'creative',
    color: '#8B5CF6',
    description: 'Generate innovative ideas and creative solutions',
    examples: ['Brainstorming', 'Concept development', 'Innovation', 'Creative thinking']
  },
  'storytelling': {
    name: 'Storytelling',
    icon: '📚',
    category: 'creative',
    color: '#8B5CF6',
    description: 'Craft engaging narratives and compelling stories',
    examples: ['Narrative creation', 'Content storytelling', 'Brand stories', 'User stories']
  },
  'content-creation': {
    name: 'Content Creation',
    icon: '📝',
    category: 'creative',
    color: '#8B5CF6',
    description: 'Produce various types of digital and written content',
    examples: ['Articles', 'Social media', 'Marketing content', 'Educational materials']
  },

  // Technical capabilities
  'api-calls': {
    name: 'API Integration',
    icon: '🔌',
    category: 'technical',
    color: '#10B981',
    description: 'Connect and interact with external services and APIs',
    examples: ['REST APIs', 'GraphQL', 'Webhooks', 'Third-party integrations']
  },
  'data-processing': {
    name: 'Data Processing',
    icon: '⚙️',
    category: 'technical',
    color: '#10B981',
    description: 'Transform, clean, and manipulate data efficiently',
    examples: ['Data transformation', 'ETL processes', 'Data cleaning', 'Format conversion']
  },
  'automation': {
    name: 'Automation',
    icon: '🤖',
    category: 'technical',
    color: '#10B981',
    description: 'Automate repetitive tasks and workflows',
    examples: ['Workflow automation', 'Task scheduling', 'Process optimization', 'Bot creation']
  },
  'coding': {
    name: 'Coding',
    icon: '💻',
    category: 'technical',
    color: '#10B981',
    description: 'Write, review, and optimize code across languages',
    examples: ['Programming', 'Code review', 'Debugging', 'Algorithm design']
  },
  'integration': {
    name: 'Integration',
    icon: '🔗',
    category: 'technical',
    color: '#10B981',
    description: 'Connect different systems and services seamlessly',
    examples: ['System integration', 'Data synchronization', 'Service orchestration', 'Middleware']
  },

  // Communication capabilities
  'translation': {
    name: 'Translation',
    icon: '🌐',
    category: 'communication',
    color: '#F59E0B',
    description: 'Convert content between different languages accurately',
    examples: ['Language translation', 'Localization', 'Cultural adaptation', 'Multilingual content']
  },
  'summarization': {
    name: 'Summarization',
    icon: '📋',
    category: 'communication',
    color: '#F59E0B',
    description: 'Condense complex information into clear, concise summaries',
    examples: ['Document summaries', 'Meeting notes', 'Executive summaries', 'Key insights']
  },
  'presentation': {
    name: 'Presentation',
    icon: '📊',
    category: 'communication',
    color: '#F59E0B',
    description: 'Create and deliver compelling presentations',
    examples: ['Slide creation', 'Data visualization', 'Public speaking', 'Visual storytelling']
  },
  'documentation': {
    name: 'Documentation',
    icon: '📄',
    category: 'communication',
    color: '#F59E0B',
    description: 'Create comprehensive and clear documentation',
    examples: ['Technical docs', 'User guides', 'API documentation', 'Process documentation']
  },
  'feedback': {
    name: 'Feedback',
    icon: '💬',
    category: 'communication',
    color: '#F59E0B',
    description: 'Provide constructive feedback and recommendations',
    examples: ['Code reviews', 'Content feedback', 'Performance reviews', 'Improvement suggestions']
  }
};


export const CATEGORY_COLORS = {
  cognitive: '#3B82F6',
  creative: '#8B5CF6', 
  technical: '#10B981',
  communication: '#F59E0B'
} as const;

export function createHybridCapabilities(capabilities: string[]): HybridCapability[] {
  return capabilities.map((cap, index) => {
    const normalizedCap = cap.toLowerCase().replace(/\s+/g, '-');
    const definition = CAPABILITY_DEFINITIONS[normalizedCap];
    
    if (definition) {
      return {
        id: `cap-${index}`,
        ...definition
      };
    }
    
    // Fallback for unknown capabilities
    return {
      id: `cap-${index}`,
      name: cap,
      icon: '⚡',
      category: 'technical' as const,
      color: CATEGORY_COLORS.technical,
      description: `${cap} capability`,
      examples: [`${cap} related tasks`]
    };
  });
}


export function transformAutoOrchestrateToWorkflow(
  response: AutoOrchestrateResponse,
  userId?: string
): WorkflowSaveData {
  const { swarm_result, final_data } = response;
  
  // Use provided userId or fallback to a default
  const finalUserId = userId || 'unknown-user';
  
  // Extract workflow information
  const workflowName = swarm_result.swarm_spec.name || 'Auto Generated Workflow';
  const command = final_data.user_command || 'Auto orchestrated workflow';
  
  // Extract agents from swarm spec
  const agents = Object.entries(swarm_result.swarm_spec.agents).map(([key, agent], index) => ({
    workflowId: `workflow_${Date.now()}`,
    agentName: agent.name || key,
    agentMetaData: {
      role: agent.role || 'general',
      priority: index + 1
    },
    isUserEvolved: false,
    lastInput: {},
    lastLogs: 'Auto orchestrated agent',
    lastOutput: swarm_result.execution_results.results[key]?.outputs || {},
    lastRunAt: new Date().toISOString(),
    createdBy: finalUserId
  }));

  // Create workflow data
  const workflow = {
    workflowName,
    command,
    workflowType: 'processing',
    workflowMetaData: {
      description: `Auto orchestrated workflow for: ${command}`,
      tags: ['auto-orchestrated', 'ai-generated']
    },
    recStatus: 1,
    finalResult: swarm_result.execution_results.results || {},
    createdBy: finalUserId
  };

  return {
    workflow,
    agents
  };
}