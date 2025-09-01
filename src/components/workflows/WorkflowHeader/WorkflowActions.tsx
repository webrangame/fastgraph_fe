import { Button } from '@/components/ui/Button';
import { Play, Square, Save, Trash2 } from 'lucide-react';

interface WorkflowActionsProps {
  currentWorkflow: any;
  isRunning: boolean;
  agentCount:number
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
  onDelete,
  agentCount,
}: WorkflowActionsProps) {
  const getExecuteButtonProps = () => ({
    onClick: isRunning ? onStop : onExecute,
    disabled: !currentWorkflow || (!isRunning && currentWorkflow.nodes.length === 0),
    variant: isRunning ? 'danger' as const : 'success' as const,
    icon: isRunning ? Square : Play,
    children: isRunning ? 'Stop' : 'Execute'
  });

  {console.log(currentWorkflow , "currentWorkflow123")}

  return (
    <div className="flex items-center space-x-2">
      <Button {...getExecuteButtonProps()} />
      <Button 
        variant="primary" 
        icon={Save} 
        disabled={!agentCount}
        onClick={onSave}
      >
        Save 
      </Button>
      <Button 
        variant="danger" 
        icon={Trash2}
        onClick={onDelete}
        disabled={!agentCount}
      >
        Delete
      </Button>
    </div>
  );
}