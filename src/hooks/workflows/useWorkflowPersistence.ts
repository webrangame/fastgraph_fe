import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWorkflow, removeWorkflow } from '@/redux/slice/workflowSlice';
import { useInstallDataMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
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

  const [installDataMutation] = useInstallDataMutation();
  

  const saveWorkflow = async (workflow: any) => {
    if (!workflow) {
      toast.error('No workflow data to save.');
      return;
    }

    setIsSaving(true);
    try {
      // Save workflow data using the new installData API
      const response = await installDataMutation({
        dataName: `Workflow: ${workflow.name || workflow.workflowName || 'Untitled'}`,
        description: `Workflow data for ${workflow.name || workflow.workflowName || 'Untitled'}`,
        dataType: 'json',
        dataContent: {
          workflow: workflow,
          metadata: {
            savedAt: new Date().toISOString(),
            version: '1.0',
            type: 'workflow'
          }
        },
        overwrite: false
      }).unwrap();
      
      // Update Redux store with the workflow data
      dispatch(updateWorkflow(workflow));
      
      toast.success('Workflow saved successfully using data install API!');
      console.log('Workflow saved via installData API:', response);
      
    } catch (error) {
      console.error('Error saving workflow via installData API:', error);
      toast.error('Failed to save workflow via data install API. Please try again.');
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
      
      toast.success('Auto orchestrate workflow saved successfully using data install API!');
      console.log('Auto orchestrate workflow saved via installData API:', response);
      
    } catch (error) {
      console.error('Error saving auto orchestrate workflow via installData API:', error);
      toast.error('Failed to save auto orchestrate workflow via data install API. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWorkflowById = (workflowId: string) => {
    // Remove from Redux store
    dispatch(removeWorkflow(workflowId));
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