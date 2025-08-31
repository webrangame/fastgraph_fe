'use client';

import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Menu, X, Play, Square, Save, Trash2, Plus, MoreVertical, Users, Bot } from 'lucide-react';
import { useState } from 'react';

interface MobileWorkflowHeaderProps {
  workflows: any[];
  activeWorkflow: string | null;
  currentWorkflow: any;
  isRunning: boolean;
  onMenuToggle: () => void;
  onCreateNew: () => void;
  onSelectWorkflow: (id: string) => void;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onDelete: () => void;
  menuOpen: boolean;
}

export function MobileWorkflowHeader({
  workflows,
  activeWorkflow,
  currentWorkflow,
  isRunning,
  onMenuToggle,
  onCreateNew,
  onSelectWorkflow,
  onExecute,
  onStop,
  onSave,
  onDelete,
  menuOpen
}: MobileWorkflowHeaderProps) {
  const [showActions, setShowActions] = useState(false);

  const executeButtonProps = {
    onClick: isRunning ? onStop : onExecute,
    disabled: !currentWorkflow || (!isRunning && currentWorkflow?.nodes?.length === 0),
    variant: isRunning ? 'danger' as const : 'success' as const,
    icon: isRunning ? Square : Play,
    children: isRunning ? 'Stop' : 'Execute'
  };

  return (
    <>
      {/* Main Header */}
      <div className="flex items-center justify-between p-4 theme-header-bg theme-border border-b">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="p-2 theme-hover-bg rounded-lg theme-text-primary group"
          >
            {menuOpen ? (
              <X size={20} className="transition-transform duration-200" />
            ) : (
              <Bot 
                size={20} 
                className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-active:scale-95" 
              />
            )}
          </button>
          <h1 className="text-lg font-semibold theme-text-primary">
            Workflows
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentWorkflow && (
            <StatusIndicator status={currentWorkflow.status} />
          )}
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 theme-hover-bg rounded-lg theme-text-primary relative"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-4 top-16 theme-card-bg theme-border border rounded-lg shadow-lg z-50 min-w-[160px]">
            <div className="p-2 space-y-1">
              <Button 
                {...executeButtonProps}
                className="w-full justify-start text-sm px-2 py-1"
                onClick={() => {
                  executeButtonProps.onClick();
                  setShowActions(false);
                }}
              />
              <Button 
                variant="primary" 
                icon={Save} 
                disabled={!currentWorkflow}
                onClick={() => {
                  onSave();
                  setShowActions(false);
                }}
                className="w-full justify-start text-sm px-2 py-1"
              >
                Save
              </Button>
              <Button 
                variant="danger" 
                icon={Trash2}
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                disabled={!currentWorkflow}
                className="w-full justify-start text-sm px-2 py-1"
              >
                Delete 11
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Workflow Tabs */}
      <div className="px-4 pb-3 pt-2">
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={onCreateNew}
            className="flex-shrink-0 p-2 theme-hover-bg rounded-lg theme-text-secondary border theme-border"
          >
            <Plus size={18} />
          </button>
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              onClick={() => onSelectWorkflow(workflow.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeWorkflow === workflow.id
                  ? 'theme-card-bg theme-text-primary theme-border border shadow-sm'
                  : 'theme-text-secondary theme-hover-bg'
              }`}
            >
              {workflow.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}