'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Play, Pause, Clock, CheckCircle, ChevronLeft, ChevronRight, Search, X, Loader2, Trash2 } from 'lucide-react';
import type { Workflow } from '@/types/workflow';
import { useGetDataCreatedByQuery, useDeleteDataMutation } from '../../../redux/api/autoOrchestrate/autoOrchestrateApi';

interface WorkflowsSidebarProps {
  isMobile?: boolean;
  onWorkflowSelect?: (workflowId: string) => void;
  currentWorkflowId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userId?: string; // Add userId prop
}

// API Response type for getDataCreatedBy
interface DataCreatedByResponse {
  dataId: string;
  dataName: string;
  description: string;
  dataType: string;
  dataContent: any;
  status: string;
  errorMessage?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  installedAt: string;
}

// Transform API response to Workflow format
const transformDataToWorkflows = (dataResponse: DataCreatedByResponse[]): Workflow[] => {
  return dataResponse
    .filter(item => item.dataType === 'json' && item.dataContent?.autoOrchestrateResult)
    .map((item) => {
      const workflow = item.dataContent.autoOrchestrateResult;
      return {
        id: item.dataId,
        name: item.dataName ,
        description: item.description ,
        status: item.status,
        lastModified: formatDate(item.installedAt),
        nodes: workflow.nodes || [],
        connections: workflow.connections || []
      };
    });
};



// Format date to readable string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

