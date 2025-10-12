'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bot, Plus, User, Zap, Play } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useCreateAgentMutation } from '@/redux/api/autoOrchestrate/autoOrchestrateApi';
import toast from 'react-hot-toast';

interface NewAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AgentFormData) => void;
}

export interface AgentFormData {
  agentName: string;
  agentType: string;
  description: string;
}

export function NewAgentPopup({ isOpen, onClose, onSubmit }: NewAgentPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [createAgent] = useCreateAgentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<AgentFormData>({
    defaultValues: {
      agentName: '',
      agentType: 'assistant',
      description: ''
    }
  });

  const formData = watch();

  const onSubmitHandler = async (data: AgentFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('🤖 Creating agent with data:', data);
      
      // Use RTK Query mutation
      const result = await createAgent({
        workflow_id: 'default-workflow', // You can make this dynamic
        name: data.agentName,
        role: data.description,
        execute_now: false
      }).unwrap();

      console.log('✅ Agent created successfully:', result);

      toast.success('Agent created successfully!');
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerAgent = async () => {
    setIsSubmitting(true);
    
    try {
      const data = formData;
      console.log('🤖 Triggering agent with data:', data);
      
      // Use RTK Query mutation with execute_now: true
      const result = await createAgent({
        workflow_id: 'default-workflow', // You can make this dynamic
        name: data.agentName,
        role: data.description,
        execute_now: true
      }).unwrap();

      console.log('✅ Agent triggered successfully:', result);

      toast.success('Agent triggered successfully!');
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Error triggering agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to trigger agent');
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

  const agentTypes = [
    {
      id: 'assistant',
      name: 'Assistant',
      icon: User,
      description: 'General purpose assistant agent'
    },
    {
      id: 'specialist',
      name: 'Specialist',
      icon: Zap,
      description: 'Specialized agent for specific tasks'
    },
    {
      id: 'automation',
      name: 'Automation',
      icon: Bot,
      description: 'Automated workflow agent'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Agent"
      maxWidth="max-w-2xl"
      headerColor="blue"
      headerIcon="Bot"
    >
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Name *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('agentName', { 
                required: 'Agent name is required',
                minLength: { value: 2, message: 'Agent name must be at least 2 characters' },
                maxLength: { value: 200, message: 'Agent name must be 200 characters or less' }
              })}
              onFocus={() => setFocusedField('agentName')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.agentName 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'agentName'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter agent name..."
              disabled={isSubmitting}
            />
            {focusedField === 'agentName' && !errors.agentName && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.agentName && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.agentName.message}
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.agentName?.length || 0}/200 characters</span>
            {formData.agentName && formData.agentName.length > 180 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Agent Type */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {agentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${
                    formData.agentType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'theme-border theme-card-bg hover:border-blue-300'
                  }`}
                  onClick={() => setValue('agentType', type.id)}
                >
                  <input
                    type="radio"
                    {...register('agentType', { required: 'Agent type is required' })}
                    value={type.id}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <IconComponent className="w-8 h-8 mb-2 theme-text-primary" />
                    <h3 className="text-sm font-medium theme-text-primary">{type.name}</h3>
                    <p className="text-xs theme-text-muted mt-1">{type.description}</p>
                  </div>
                  {formData.agentType === type.id && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors.agentType && (
            <div className="mt-2 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.agentType.message}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Description *
          </label>
          <div className="relative">
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 500, message: 'Description must be 500 characters or less' }
              })}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={3}
              maxLength={500}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'description'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Describe what this agent will do..."
              disabled={isSubmitting}
            />
            {focusedField === 'description' && !errors.description && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.description && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.description.message}
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.description?.length || 0}/500 characters</span>
            {formData.description && formData.description.length > 400 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t theme-border mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="transition-all duration-200 hover:scale-105"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Plus}
            disabled={isSubmitting}
            className={`transition-all duration-200 hover:scale-105 ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Agent'
            )}
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={Play}
            onClick={handleTriggerAgent}
            disabled={isSubmitting}
            className={`transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700 ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Triggering...
              </>
            ) : (
              'Trigger Agent'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
