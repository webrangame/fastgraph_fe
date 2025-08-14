'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { CreateWorkflowModal, WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';
import { CreateAgentModal, AgentFormData } from '@/components/dashboard/CreateAgentModal';
import { addWorkflow } from '@/redux/slice/workflowSlice';
import { QUICK_ACTIONS, STATS_CARDS, RECENT_ACTIVITIES } from '@/lib/constants';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const handleCreateWorkflow = () => {
    setIsWorkflowModalOpen(true);
  };

  const handleAddAgent = () => {
    setIsAgentModalOpen(true);
  };

  const handleWorkflowSubmit = (data: WorkflowFormData) => {
    // Handle the workflow creation here
    console.log('Creating workflow:', data);
    
    // Dispatch the workflow data to the store
    const workflowData = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    dispatch(addWorkflow(workflowData));
    
    // Close the modal
    setIsWorkflowModalOpen(false);
    
    // Navigate to the workflows page
    router.push('/dashboard/workflows');
  };

  const handleAgentSubmit = (data: AgentFormData) => {
    // Handle the agent creation here
    console.log('Creating agent:', data);
    
    // You can add your agent creation logic here
    // For example: save to database, deploy agent, etc.
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.title === 'Create Workflow') {
      handleCreateWorkflow();
    } else if (action.title === 'Add Agent') {
      handleAddAgent();
    } else {
      // Handle other actions normally
      window.location.href = action.href;
    }
  };

  return (
    <div className="theme-bg min-h-screen theme-text-primary transition-colors duration-300">
      
      {/* Desktop Header - Hidden on mobile */}
      <header className="hidden lg:block theme-header-bg px-6 py-4 theme-border theme-shadow" 
              style={{ borderBottomWidth: '1px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg theme-hover-bg">
              <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 theme-text-muted rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                ))}
              </div>
            </button>
            <h1 className="text-xl font-semibold">TimeLine</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search something.."
                className="theme-input-bg pl-10 pr-4 py-2 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 theme-border"
              />
            </div>
            {['Flag', 'Bell', 'Settings'].map((iconName) => (
              <button key={iconName} className="p-2 rounded-lg theme-hover-bg">
                <Icon name={iconName as any} className="w-5 h-5 theme-text-secondary" />
              </button>
            ))}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">NH</span>
              </div>
              <span className="text-sm font-medium">Nowak Helme</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive padding */}
      <div className="p-4 md:p-6">
        
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {STATS_CARDS.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Quick Actions - Responsive Layout */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action, index) => (
              <QuickActionCard 
                key={index} 
                {...action} 
                onClick={() => handleQuickAction(action)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity - Mobile Optimized */}
        <Card>
          <div className="p-4 md:p-6 theme-border" style={{ borderBottomWidth: '1px' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Recent Activity</h2>
              <Icon name="MoreVertical" className="w-5 h-5 theme-text-muted hover:text-gray-600 cursor-pointer" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {RECENT_ACTIVITIES.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium py-2 px-4 rounded-lg theme-hover-bg">
                View all activities →
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onSubmit={handleWorkflowSubmit}
      />

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSubmit={handleAgentSubmit}
      />
    </div>
  );
}