export function WorkflowsSidebar({ isMobile = false, onWorkflowSelect, currentWorkflowId, isCollapsed = false, onToggleCollapse, userId = '1' }: WorkflowsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingWorkflow, setDeletingWorkflow] = useState<string | null>(null);
  
  // Use the API to fetch workflows - only if userId is provided
  const { 
    data: apiData, 
    error, 
    isLoading, 
    isError 
  } = useGetDataCreatedByQuery(userId, {
    skip: !userId || userId === '1' // Skip if no userId or default value
  });

  // Delete workflow mutation
  const [deleteData] = useDeleteDataMutation();

  // Transform API data to workflows
  const workflows = useMemo(() => {
    if (apiData) {
      return transformDataToWorkflows(apiData as DataCreatedByResponse[]);
    }
    return [];
  }, [apiData]);

  const handleWorkflowClick = (workflow: Workflow) => {
    if (onWorkflowSelect) {
      onWorkflowSelect(workflow.id);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleDeleteWorkflow = async (workflowId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent workflow selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingWorkflow(workflowId);
      await deleteData(workflowId).unwrap();
      
      // If the deleted workflow was currently selected, clear the selection
      if (currentWorkflowId === workflowId && onWorkflowSelect) {
        onWorkflowSelect('');
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    } finally {
      setDeletingWorkflow(null);
    }
  };

  // Filter workflows based on search query
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) return workflows;
    
    const query = searchQuery.toLowerCase();
    return workflows.filter(workflow => 
      workflow.name.toLowerCase().includes(query) ||
      workflow.description.toLowerCase().includes(query)
    );
  }, [searchQuery, workflows]);

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'running':
        return <Play className="w-3 h-3 text-blue-500" />;
      case 'draft':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'inactive':
        return <FileText className="w-3 h-3 text-gray-500" />;
      default:
        return <FileText className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : isCollapsed ? 'w-16' : 'w-[300px]'} theme-sidebar-bg ${!isMobile ? 'theme-border border-r' : ''} transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}>
      <div className="p-4 flex-1 overflow-y-auto scrollbar-very-thin">
        {!isMobile && (
          <div className="mb-4 flex items-center justify-between">
            {!isCollapsed && (
              <h3 className="text-sm font-semibold theme-text-secondary">Available Workflows</h3>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 theme-hover-bg rounded-lg theme-text-secondary hover:theme-text-primary transition-colors ml-auto"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Search Bar - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm theme-input-bg theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 theme-hover-bg rounded-sm hover:theme-text-primary theme-text-muted transition-colors"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Search Bar */}
        {isMobile && (
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-base theme-input-bg theme-border border rounded-lg theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 theme-hover-bg rounded-sm hover:theme-text-primary theme-text-muted transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {!userId || userId === '1' ? (
            // No user authenticated
            <div className="text-center py-8">
              <FileText className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm theme-text-muted mb-1">Please log in to view workflows</p>
              <p className="text-xs theme-text-muted">
                Authentication required to load your workflows
              </p>
            </div>
          ) : isLoading ? (
            // Loading state
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin theme-text-muted mr-2" />
              <span className="text-sm theme-text-muted">Loading workflows...</span>
            </div>
          ) : isError ? (
            // Error state
            <div className="text-center py-8">
              <div className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50">
                <FileText className="w-full h-full" />
              </div>
              <p className="text-sm theme-text-muted mb-1">Failed to load workflows</p>
              <p className="text-xs theme-text-muted">
                {'message' in error ? error.message : 'Please try again later'}
              </p>
            </div>
          ) : filteredWorkflows.length > 0 ? (
            filteredWorkflows.map((workflow) => {
              const isSelected = currentWorkflowId === workflow.id;
              return (
                <div 
                  key={workflow.id}
                  className={`${isCollapsed ? 'p-2' : 'p-3'} rounded-lg cursor-pointer group transition-all duration-200 ${
                    isSelected 
                      ? 'theme-card-bg theme-border border theme-shadow-sm' 
                      : 'theme-hover-bg hover:theme-shadow-sm'
                  } ${isMobile ? 'active:scale-95' : ''}`}
                  onClick={() => handleWorkflowClick(workflow)}
                  title={isCollapsed ? workflow.name : undefined}
                >
                  {isCollapsed ? (
                    // Collapsed view - clean icon-only display with theme colors
                    <div className="flex justify-center">
                      <div className="p-2 rounded-lg theme-card-bg theme-border border theme-shadow">
                        <FileText className="w-4 h-4 theme-text-secondary" />
                      </div>
                    </div>
                  ) : (
                    // Expanded view - full content with theme colors
                    <div className="flex items-start space-x-3 relative">
                      <div className="p-2 rounded-lg theme-card-bg theme-border border theme-shadow">
                        <FileText className="w-4 h-4 theme-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`${isMobile ? 'text-base' : 'text-sm'} theme-text-primary font-medium truncate max-w-[150px]`} title={workflow.name}>
                            {workflow.name}
                          </span>
                          {getStatusIcon(workflow.status)}
                        </div>
                        <p className="text-xs theme-text-muted mb-2 line-clamp-2">
                          {workflow.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs theme-text-muted">
                            {workflow.lastModified}
                          </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          workflow.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          workflow.status === 'running' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' :
                          workflow.status === 'draft' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' :
                          'theme-input-bg theme-text-muted border theme-border'
                        }`}>
                            {workflow.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Delete Button - Top Right Corner */}
                      <button
                        onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                        disabled={deletingWorkflow === workflow.id}
                        className="absolute top-1 right-0 p-0 transition-all duration-200 hover:bg-red-500/10 rounded-md flex items-center justify-center"
                        title="Delete workflow"
                      >
                        {deletingWorkflow === workflow.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-red-500 hover:text-red-600" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : searchQuery ? (
            // No search results message
            <div className="text-center py-8">
              <Search className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm theme-text-muted mb-1">No workflows found</p>
              <p className="text-xs theme-text-muted">
                Try adjusting your search or{' '}
                <button 
                  onClick={handleClearSearch}
                  className="theme-text-secondary hover:theme-text-primary underline"
                >
                  clear search
                </button>
              </p>
            </div>
          ) : (
            // No workflows available message
            <div className="text-center py-8">
              <FileText className="w-12 h-12 theme-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm theme-text-muted mb-1">No workflows available</p>
              <p className="text-xs theme-text-muted">
                Create your first workflow to get started
              </p>
            </div>
          )}
        </div>

        {isMobile && !isCollapsed && (
          <div className="mt-6 p-3 theme-card-bg rounded-lg theme-border border">
            <p className="text-xs theme-text-muted text-center">
              Tap a workflow to select and work with it
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
