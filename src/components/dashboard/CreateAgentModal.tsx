'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuditLog } from '@/hooks/useAuditLog';
import { UserPlus, X } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentFormData) => void;
}

export interface AgentFormData {
  role: string;
  task: string;
  capabilities: string;
  tags: string[];
}

export function CreateAgentModal({ isOpen, onClose, onSubmit }: CreateAgentModalProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    role: '',
    task: '',
    capabilities: '',
    tags: []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const { logAgentAction } = useAuditLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.role.trim()) {
      newErrors.role = 'Agent role is required';
    } else if (formData.role.length > 200) {
      newErrors.role = 'Agent role must be 200 characters or less';
    }

    if (!formData.task.trim()) {
      newErrors.task = 'Task description is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log audit trail
      await logAgentAction('create', formData);
      
      onSubmit(formData);
      handleClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    setFormData({
      role: '',
      task: '',
      capabilities: '',
      tags: []
    });
    setErrors({});
    setFocusedField(null);
    setIsSubmitting(false);
    setTagInput('');
    onClose();
  };

  const handleInputChange = (field: keyof Omit<AgentFormData, 'tags'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      // Remove last tag if backspace on empty input
      removeTag(formData.tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagInputChange = (value: string) => {
    // Remove commas and handle them as tag separators
    if (value.includes(',')) {
      const parts = value.split(',');
      const newTag = parts[0].trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput(parts.slice(1).join(',').trim());
    } else {
      setTagInput(value);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Add New Agent"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agent Role */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Role *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.role 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'role' 
                    ? 'focus:ring-purple-500 focus:border-purple-500 transform scale-[1.02]' 
                    : 'focus:ring-purple-500'
              }`}
              placeholder="e.g., Customer Support Specialist, Data Analyst, Content Creator"
              disabled={isSubmitting}
            />
            {focusedField === 'role' && !errors.role && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.role && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.role}
            </div>
          )}
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{formData.role.length}/200 characters</span>
            {formData.role.length > 180 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>

        {/* Task */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Task *
          </label>
          <div className="relative">
            <textarea
              value={formData.task}
              onChange={(e) => handleInputChange('task', e.target.value)}
              onFocus={() => setFocusedField('task')}
              onBlur={() => setFocusedField(null)}
              rows={4}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                errors.task 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : focusedField === 'task' 
                    ? 'focus:ring-purple-500 focus:border-purple-500 transform scale-[1.02]' 
                    : 'focus:ring-purple-500'
              }`}
              placeholder="Describe what this agent will do, its responsibilities, and main objectives..."
              disabled={isSubmitting}
            />
            {focusedField === 'task' && !errors.task && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          {errors.task && (
            <div className="mt-1 text-sm text-red-500 flex items-center animate-in slide-in-from-left-2 duration-200">
              <Icon name="AlertCircle" className="w-4 h-4 mr-1" />
              {errors.task}
            </div>
          )}
        </div>

        {/* Agent Capabilities */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Capabilities (Optional)
          </label>
          <div className="relative">
            <textarea
              value={formData.capabilities}
              onChange={(e) => handleInputChange('capabilities', e.target.value)}
              onFocus={() => setFocusedField('capabilities')}
              onBlur={() => setFocusedField(null)}
              rows={3}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none ${
                focusedField === 'capabilities' ? 'transform scale-[1.02]' : ''
              }`}
              placeholder="List specific skills, tools, or abilities this agent has (e.g., multilingual support, data analysis, API integrations)..."
              disabled={isSubmitting}
            />
            {focusedField === 'capabilities' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Tags */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Tags (Optional)
          </label>
          <div className="relative">
            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagInputChange(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => setFocusedField('tags')}
              onBlur={() => setFocusedField(null)}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                focusedField === 'tags' ? 'transform scale-[1.02]' : ''
              }`}
              placeholder="Type tags and press Enter or comma to add (e.g., customer-service, automation, multilingual)"
              disabled={isSubmitting}
            />
            {focusedField === 'tags' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs theme-text-muted flex items-center">
            <Icon name="Tag" className="w-3 h-3 mr-1" />
            Press Enter or comma to add tags. Click × to remove.
          </p>
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
            icon={UserPlus}
            disabled={isSubmitting}
            className={`transition-all duration-200 hover:scale-105 bg-purple-600 hover:bg-purple-700 ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Agent...
              </>
            ) : (
              'Add Agent'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}