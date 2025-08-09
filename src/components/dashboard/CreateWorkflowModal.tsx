'use client';

import { useState } from 'react';
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
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: generateDefaultName(),
    description: '',
    type: 'dynamic'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Workflow name must be 200 characters or less';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(formData);
      handleClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    setFormData({
      name: generateDefaultName(),
      description: '',
      type: 'dynamic'
    });
    setErrors({});
    setFocusedField(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof WorkflowFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Workflow Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
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
              {errors.name}
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
            Description (Optional)
          </label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={3}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${
                focusedField === 'description' ? 'transform scale-[1.02]' : ''
              }`}
              placeholder="Describe what this workflow will do..."
              disabled={isSubmitting}
            />
            {focusedField === 'description' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Type */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Workflow Type
          </label>
          <div className="relative">
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as 'dynamic' | 'manual')}
              onFocus={() => setFocusedField('type')}
              onBlur={() => setFocusedField(null)}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none ${
                focusedField === 'type' ? 'transform scale-[1.02]' : ''
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