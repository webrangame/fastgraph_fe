'use client';

import { FileText, Play, Pause, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Workflow } from '@/types/workflow';

interface AgentSidebarProps {
  isMobile?: boolean;
  onWorkflowSelect?: (workflowId: string) => void;
  currentWorkflowId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Mock data for available workflows
const mockWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Poem Generator',
    description: 'Create beautiful poems with AI assistance',
    status: 'active',
    lastModified: '2 hours ago',
    nodes: [],
    connections: []
  },
  {
    id: 'wf-2', 
    name: 'React Essay Writer',
    description: 'Generate technical essays about React development',
    status: 'draft',
    lastModified: '1 day ago',
    nodes: [],
    connections: []
  },
  {
    id: 'wf-3',
    name: 'Code Review Assistant',
    description: 'Automated code review and suggestions',
    status: 'inactive',
    lastModified: '3 days ago',
    nodes: [],
    connections: []
  },
  {
    id: 'wf-4',
    name: 'Data Analysis Pipeline',
    description: 'Process and analyze datasets automatically',
    status: 'running',
    lastModified: '5 minutes ago',
    nodes: [],
    connections: []
  },
  {
    id: 'wf-5',
    name: 'Content Summarizer',
    description: 'Summarize long articles and documents',
    status: 'stopped',
    lastModified: '1 week ago',
    nodes: [],
    connections: []
  }
];

export function AgentSidebar({ isMobile = false, onWorkflowSelect, currentWorkflowId, isCollapsed = false, onToggleCollapse }: AgentSidebarProps) {
  const handleWorkflowClick = (workflow: Workflow) => {
    if (onWorkflowSelect) {
      onWorkflowSelect(workflow.id);
    }
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'running':
        return <Play className="w-3 h-3 text-blue-500" />;
      case 'stopped':
        return <Pause className="w-3 h-3 text-red-500" />;
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
      case 'stopped':
        return 'bg-red-500';
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
        
        <div className="space-y-2">
          {mockWorkflows.map((workflow) => {
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
                  // Collapsed view - only show icon
                  <div className="flex justify-center">
                    <div className={`p-2 rounded-lg ${getStatusColor(workflow.status)} relative`}>
                      <FileText className="w-4 h-4 text-white" />
                      {/* Small status indicator */}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(workflow.status)}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Expanded view - full content
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(workflow.status)}`}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`${isMobile ? 'text-base' : 'text-sm'} theme-text-primary font-medium truncate`}>
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          workflow.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          workflow.status === 'running' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          workflow.status === 'stopped' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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