'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Plus } from 'lucide-react';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => void;
}

export interface WorkflowFormData {
  name: string;
  description: string;
  type: 'dynamic' | 'manual';
}

export function CreateWorkflowModal({ isOpen, onClose, onSubmit }: CreateWorkflowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<WorkflowFormData>({
    defaultValues: {
      name: generateDefaultName(),
      description: '',
      type: 'dynamic'
    }
  });
  
  const formData = watch();

  // Generate a default workflow name
  function generateDefaultName(): string {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    return `Workflow ${timestamp}`;
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: generateDefaultName(),
        description: '',
        type: 'dynamic'
      });
    }
  }, [isOpen, reset]);

  const onSubmitHandler = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(data);
    handleClose();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    reset({
      name: generateDefaultName(),
      description: '',
      type: 'dynamic'
    });
    setFocusedField(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Workflow"
      maxWidth="max-w-lg"
      headerColor="blue"
      headerIcon="Workflow"
    >
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        {/* Workflow Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Workflow Name *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('name', {
                required: 'Workflow name is required',
                maxLength: {
                  value: 200,
                  message: 'Workflow name must be 200 characters or less'
                }
              })}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'name'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter workflow name"
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
              <span>{errors.name.message}</span>
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.name.length}/200 characters</span>
            {formData.name.length > 180 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Workflow Description */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Command *
          </label>
          <div className="relative">
            <textarea
              {...register('description', {
                required: 'Command is required'
              })}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={3}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'description'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              placeholder="Enter command..."
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
              <span>{errors.description.message}</span>
            </div>
          )}
        </div>

        {/* Workflow Type */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Workflow Type
          </label>
          <div className="relative">
            <select
              {...register('type', {
                required: 'Workflow type is required'
              })}
              onFocus={() => setFocusedField('type')}
              onBlur={() => setFocusedField(null)}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                errors.type
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : focusedField === 'type'
                    ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                    : 'focus:ring-blue-500'
              }`}
              disabled={isSubmitting}
            >
              <option value="dynamic">Dynamic - Automatically triggered</option>
              <option value="manual">Manual - Manually triggered</option>
            </select>
            
            {/* Custom Dropdown Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <Icon
                name="ChevronDown"
                className={`w-4 h-4 theme-text-muted transition-transform duration-200 ${
                  focusedField === 'type' ? 'rotate-180' : ''
                }`}
              />
            </div>
            
            {focusedField === 'type' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.type && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              <span>{errors.type.message}</span>
            </div>
          )}
          <div className={`mt-1 text-xs flex items-center transition-all duration-200 ${
            formData.type === 'dynamic' ? 'text-blue-600' : 'text-purple-600'
          }`}>
            <Icon
              name={formData.type === 'dynamic' ? 'Zap' : 'Hand'}
              className="w-3 h-3 mr-1"
            />
            {formData.type === 'dynamic'
              ? 'Workflow runs automatically based on triggers'
              : 'Workflow requires manual execution'
            }
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
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
              'Create Workflow'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}