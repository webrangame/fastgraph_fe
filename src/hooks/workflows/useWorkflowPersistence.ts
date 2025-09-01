import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkflows, updateWorkflow, removeWorkflow } from '@/redux/slice/workflowSlice';
import { useSaveWorkflowMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import { transformAutoOrchestrateToWorkflow, AutoOrchestrateResponse } from '@/lib/workflow-utils';
import { RootState } from '@/types/redux';
import { toast } from 'react-hot-toast';

interface UseWorkflowPersistenceReturn {
  workflows: any[];
  workflowStatus: string;
  workflowError: string | null;
  saveWorkflow: (workflow: any) => void;
  saveAutoOrchestrateWorkflow: (autoOrchestrateResponse: AutoOrchestrateResponse, userId?: string) => Promise<void>;
  deleteWorkflowById: (workflowId: string) => void;
  isSaving: boolean;
}

export function useWorkflowPersistence(): UseWorkflowPersistenceReturn {
  const dispatch = useDispatch();
  const workflows = useSelector((state: RootState) => state.workflows.workflows);
  const workflowStatus = useSelector((state: RootState) => state.workflows.status);
  const workflowError = useSelector((state: RootState) => state.workflows.error);
  const [isSaving, setIsSaving] = useState(false);

  const [saveWorkflowMutation] = useSaveWorkflowMutation();

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

  const saveWorkflow = async (workflow: any) => {
    if (!workflow) {
      toast.error('No workflow data to save.');
      return;
    }

    setIsSaving(true);
    try {

      alert("okk365")
    
      // Save to database via API
      const response = await saveWorkflowMutation(workflow).unwrap();
      
      // Update Redux store with the response from database
      dispatch(updateWorkflow(response));
      
      // Update localStorage with the latest data
      const updatedWorkflows = workflows.map((w: any) =>
        w.id === response.id ? response : w
      );
      if (!workflows.find((w: any) => w.id === response.id)) {
        updatedWorkflows.push(response);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      
      toast.success('Workflow saved successfully to database!');
      console.log('Workflow saved to database:', response);
      
    } catch (error) {
      console.error('Error saving workflow to database:', error);
      toast.error('Failed to save workflow to database. Please try again.');
      
      // Fallback: save to local storage only
      try {
        const updatedWorkflows = workflows.map((w: any) =>
          w.id === workflow.id ? workflow : w
        );
        if (!workflows.find((w: any) => w.id === workflow.id)) {
          updatedWorkflows.push(workflow);
        }
        localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
        
        // Update Redux store with local data
        dispatch(updateWorkflow(workflow));
        
        toast('Workflow saved locally (database save failed)', { icon: 'ℹ️' });
        console.log('Workflow saved locally as fallback:', workflow);
      } catch (localError) {
        console.error('Error saving workflow locally:', localError);
        toast.error('Failed to save workflow both to database and locally.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveAutoOrchestrateWorkflow = async (autoOrchestrateResponse: AutoOrchestrateResponse, userId?: string) => {
    console.log('saveAutoOrchestrateWorkflow called with:', { autoOrchestrateResponse, userId });
    
    if (!autoOrchestrateResponse) {
      toast.error('No auto orchestrate response to save.');
      return;
    }

    if (!userId) {
      toast.error('User ID is required to save workflow.');
      return;
    }

    // Validate autoOrchestrateResponse structure
    if (!autoOrchestrateResponse.swarm_result || !autoOrchestrateResponse.final_data) {
      toast.error('Invalid auto orchestrate response structure.');
      console.error('Invalid autoOrchestrateResponse:', autoOrchestrateResponse);
      return;
    }

    setIsSaving(true);
    try {
      console.log('Transforming auto orchestrate response...');
      
      // Transform the autoOrchestrate response to workflow format
      const workflowData = transformAutoOrchestrateToWorkflow(autoOrchestrateResponse, userId);
      
      console.log('Transformed workflow data:', workflowData);
      
      // Validate transformed data
      if (!workflowData.workflow || !workflowData.agents) {
        toast.error('Failed to transform auto orchestrate response to workflow format.');
        console.error('Invalid transformed data:', workflowData);
        return;
      }

      // Validate workflow structure
      const requiredFields = ['workflowName', 'command', 'workflowType'];
      const missingFields = requiredFields.filter(field => !(workflowData.workflow as any)[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Missing required workflow fields: ${missingFields.join(', ')}`);
        console.error('Missing required fields:', missingFields, 'Workflow:', workflowData.workflow);
        return;
      }
      
      console.log('Attempting to save to database...');
      
      // Save to database via API
      const response = await saveWorkflowMutation(workflowData).unwrap();
      
      console.log('Database response:', response);
      
      // Update Redux store with the response from database
      dispatch(updateWorkflow(response));
      
      // Update localStorage with the latest data
      const updatedWorkflows = workflows.map((w: any) =>
        w.id === response.id ? response : w
      );
      if (!workflows.find((w: any) => w.id === response.id)) {
        updatedWorkflows.push(response);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      
      toast.success('Auto orchestrate workflow saved successfully to database!');
      console.log('Auto orchestrate workflow saved to database:', response);
      
    } catch (error) {
      console.error('Error saving auto orchestrate workflow to database:', error);
      toast.error('Failed to save auto orchestrate workflow to database. Please try again.');
      
      // Fallback: save to local storage only
      try {
        console.log('Attempting local storage fallback...');
        
        const workflowData = transformAutoOrchestrateToWorkflow(autoOrchestrateResponse, userId);
        
        // Generate a temporary ID for local storage if none exists
        const tempWorkflow = {
          ...workflowData.workflow,
          id: `temp_${Date.now()}`
        };
        
        console.log('Saving temp workflow to local storage:', tempWorkflow);
        
        // Add the new workflow to the list
        const updatedWorkflows = [...workflows, tempWorkflow];
        localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
        
        // Update Redux store with local data
        dispatch(updateWorkflow(tempWorkflow));
        
        toast('Auto orchestrate workflow saved locally (database save failed)', { icon: 'ℹ️' });
        console.log('Auto orchestrate workflow saved locally as fallback:', tempWorkflow);
      } catch (localError) {
        console.error('Error saving auto orchestrate workflow locally:', localError);
        toast.error('Failed to save auto orchestrate workflow both to database and locally.');
      }
    } finally {
      setIsSaving(false);
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
    saveAutoOrchestrateWorkflow,
    deleteWorkflowById,
    isSaving
  };
}