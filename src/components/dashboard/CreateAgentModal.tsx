'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useCreateAgentMutation } from '@/redux/api/agent/agentApi';
import toast from 'react-hot-toast';
import { X, Bot } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentFormData) => void;
  currentWorkflowId?: string;
}

export interface AgentFormData {
  workflow_id: string;
  name: string;
  role: string;
  execute_now: boolean;
}

export function CreateAgentModal({ isOpen, onClose, onSubmit, currentWorkflowId }: CreateAgentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [createAgent, { isLoading }] = useCreateAgentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<AgentFormData>({
    defaultValues: {
      workflow_id: currentWorkflowId || '',
      name: '',
      role: '',
      execute_now: false
    }
  });

  const formData = watch();

  const onSubmitHandler = async (data: AgentFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('🤖 Creating agent with data:', data);
      
      // Use RTK Query mutation
      const result = await createAgent(data).unwrap();

      console.log('✅ Agent created successfully:', result);
      toast.success('Agent created successfully!');
      onSubmit(data);
      handleClose();
      
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error?.data?.error || error?.message || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    reset();
    setFocusedField(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Create New Agent"
      maxWidth="max-w-lg"
      headerColor="blue"
      headerIcon="Bot"
    >
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        {/* Workflow ID */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Workflow ID *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('workflow_id', { 
                required: 'Workflow ID is required',
                minLength: { value: 1, message: 'Workflow ID cannot be empty' }
              })}
              onFocus={() => setFocusedField('workflow_id')}
              onBlur={() => setFocusedField(null)}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.workflow_id 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'workflow_id' 
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]' 
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter workflow ID..."
              disabled={isSubmitting}
            />
            {focusedField === 'workflow_id' && !errors.workflow_id && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.workflow_id && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.workflow_id.message}
            </div>
          )}
        </div>

        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Name *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('name', { 
                required: 'Agent name is required',
                minLength: { value: 2, message: 'Agent name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Agent name must be 100 characters or less' }
              })}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              maxLength={100}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'name' 
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]' 
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter agent name..."
              disabled={isSubmitting}
            />
            {focusedField === 'name' && !errors.name && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.name && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.name.message}
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.name?.length || 0}/100 characters</span>
            {formData.name && formData.name.length > 80 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Agent Role */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Role *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('role', { 
                required: 'Agent role is required',
                minLength: { value: 2, message: 'Agent role must be at least 2 characters' },
                maxLength: { value: 200, message: 'Agent role must be 200 characters or less' }
              })}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.role 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'role' 
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]' 
                    : 'focus:ring-blue-500'
              }`}
              placeholder="e.g., Customer Support Specialist, Data Analyst, Content Creator"
              disabled={isSubmitting}
            />
            {focusedField === 'role' && !errors.role && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.role && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.role.message}
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.role?.length || 0}/200 characters</span>
            {formData.role && formData.role.length > 180 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Execute Now Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('execute_now')}
            id="execute_now"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            disabled={isSubmitting}
          />
          <label htmlFor="execute_now" className="text-sm font-medium theme-text-primary">
            Execute agent immediately after creation
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t theme-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isLoading}
            className="px-6"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}