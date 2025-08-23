import { DesktopHeader } from './DesktopHeader';
import { MobileWorkflowHeader } from '../mobile/MobileWorkflowHeader';

interface WorkflowHeaderProps {
  isMobile: boolean;
  currentWorkflow: any;
  workflows: any[];
  activeWorkflow: any;
  workflowStatus: string;
  workflowError: string | null;
  isAutoOrchestrating: boolean;
  agentCount: number;
  isRunning: boolean;
  mobileMenuOpen?: boolean;
  onSelectWorkflow: (workflow: any) => void;
  onCloseWorkflow: (workflowId: string) => void;
  onCreateNew: () => void;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onDelete: () => void;
  onMenuToggle?: () => void;
}

export function WorkflowHeader({
  isMobile,
  mobileMenuOpen,
  onMenuToggle,
  ...props
}: WorkflowHeaderProps) {
  if (isMobile) {
    return (
      <MobileWorkflowHeader
        workflows={props.workflows}
        activeWorkflow={props.activeWorkflow}
        currentWorkflow={props.currentWorkflow}
        isRunning={props.isRunning}
        onMenuToggle={onMenuToggle!}
        onCreateNew={props.onCreateNew}
        onSelectWorkflow={props.onSelectWorkflow}
        onExecute={props.onExecute}
        onStop={props.onStop}
        onSave={props.onSave}
        onDelete={() => props.onDelete()}
        menuOpen={mobileMenuOpen!}
      />
    );
  }

  return (
    <DesktopHeader
      currentWorkflow={props.currentWorkflow}
      workflows={props.workflows}
      activeWorkflow={props.activeWorkflow}
      workflowStatus={props.workflowStatus}
      workflowError={props.workflowError}
      isAutoOrchestrating={props.isAutoOrchestrating}
      agentCount={props.agentCount}
      isRunning={props.isRunning}
      onSelectWorkflow={props.onSelectWorkflow}
      onCloseWorkflow={props.onCloseWorkflow}
      onCreateNew={props.onCreateNew}
      onExecute={props.onExecute}
      onStop={props.onStop}
      onSave={props.onSave}
      onDelete={props.onDelete}
    />
  );
}