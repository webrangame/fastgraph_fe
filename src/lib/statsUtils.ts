interface UserStatsResponse {
  userId: string;
  totalWorkflows: number;
  totalNumberOfAgents: number;
  workflowsByStatus: {
    pending: number;
    installing: number;
    completed: number;
    failed: number;
  };
}

interface StatsCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  colors: { light: string; gradient: string };
  description: string;
  hasProgress?: boolean;
}

export function createDynamicStatsCards(userStats: UserStatsResponse | undefined): StatsCard[] {
  // Default/loading values
  const defaultStats = {
    totalWorkflows: 0,
    totalNumberOfAgents: 0,
    workflowsByStatus: {
      pending: 0,
      installing: 0,
      completed: 0,
      failed: 0
    }
  };

  const stats = userStats || defaultStats;
  const activeWorkflows = stats.workflowsByStatus.installing + stats.workflowsByStatus.completed;
  const successRate = stats.totalWorkflows > 0 
    ? ((stats.workflowsByStatus.completed / stats.totalWorkflows) * 100).toFixed(1)
    : '0.0';

  return [
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows.toString(),
      change: userStats ? '+12%' : '...',
      icon: 'Workflow',
      colors: { light: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
      description: 'All created workflows'
    },
    {
      title: 'Active Workflows', 
      value: '--',
      change: userStats ? '+8%' : '...',
      icon: 'Settings',
      colors: { light: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
      description: 'Currently running'
    },
    {
      title: 'Total Agents',
      value: stats.totalNumberOfAgents.toString(), 
      change: userStats ? '+5%' : '...',
      icon: 'Bot',
      colors: { light: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
      description: 'AI agents deployed'
    },
    {
      title: 'Success Rate',
      value: '--',
      change: userStats ? '+2.1%' : '...', 
      icon: 'BarChart3',
      colors: { light: '#f59e0b', gradient: 'from-amber-400 to-orange-500' },
      description: 'Workflow completion rate',
      hasProgress: true
    }
  ];
}

export type { UserStatsResponse };
