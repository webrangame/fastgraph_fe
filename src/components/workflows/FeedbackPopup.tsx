'use client';

import { useState } from 'react';
import { X, MessageCircle, Save, Zap, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  onSave: (feedback: string) => void;
  onEvolve: (feedbacks: string[]) => void;
}

type WizardStep = 'feedback' | 'evolution';

export function FeedbackPopup({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  onSave, 
  onEvolve 
}: FeedbackPopupProps) {
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('feedback');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const wizardSteps: { key: WizardStep; title: string; description: string }[] = [
    { key: 'feedback', title: 'Enter Feedbacks', description: 'Provide feedback to improve the agent' },
    { key: 'evolution', title: 'Evolve Agent', description: 'Start the evolution process' }
  ];

  if (!isOpen) return null;

  const handleAddFeedback = () => {
    if (currentFeedback.trim()) {
      setFeedbacks([...feedbacks, currentFeedback.trim()]);
      setCurrentFeedback('');
    }
  };

  const handleRemoveFeedback = (index: number) => {
    setFeedbacks(feedbacks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (feedbacks.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSave(feedbacks.join('\n'));
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalEvolve = async () => {
    setIsSubmitting(true);
    try {
      await onEvolve(feedbacks);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbacks([]);
    setCurrentFeedback('');
    setCurrentStep('feedback');
    setShowComingSoon(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEvolveClick = () => {
    setShowComingSoon(true);
  };

  const getCurrentStepIndex = () => wizardSteps.findIndex(step => step.key === currentStep);
  const isFirstStep = getCurrentStepIndex() === 0;
  const isLastStep = getCurrentStepIndex() === wizardSteps.length - 1;

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].key);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 'feedback') {
      return feedbacks.length > 0;
    }
    return true;
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].key);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center">
      {wizardSteps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = getCurrentStepIndex() > index;
        const isAccessible = index <= getCurrentStepIndex();

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                  isActive
                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-110'
                    : isCompleted
                    ? 'bg-green-500 text-white border-green-500 shadow-md'
                    : `${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} theme-text-muted shadow-sm`
                } ${isAccessible ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                onClick={() => isAccessible && setCurrentStep(step.key)}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-1.5 text-center max-w-[120px]">
                <div className={`text-xs font-medium ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'theme-text-muted'
                }`}>
                  {step.title.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>

            {/* Connection Line */}
            {index < wizardSteps.length - 1 && (
              <div className="flex-1 px-6 flex items-center">
                <div className={`h-0.5 w-full relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out ${
                      isCompleted 
                        ? 'bg-green-500 w-full' 
                        : isActive && index === 0 
                        ? 'bg-blue-500 w-1/2' 
                        : 'w-0'
                    }`}
                  />
                  {/* Animated dots for active connection */}
                  {isActive && index === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="theme-card-bg rounded-xl shadow-2xl border theme-border max-w-3xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text-primary">
                Agent Evolution Wizard
              </h2>
              <p className="theme-text-secondary text-sm">{agentName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors theme-hover-bg"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 theme-text-muted hover:theme-text-primary" />
          </button>
        </div>

        {/* Step Indicator - Always show */}
        <div className={`py-3 px-6 border-b theme-border flex justify-center ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Coming Soon Message */}
          {showComingSoon && (
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-500">
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100">
                      Workflow Evolution Coming Soon! 
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-0.5">
                      This exciting feature is under development and will be available soon.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="p-1 rounded hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-600 dark:text-purple-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 'feedback' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">Step 1: Enter Feedbacks</h3>
                <p className="theme-text-secondary text-sm mb-4">
                  Provide feedback to help improve the agent's performance
                </p>
              </div>

              {/* Current Feedbacks */}
              {feedbacks.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text-primary">
                    Current Feedbacks ({feedbacks.length})
                  </label>
                  <div className="space-y-2">
                    {feedbacks.map((feedback, index) => (
                      <div key={index} className="flex items-center justify-between p-3 theme-input-bg border theme-border rounded-lg">
                        <span className="theme-text-primary text-sm flex-1">{feedback}</span>
                        <button
                          onClick={() => handleRemoveFeedback(index)}
                          className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Feedback */}
              <div className="space-y-2">
                <label className="block text-sm font-medium theme-text-primary">
                  Add Feedback
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentFeedback}
                    onChange={(e) => setCurrentFeedback(e.target.value)}
                    placeholder="Enter feedback for the agent..."
                    className="flex-1 px-3 py-2 theme-input-bg theme-text-primary border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFeedback();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddFeedback}
                    disabled={!currentFeedback.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'evolution' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">Step 2: Evolve Agent</h3>
                <p className="theme-text-secondary text-sm mb-4">
                  Start the evolution process to improve the agent based on your feedback
                </p>
              </div>

              {/* Feedback Summary */}
              <div className="p-4 theme-input-bg border theme-border rounded-lg">
                <h4 className="font-medium theme-text-primary mb-2">Feedback Summary:</h4>
                <ul className="space-y-1">
                  {feedbacks.map((feedback, index) => (
                    <li key={index} className="text-sm theme-text-secondary flex items-center">
                      <MessageCircle className="w-3 h-3 mr-2 text-blue-500" />
                      {feedback}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Performance Improvements (Optional) */}
              {/* <div className="space-y-2">
                <label className="block text-sm font-medium theme-text-primary">
                  What specific performance improvements do you want to see? (Optional)
                </label>
                <textarea
                  placeholder="Describe specific improvements... (This feature is not implemented yet)"
                  rows={3}
                  disabled={true}
                  className="w-full px-3 py-2 theme-input-bg theme-text-primary border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs theme-text-muted">
                  Note: This field is not implemented yet and can be left empty.
                </p>
              </div> */}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className={`flex items-center justify-between p-6 border-t theme-border ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
          <button
            onClick={handleClose}
            className="px-4 py-2 theme-text-secondary hover:theme-text-primary border theme-border rounded-lg theme-hover-bg transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 theme-text-secondary hover:theme-text-primary border theme-border rounded-lg theme-hover-bg transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {/* Save Feedback button - only show on first step */}
            {currentStep === 'feedback' && (
              <button
                onClick={handleSave}
                disabled={feedbacks.length === 0 || isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Feedback'}</span>
              </button>
            )}

            {!isLastStep ? (
              <button
                onClick={handleEvolveClick}
                disabled={isSubmitting || !canProceedToNext()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <span>Evolve Agent</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalEvolve}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>{isSubmitting ? 'Evolving...' : 'Start Evolve'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}