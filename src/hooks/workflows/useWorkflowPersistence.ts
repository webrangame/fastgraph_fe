import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkflows, updateWorkflow, removeWorkflow } from '@/redux/slice/workflowSlice';
import { useSaveWorkflowMutation, useInstallDataMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import { transformAutoOrchestrateToWorkflow, AutoOrchestrateResponse } from '@/lib/workflow-utils';
import { Store } from '@/redux/store';
import { toast } from 'react-hot-toast';

interface UseWorkflowPersistenceReturn {
  workflows: any[];
  workflowStatus: string;
  workflowError: string | null;
  saveWorkflow: (workflow: any) => void;
  saveAutoOrchestrateWorkflow: (autoOrchestrateResponse: AutoOrchestrateResponse, userId?: string) => Promise<void>;
  deleteWorkflowById: (workflowId: string) => void;
  isSaving: boolean;
  clearWorkflowData: () => void;
}

export function useWorkflowPersistence(): UseWorkflowPersistenceReturn {
  const dispatch = useDispatch();
  const workflows = useSelector((state: ReturnType<typeof Store.getState>) => state.workflows.workflows);
  const workflowStatus = useSelector((state: ReturnType<typeof Store.getState>) => state.workflows.status);
  const workflowError = useSelector((state: ReturnType<typeof Store.getState>) => state.workflows.error);
  const [isSaving, setIsSaving] = useState(false);

  const [saveWorkflowMutation] = useSaveWorkflowMutation();
  const [installDataMutation] = useInstallDataMutation();

  // Clear workflow data function
  const clearWorkflowData = () => {
    console.log('Clearing workflow data...');
    
    // Clear workflows from Redux store
    dispatch(setWorkflows([]));
    
    // Clear workflows from localStorage
    localStorage.removeItem('workflows');
    
    console.log('Workflows cleared from Redux store and localStorage');
    toast.success('Workflow data cleared successfully!');
  };

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

      console.log(workflow , 9999999)
      // Save workflow data using the dedicated workflow API
      const response = await saveWorkflowMutation({
        workflow: workflow,
        agents: workflow.agents || [] // Include agents if available
      }).unwrap();
      
      // Update Redux store with the workflow data
      dispatch(updateWorkflow(workflow));
      
      // Update localStorage with the latest data
      const updatedWorkflows = workflows.map((w: any) =>
        w.workflowName === workflow.workflowName ? workflow : w
      );
      if (!workflows.find((w: any) => w.workflowName === workflow.workflowName)) {
        updatedWorkflows.push(workflow);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      
      toast.success('Workflow saved successfully!');
      console.log('Workflow saved via workflow API:', response);
      
      // Clear workflow data after successful save
      clearWorkflowData();
      
    } catch (error) {
      console.error('Error saving workflow via workflow API:', error);
      toast.error('Failed to save workflow. Please try again.');
      
      // Fallback: save to local storage only
      try {
        const updatedWorkflows = workflows.map((w: any) =>
          w.workflowName === workflow.workflowName ? workflow : w
        );
        if (!workflows.find((w: any) => w.workflowName === workflow.workflowName)) {
          updatedWorkflows.push(workflow);
        }
        localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
        
        // Update Redux store with local data
        dispatch(updateWorkflow(workflow));
        
        toast('Workflow saved locally (workflow API failed)', { icon: 'ℹ️' });
        console.log('Workflow saved locally as fallback:', workflow);
      } catch (localError) {
        console.error('Error saving workflow locally:', localError);
        toast.error('Failed to save workflow both via API and locally.');
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
      
      console.log('Attempting to save to database using installData API...');
      
      // Save to database via installData API
      const response = await installDataMutation({
        dataName: `Auto Orchestrate Workflow: ${workflowData.workflow.workflowName}`,
        description: `Auto orchestrate workflow data for ${workflowData.workflow.workflowName}`,
        dataType: 'json',
        dataContent: {
          workflow: workflowData.workflow,
          agents: workflowData.agents,
          autoOrchestrateResponse: autoOrchestrateResponse,
          metadata: {
            savedAt: new Date().toISOString(),
            version: '1.0',
            type: 'auto_orchestrate_workflow',
            userId: userId
          }
        },
        overwrite: false
      }).unwrap();
      
      console.log('InstallData API response:', response);
      
      // Update Redux store with the workflow data
      dispatch(updateWorkflow(workflowData.workflow));
      
      // Update localStorage with the latest data
      const updatedWorkflows = workflows.map((w: any) =>
        w.workflowName === workflowData.workflow.workflowName ? workflowData.workflow : w
      );
      if (!workflows.find((w: any) => w.workflowName === workflowData.workflow.workflowName)) {
        updatedWorkflows.push(workflowData.workflow);
      }
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      
      toast.success('Auto orchestrate workflow saved successfully using data install API!');
      console.log('Auto orchestrate workflow saved via installData API:', response);
      
      // Clear workflow data after successful save
      clearWorkflowData();
      
    } catch (error) {
      console.error('Error saving auto orchestrate workflow via installData API:', error);
      toast.error('Failed to save auto orchestrate workflow via data install API. Please try again.');
      
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
    
    // Also remove from localStorage - use id field for consistency
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
    isSaving,
    clearWorkflowData
  };
}