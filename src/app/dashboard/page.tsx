'use client';

import { 
  Search, 
  Bell, 
  Settings, 
  Sun, 
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

const quickActions = [
  {
    title: 'Create Workflow',
    description: 'Build a new automation workflow',
    icon: Plus,
    gradient: 'from-blue-500 to-blue-600',
    hoverGradient: 'from-blue-600 to-blue-700',
    href: '/dashboard/workflows/create'
  },
  {
    title: 'Add Agent',
    description: 'Deploy a new AI agent',
    icon: UserPlus,
    gradient: 'from-green-500 to-green-600',
    hoverGradient: 'from-green-600 to-green-700',
    href: '/dashboard/agents/create'
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics',
    icon: Eye,
    gradient: 'from-purple-500 to-purple-600',
    hoverGradient: 'from-purple-600 to-purple-700',
    href: '/dashboard/analytics'
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
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
                ))}
              </div>
            </button>
            <h1 className="text-xl font-semibold">TimeLine</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search something.."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Flag className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Sun className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">NH</span>
              </div>
              <span className="text-sm font-medium">Nowak Helme</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-700 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-gray-300 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-gray-500 text-xs">{card.description}</p>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 text-sm font-semibold">{card.change}</span>
                      <span className="text-gray-500 text-xs">vs last month</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar for Success Rate */}
              {card.title === 'Success Rate' && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
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
                  <div className="h-8 w-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className={`w-8 h-2 bg-gradient-to-r ${card.gradient} opacity-60 rounded-full`}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`group relative bg-gradient-to-br ${action.gradient} hover:bg-gradient-to-br hover:${action.hoverGradient} rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500/20 text-green-400' :
                      activity.type === 'error' ? 'bg-red-500/20 text-red-400' :
                      activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm mb-1">{activity.title}</h4>
                      <p className="text-gray-400 text-xs mb-2">{activity.description}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
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