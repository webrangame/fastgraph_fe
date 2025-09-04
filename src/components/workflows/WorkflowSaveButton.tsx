'use client';

import { useState } from 'react';
import { useInstallDataMutation } from '../../../redux/api/autoOrchestrate/autoOrchestrateApi';
import toast from 'react-hot-toast';

interface WorkflowSaveButtonProps {
  workflow: any;
  onSaveSuccess?: () => void;
}

export default function WorkflowSaveButton({ workflow, onSaveSuccess }: WorkflowSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [installData] = useInstallDataMutation();

  const handleSave = async () => {
    if (!workflow) {
      toast.error('No workflow to save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await installData({
        dataName: `Workflow: ${workflow.name || workflow.id}`,
        description: `Workflow data for ${workflow.name || workflow.id}`,
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

      toast.success('Workflow saved successfully!');
      console.log('Workflow saved:', response);
      onSaveSuccess?.();
    } catch (error: any) {
      console.error('Failed to save workflow:', error);
      toast.error(`Failed to save workflow: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || !workflow}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isSaving ? 'Saving...' : 'Save Workflow'}
    </button>
  );
}
