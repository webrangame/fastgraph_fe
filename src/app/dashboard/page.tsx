'use client';

import { 
  Search, 
  Bell, 
  Settings, 
  Flag,
  MoreVertical,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Workflow,
  Bot,
  BarChart3,
  Plus,
  UserPlus,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const quickActions = [
  {
    title: 'Create Workflow',
    description: 'Build a new automation workflow',
    icon: Plus,
    gradient: 'from-blue-500 to-blue-600',
    hoverGradient: 'from-blue-600 to-blue-700',
    href: '/dashboard/workflows/create',
    lightColor: '#3b82f6',
    darkBg: 'rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.15)'
  },
  {
    title: 'Add Agent',
    description: 'Deploy a new AI agent',
    icon: UserPlus,
    gradient: 'from-indigo-500 to-purple-600',
    hoverGradient: 'from-indigo-600 to-purple-700',
    href: '/dashboard/agents/create',
    lightColor: '#8b5cf6',
    darkBg: 'rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.15)'
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics',
    icon: Eye,
    gradient: 'from-cyan-500 to-teal-600',
    hoverGradient: 'from-cyan-600 to-teal-700',
    href: '/dashboard/analytics',
    lightColor: '#06b6d4',
    darkBg: 'rgba(6, 182, 212, 0.1), rgba(13, 148, 136, 0.15)'
  }
];

const recentActivities = [
  {
    id: 1,
    title: 'Workflow "Customer Onboarding" completed',
    description: 'Successfully processed 24 new customers',
    time: '2 minutes ago',
    type: 'success',
    icon: CheckCircle
  },
  {
    id: 2,
    title: 'Agent "Support Bot" deployed',
    description: 'AI agent is now live and handling queries',
    time: '15 minutes ago',
    type: 'info',
    icon: Bot
  },
  {
    id: 3,
    title: 'Workflow "Data Sync" failed',
    description: 'Connection timeout error - needs attention',
    time: '1 hour ago',
    type: 'error',
    icon: XCircle
  },
  {
    id: 4,
    title: 'New workflow created',
    description: 'Marketing automation workflow is ready',
    time: '2 hours ago',
    type: 'info',
    icon: Workflow
  },
  {
    id: 5,
    title: 'Agent performance alert',
    description: 'Response time increased for Sales Agent',
    time: '3 hours ago',
    type: 'warning',
    icon: AlertCircle
  }
];

const statsCards = [
  {
    title: 'Total Workflows',
    value: '248',
    change: '+12%',
    changeType: 'positive',
    icon: Workflow,
    gradient: 'from-blue-500 to-blue-600',
    description: 'All created workflows'
  },
  {
    title: 'Active Workflows',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: Settings,
    gradient: 'from-green-500 to-green-600',
    description: 'Currently running'
  },
  {
    title: 'Total Agents',
    value: '47',
    change: '+5%',
    changeType: 'positive',
    icon: Bot,
    gradient: 'from-purple-500 to-purple-600',
    description: 'AI agents deployed'
  },
  {
    title: 'Success Rate',
    value: '94.3%',
    change: '+2.1%',
    changeType: 'positive',
    icon: BarChart3,
    gradient: 'from-orange-500 to-orange-600',
    description: 'Workflow completion rate'
  }
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="theme-bg min-h-screen theme-text-primary transition-colors duration-300">
      {/* Header */}
      <header className="theme-header-bg px-6 py-4 theme-border theme-shadow" style={{ borderBottomWidth: '1px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg theme-hover-bg transition-colors">
              <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 theme-text-muted rounded-full" style={{ backgroundColor: 'var(--text-muted)' }}></div>
                ))}
              </div>
            </button>
            <h1 className="text-xl font-semibold theme-text-primary">TimeLine</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search something.."
                className="theme-input-bg theme-text-primary pl-10 pr-4 py-2 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 theme-border"
                style={{ borderWidth: '1px' }}
              />
            </div>
            <button className="p-2 rounded-lg theme-hover-bg transition-colors">
              <Flag className="w-5 h-5 theme-text-secondary" />
            </button>
            <button className="p-2 rounded-lg theme-hover-bg transition-colors">
              <Bell className="w-5 h-5 theme-text-secondary" />
            </button>
            <button className="p-2 rounded-lg theme-hover-bg transition-colors">
              <Settings className="w-5 h-5 theme-text-secondary" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">NH</span>
              </div>
              <span className="text-sm font-medium theme-text-primary">Nowak Helme</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="theme-card-bg rounded-2xl p-6 theme-shadow hover:shadow-md transition-all duration-300 theme-border hover:border-gray-300" style={{ borderWidth: '1px' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <button className="theme-text-muted hover:text-gray-600 p-1 rounded-lg theme-hover-bg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="theme-text-secondary text-sm font-medium mb-1">{card.title}</h3>
                  <p className="theme-text-muted text-xs">{card.description}</p>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold theme-text-primary mb-1">{card.value}</div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 text-sm font-semibold">{card.change}</span>
                      <span className="theme-text-muted text-xs">vs last month</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar for Success Rate */}
              {card.title === 'Success Rate' && (
                <div className="mt-4">
                  <div className="w-full theme-input-bg rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${card.gradient} h-2 rounded-full transition-all duration-500`}
                      style={{width: card.value}}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Mini chart indicator for other cards */}
              {card.title !== 'Success Rate' && (
                <div className="mt-4 flex justify-end">
                  <div className="h-8 w-16 theme-input-bg rounded-lg flex items-center justify-center">
                    <div className={`w-8 h-2 bg-gradient-to-r ${card.gradient} opacity-60 rounded-full`}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="group relative rounded-2xl p-6 text-left shadow-lg overflow-hidden
                  transition-all duration-500 ease-out
                  hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1
                  transform-gpu will-change-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* Background - Conditional based on theme */}
                <div className="absolute inset-0 rounded-2xl transition-all duration-500">
                  {isDark ? (
                    /* Dark mode gradient background */
                    <div 
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} 
                        before:absolute before:inset-0 before:bg-gradient-to-br before:${action.hoverGradient} before:opacity-0 before:transition-opacity before:duration-500
                        group-hover:before:opacity-100`}
                    />
                  ) : (
                    /* Light mode glassmorphism */
                    <div 
                      className="absolute inset-0 rounded-2xl backdrop-blur-xl border border-white/20 transition-all duration-500 group-hover:backdrop-blur-2xl group-hover:border-white/30"
                      style={{
                        background: `linear-gradient(135deg, ${action.darkBg})`,
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  )}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <action.icon 
                        className="w-6 h-6 transition-all duration-300 group-hover:scale-110" 
                        style={{
                          color: isDark ? 'white' : action.lightColor
                        }}
                      />
                    </div>
                    <ArrowRight 
                      className="w-5 h-5 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:scale-110" 
                      style={{
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : action.lightColor,
                        opacity: isDark ? 1 : 0.8
                      }}
                    />
                  </div>
                  <h3 
                    className="text-lg font-semibold mb-2 transition-all duration-300 group-hover:translate-x-1"
                    style={{
                      color: isDark ? 'white' : (action.lightColor === '#3b82f6' ? '#1e40af' : 
                             action.lightColor === '#8b5cf6' ? '#7c3aed' : '#0891b2')
                    }}
                  >
                    {action.title}
                  </h3>
                  <p 
                    className="text-sm transition-all duration-300 group-hover:translate-x-1"
                    style={{
                      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)',
                      opacity: isDark ? 1 : 0.8
                    }}
                  >
                    {action.description}
                  </p>
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
                  <div 
                    className="absolute top-0 left-0 w-full h-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                    style={{
                      background: isDark 
                        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="theme-card-bg rounded-2xl theme-border theme-shadow" style={{ borderWidth: '1px' }}>
            <div className="p-6 theme-border" style={{ borderBottomWidth: '1px' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold theme-text-primary">Recent Activity</h2>
                <button className="theme-text-muted hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl theme-hover-bg transition-colors">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-100 text-green-600' :
                      activity.type === 'error' ? 'bg-red-100 text-red-600' :
                      activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="theme-text-primary font-medium text-sm mb-1">{activity.title}</h4>
                      <p className="theme-text-secondary text-xs mb-2">{activity.description}</p>
                      <div className="flex items-center theme-text-muted text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  View all activities →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}