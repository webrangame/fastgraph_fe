'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { CreateWorkflowModal, WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';
import { CreateAgentModal, AgentFormData } from '@/components/dashboard/CreateAgentModal';
import { addWorkflow, removeAllWorkflows } from '@/redux/slice/workflowSlice';
import { RECENT_ACTIVITIES } from '@/lib/constants';
import { useGetUserStatsQuery } from '@/redux/api/userStats/userStatsApi';
import { createDynamicStatsCards } from '@/lib/statsUtils';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  
  // Fetch user stats
  const userId = user?.id || user?.userId;
  const { data: userStats, isLoading: isStatsLoading, error: statsError } = useGetUserStatsQuery(userId, {
    skip: !userId
  });
  
  // Create dynamic stats cards based on API data
  const statsCards = createDynamicStatsCards(userStats);
  
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
    
    // Remove all existing workflows
    dispatch(removeAllWorkflows());
    
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
                className="theme-input-bg theme-input-text pl-10 pr-4 py-2 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 theme-border"
              />
            </div>
            <button className="p-2 rounded-lg theme-hover-bg">
              <Icon name="Bell" className="w-5 h-5 theme-text-secondary" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.fullName || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive padding */}
      <div className="p-4 md:p-6">
        
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {isStatsLoading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="theme-card-bg rounded-lg p-6 h-32">
                  <div className="h-4 theme-input-bg rounded w-3/4 mb-2"></div>
                  <div className="h-8 theme-input-bg rounded w-1/2 mb-2"></div>
                  <div className="h-3 theme-input-bg rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : statsError ? (
            // Error state
            <div className="col-span-full text-center p-6 theme-card-bg rounded-lg">
              <p className="theme-text-muted">Failed to load stats. Using default values.</p>
            </div>
          ) : (
            // Actual stats cards
            statsCards.map((card, index) => (
              <StatsCard key={index} {...card} />
            ))
          )}
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