import { DesktopHeader } from './DesktopHeader';
import { MobileWorkflowHeader } from '../mobile/MobileWorkflowHeader';

import { WorkflowFormData } from '@/components/dashboard/CreateWorkflowModal';

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
  onCreateWithModal?: (data: WorkflowFormData) => void;
  onCreateCustomAgent?: (data: any) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onDelete: () => void;
  onMenuToggle?: () => void;
  userId?: string;
}

export function WorkflowHeader({
  isMobile,
  mobileMenuOpen,
  onMenuToggle,
  userId,
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
        onCreateWithModal={props.onCreateWithModal}
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
      onCreateWithModal={props.onCreateWithModal}
      onCreateCustomAgent={props.onCreateCustomAgent}
      onUndo={props.onUndo}
      canUndo={props.canUndo}
      onExecute={props.onExecute}
      onStop={props.onStop}
      onSave={props.onSave}
      onDelete={props.onDelete}
      userId={userId}
    />
  );
}