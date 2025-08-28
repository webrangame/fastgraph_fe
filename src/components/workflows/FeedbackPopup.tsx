'use client';

import { useState } from 'react';
import { X, MessageCircle, Save, Zap } from 'lucide-react';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  onSave: (feedback: string) => void;
  onEvolve: (feedback: string) => void;
}

export function FeedbackPopup({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  onSave, 
  onEvolve 
}: FeedbackPopupProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(feedback);
      setFeedback('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvolve = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await onEvolve(feedback);
      setFeedback('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="theme-card-bg rounded-xl shadow-2xl border theme-border max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text-primary">Agent Performance Feedback</h2>
              <p className="theme-text-secondary text-sm">{agentName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 theme-text-muted hover:theme-text-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                How did this agent perform? Share your feedback to help improve its capabilities.
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback on the agent's performance, accuracy, response quality, or any suggestions"
                className="w-full h-32 p-4 theme-input-bg theme-text-primary border theme-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="theme-text-muted text-xs">
                  Your feedback helps train and improve agent performance
                </p>
                <span className="theme-text-muted text-xs">
                  {feedback.length}/1000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t theme-border bg-gray-50 dark:bg-gray-800/30">
          <button
            onClick={handleClose}
            className="px-4 py-2 theme-text-secondary hover:theme-text-primary border theme-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!feedback.trim() || isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Feedback'}</span>
          </button>

          <button
            onClick={handleEvolve}
            disabled={!feedback.trim() || isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>{isSubmitting ? 'Evolving...' : 'Evolve Agent'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}