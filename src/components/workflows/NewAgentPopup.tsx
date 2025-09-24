'use client';

import { useState } from 'react';
import { Bot, Plus, User, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface NewAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAgentPopup({ isOpen, onClose }: NewAgentPopupProps) {
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('assistant');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Handle form submission logic here
    console.log('Creating agent:', { agentName, agentType, description });
    
    handleClose();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form
    setAgentName('');
    setAgentType('assistant');
    setDescription('');
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Agent Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              maxLength={200}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                focusedField === 'name'
                  ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                  : 'focus:ring-blue-500'
              }`}
              placeholder="Enter agent name..."
              disabled={isSubmitting}
              required
            />
            {focusedField === 'name' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <div className="mt-1 text-xs theme-text-muted flex justify-between">
            <span>{agentName.length}/200 characters</span>
            {agentName.length > 180 && (
              <span className="text-amber-500 animate-pulse">
                <Icon name="AlertTriangle" className="w-3 h-3 inline mr-1" />
                Almost at limit
              </span>
            )}
          </div>
        </div>


        {/* Description */}
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Description *
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={3}
              className={`w-full theme-input-bg theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                focusedField === 'description'
                  ? 'focus:ring-blue-500 focus:border-blue-500 transform scale-[1.02]'
                  : 'focus:ring-blue-500'
              }`}
              placeholder="Describe what this agent will do..."
              disabled={isSubmitting}
              required
            />
            {focusedField === 'description' && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
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
        </div>
      </form>
    </Modal>
  );
}
