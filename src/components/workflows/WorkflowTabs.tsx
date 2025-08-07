'use client';

import { Plus, X } from 'lucide-react';
import { Workflow } from '@/types/workflow';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface WorkflowTabsProps {
  workflows: Workflow[];
  activeWorkflow: string | null;
  onSelectWorkflow: (workflowId: string) => void;
  onCloseWorkflow: (workflowId: string) => void;
  onCreateNew: () => void;
  maxWorkflows: number;
}

export function WorkflowTabs({
  workflows,
  activeWorkflow,
  onSelectWorkflow,
  onCloseWorkflow,
  onCreateNew,
  maxWorkflows
}: WorkflowTabsProps) {
  return (
    <div className="flex items-center px-4 pb-2">
      <div className="flex space-x-1 flex-1">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg cursor-pointer relative transition-colors ${
              activeWorkflow === workflow.id
                ? 'theme-bg theme-text-primary border-t-2 border-blue-500'
                : 'theme-input-bg theme-text-secondary theme-hover-bg'
            }`}
            onClick={() => onSelectWorkflow(workflow.id)}
          >
            <StatusIndicator status={workflow.status} />
            <span className="text-sm font-medium">{workflow.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseWorkflow(workflow.id);
              }}
              className="theme-text-muted hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {workflows.length < maxWorkflows && (
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-1 px-3 py-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Workflow</span>
        </button>
      )}
    </div>
  );
}