import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { WorkflowTabs } from '../WorkflowTabs';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';

interface DesktopHeaderProps {
  currentWorkflow: any;
  workflows: any[];
  activeWorkflow: any;
  workflowStatus: string;
  workflowError: string | null;
  isAutoOrchestrating: boolean;
  agentCount: number;
  isRunning: boolean;
  onSelectWorkflow: (workflow: any) => void;
  onCloseWorkflow: (workflowId: string) => void;
  onCreateNew: () => void;
  onCreateWithModal?: (data: WorkflowFormData) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function DesktopHeader({
  currentWorkflow,
  workflows,
  activeWorkflow,
  workflowStatus,
  workflowError,
  isAutoOrchestrating,
  agentCount,
  isRunning,
  onSelectWorkflow,
  onCloseWorkflow,
  onCreateNew,
  onCreateWithModal,
  onUndo,
  canUndo,
  onExecute,
  onStop,
  onSave,
  onDelete
}: DesktopHeaderProps) {
  return (
    <header className="theme-header-bg theme-border border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold theme-text-primary">
            Workflow Builder
          </h1>
          {currentWorkflow && (
            <div className="flex items-center space-x-2">
              <StatusIndicator status={currentWorkflow.status} />
              <span className="text-sm theme-text-muted capitalize">
                {currentWorkflow.status}
              </span>
            </div>
          )}
          {workflowStatus === 'loading' && (
            <span className="text-sm theme-text-muted">Loading workflows...</span>
          )}
          {workflowError && (
            <span className="text-sm text-red-500">Error: {workflowError}</span>
          )}
          {isAutoOrchestrating && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-600">Auto-orchestrating...</span>
            </div>
          )}
          {agentCount > 0 && (
            <span className="text-sm text-green-600">
              ✓ {agentCount} agents loaded
            </span>
          )}
        </div>
        
        <WorkflowActions
          currentWorkflow={currentWorkflow}
          agentCount={agentCount}
          isRunning={isRunning}
          onExecute={onExecute}
          onStop={onStop}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
      
      <WorkflowTabs
        workflows={workflows}
        activeWorkflow={activeWorkflow}
        onSelectWorkflow={onSelectWorkflow}
        onCloseWorkflow={onCloseWorkflow}
        onCreateNew={onCreateNew}
        onCreateWithModal={onCreateWithModal}
        onUndo={onUndo}
        canUndo={canUndo}
        maxWorkflows={5}
      />
    </header>
  );
}