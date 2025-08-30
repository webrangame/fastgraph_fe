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
  onEvolve: (feedback: string, evolutionData: EvolutionData) => void;
}

interface EvolutionData {
  performanceGoals: string;
}

type WizardStep = 'feedback' | 'performance';

export function FeedbackPopup({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  onSave, 
  onEvolve 
}: FeedbackPopupProps) {
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('feedback');
  const [isEvolving, setIsEvolving] = useState(true);
  
  const [evolutionData, setEvolutionData] = useState<EvolutionData>({
    performanceGoals: ''
  });

  const wizardSteps: { key: WizardStep; title: string; description: string }[] = [
    { key: 'feedback', title: 'Agent Performance Feedback', description: 'Provide general feedback on current performance' },
    { key: 'performance', title: 'Agent Evolution Performance Goals', description: 'Define what the evolved agent should achieve' }
  ];

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

  const handleEvolve = () => {
    // This function is no longer needed since we're always in wizard mode
    // but keeping it for backward compatibility
  };

  const handleFinalEvolve = async () => {
    setIsSubmitting(true);
    try {
      await onEvolve(feedback, evolutionData);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedback('');
    setEvolutionData({
      performanceGoals: ''
    });
    setCurrentStep('feedback');
    setIsEvolving(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      return feedback.trim().length > 0;
    }
    if (currentStep === 'performance') {
      return evolutionData.performanceGoals.trim().length > 0;
    }
    return true;
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].key);
    }
    // Stay in wizard mode - no longer exit to simple mode
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center">
      {wizardSteps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = getCurrentStepIndex() > index;
        const isAccessible = index <= getCurrentStepIndex() || !isEvolving;

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
                onClick={() => isAccessible && isEvolving && setCurrentStep(step.key)}
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
          {currentStep === 'feedback' && (
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
          )}

          {currentStep === 'performance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  What specific performance improvements do you want to see?
                </label>
                <textarea
                  value={evolutionData.performanceGoals}
                  onChange={(e) => setEvolutionData(prev => ({ ...prev, performanceGoals: e.target.value }))}
                  placeholder="e.g., Faster response times, better accuracy in data analysis, improved error handling, enhanced problem-solving capabilities..."
                  className="w-full h-40 p-4 theme-input-bg theme-text-primary border theme-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="theme-text-muted text-xs">
                    Define measurable goals for agent evolution and improvement
                  </p>
                  <span className="theme-text-muted text-xs">
                    {evolutionData.performanceGoals.length}/1000
                  </span>
                </div>
              </div>
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
                disabled={!feedback.trim() || isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Feedback'}</span>
              </button>
            )}

            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting || !canProceedToNext()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <span>Evolve Agent</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalEvolve}
                disabled={isSubmitting || !canProceedToNext()}
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