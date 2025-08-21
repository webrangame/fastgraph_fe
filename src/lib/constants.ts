import { Bot } from 'lucide-react';
import { Workflow, AgentData } from '@/types/workflow';


export const QUICK_ACTIONS = [
  {
    title: 'Create Workflow',
    description: 'Build a new automation workflow',
    icon: 'Plus',
    colors: { light: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    href: '/dashboard/workflows/create'
  },
  {
    title: 'Add Agent', 
    description: 'Deploy a new AI agent',
    icon: 'UserPlus',
    colors: { light: '#8b5cf6', gradient: 'from-indigo-500 to-purple-600' },
    href: '/dashboard/agents/create'
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics', 
    icon: 'Eye',
    colors: { light: '#06b6d4', gradient: 'from-cyan-500 to-teal-600' },
    href: '/dashboard/analytics'
  }
];

export const STATS_CARDS = [
  {
    title: 'Total Workflows',
    value: '248',
    change: '+12%',
    icon: 'Workflow',
    colors: { light: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    description: 'All created workflows'
  },
  {
    title: 'Active Workflows', 
    value: '156',
    change: '+8%',
    icon: 'Settings',
    colors: { light: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
    description: 'Currently running'
  },
  {
    title: 'Total Agents',
    value: '47', 
    change: '+5%',
    icon: 'Bot',
    colors: { light: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    description: 'AI agents deployed'
  },
  {
    title: 'Success Rate',
    value: '94.3%',
    change: '+2.1%', 
    icon: 'BarChart3',
    colors: { light: '#f59e0b', gradient: 'from-amber-400 to-orange-500' },
    description: 'Workflow completion rate',
    hasProgress: true
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Workflow "Customer Onboarding" completed',
    description: 'Successfully processed 24 new customers',
    time: '2 minutes ago',
    type: 'success' as const,
    icon: 'CheckCircle'
  },
  {
    id: 2,
    title: 'Agent "Support Bot" deployed', 
    description: 'AI agent is now live and handling queries',
    time: '15 minutes ago',
    type: 'info' as const,
    icon: 'Bot'
  },
  {
    id: 3,
    title: 'Workflow "Data Sync" failed',
    description: 'Connection timeout error - needs attention', 
    time: '1 hour ago',
    type: 'error' as const,
    icon: 'XCircle'
  }
];

export const createdAgents: AgentData[] = [
  {
    id: 'customer-service-agent',
    name: 'Customer Service Agent',
    icon: Bot,
    color: 'bg-blue-500',
    category: 'Agents'
  },
  {
    id: 'billing-agent',
    name: 'Billing Agent', 
    icon: Bot,
    color: 'bg-green-500',
    category: 'Agents'
  },
  {
    id: 'technical-support-agent',
    name: 'Technical Support Agent',
    icon: Bot,
    color: 'bg-purple-500', 
    category: 'Agents'
  }
];

// Sample workflows (empty canvas)
export const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Customer Service Router',
    status: 'active',
    lastModified: '2 hours ago',
    nodes: [],
    connections: [],
    description: ''
  }
];

export const MAX_WORKFLOWS = 5;

export const WORKFLOW_STATUSES = {
  ACTIVE: 'active' as const,
  DRAFT: 'draft' as const,
  INACTIVE: 'inactive' as const,
  RUNNING: 'running' as const,
  STOPPED: 'stopped' as const
};