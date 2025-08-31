import { Button } from '@/components/ui/Button';
import { Play, Square, Save, Trash2 } from 'lucide-react';

interface WorkflowActionsProps {
  currentWorkflow: any;
  isRunning: boolean;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function WorkflowActions({
  currentWorkflow,
  isRunning,
  onExecute,
  onStop,
  onSave,
  onDelete
}: WorkflowActionsProps) {
  const getExecuteButtonProps = () => ({
    onClick: isRunning ? onStop : onExecute,
    disabled: !currentWorkflow || (!isRunning && currentWorkflow.nodes.length === 0),
    variant: isRunning ? 'danger' as const : 'success' as const,
    icon: isRunning ? Square : Play,
    children: isRunning ? 'Stop' : 'Execute'
  });

  return (
    <div className="flex items-center space-x-2">
      <Button {...getExecuteButtonProps()} />
      <Button 
        variant="primary" 
        icon={Save} 
        disabled={!currentWorkflow}
        onClick={onSave}
      >
        Save 11
      </Button>
      <Button 
        variant="danger" 
        icon={Trash2}
        onClick={onDelete}
        disabled={!currentWorkflow}
      >
        Delete
      </Button>
    </div>
  );
}