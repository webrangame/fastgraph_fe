import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkflows, updateWorkflow, removeWorkflow } from '@/redux/slice/workflowSlice';
import { RootState } from '@/types/redux';

interface UseWorkflowPersistenceReturn {
  workflows: any[];
  workflowStatus: string;
  workflowError: string | null;
  saveWorkflow: (workflow: any) => void;
  deleteWorkflowById: (workflowId: string) => void;
}

export function useWorkflowPersistence(): UseWorkflowPersistenceReturn {
  const dispatch = useDispatch();
  const workflows = useSelector((state: RootState) => state.workflows.workflows);
  const workflowStatus = useSelector((state: RootState) => state.workflows.status);
  const workflowError = useSelector((state: RootState) => state.workflows.error);

  // Load workflows from localStorage on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        if (workflows.length > 0) {
          console.log('Loading workflows from Redux store:', workflows);
        } else {
          const storedWorkflows = localStorage.getItem('workflows');
          if (storedWorkflows) {
            const parsedWorkflows = JSON.parse(storedWorkflows);
            dispatch(setWorkflows(parsedWorkflows));
          }
        }
      } catch (error) {
        console.error('Error loading workflows:', error);
      }
    };

    loadWorkflows();
  }, [dispatch, workflows.length]);

  const saveWorkflow = (workflow: any) => {
    console.log('Saving workflow...', workflow);
    if (workflow) {
      // Save to Redux store
      dispatch(updateWorkflow(workflow));
      
      // Also save to localStorage for persistence
      const updatedWorkflows = workflows.map((w: any) =>
        w.id === workflow.id ? workflow : w
      );
      if (!workflows.find((w: any) => w.id === workflow.id)) {
        updatedWorkflows.push(workflow);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
    }
  };

  const deleteWorkflowById = (workflowId: string) => {
    // Remove from Redux store
    dispatch(removeWorkflow(workflowId));
    
    // Also remove from localStorage
    const updatedWorkflows = workflows.filter((w: any) => w.id !== workflowId);
    localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
  };

  return {
    workflows,
    workflowStatus,
    workflowError,
    saveWorkflow,
    deleteWorkflowById
  };
}