'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface StreamingProgressProps {
  isStreaming: boolean;
  progress?: {
    step: string;
    progress: number;
    message: string;
  } | null;
  error?: any;
  onStop?: () => void;
}

export function StreamingProgress({ 
  isStreaming, 
  progress, 
  error, 
  onStop 
}: StreamingProgressProps) {
  if (!isStreaming && !error) {
    return null;
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'initializing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'role_identification':
        return <div className="w-4 h-4 rounded-full bg-blue-500" />;
      case 'spec_generation':
        return <div className="w-4 h-4 rounded-full bg-purple-500" />;
      case 'swarm_execution':
        return <div className="w-4 h-4 rounded-full bg-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStepName = (step: string) => {
    switch (step) {
      case 'initializing':
        return 'Initializing';
      case 'role_identification':
        return 'Role Identification';
      case 'spec_generation':
        return 'Spec Generation';
      case 'swarm_execution':
        return 'Swarm Execution';
      case 'completed':
        return 'Completed';
      default:
        return step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {error ? 'Error' : 'Auto Orchestration'}
            </span>
          </div>
          {onStop && !error && (
            <button
              onClick={onStop}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {error ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message || 'An error occurred during auto orchestration'}
              </p>
              {error.type && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Error Type: {error.type}
                </p>
              )}
            </div>
          ) : progress ? (
            <div className="space-y-3">
              {/* Current Step */}
              <div className="flex items-center space-x-3">
                {getStepIcon(progress.step)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getStepName(progress.step)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {progress.message}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{progress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex space-x-2">
                {['role_identification', 'spec_generation', 'swarm_execution'].map((step, index) => {
                  const isActive = progress.step === step;
                  const isCompleted = progress.step === 'completed' || 
                    (step === 'role_identification' && progress.step !== 'role_identification') ||
                    (step === 'spec_generation' && ['swarm_execution', 'completed'].includes(progress.step)) ||
                    (step === 'swarm_execution' && progress.step === 'completed');
                  
                  return (
                    <div
                      key={step}
                      className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                        isCompleted
                          ? 'bg-green-500'
                          : isActive
                          ? 'bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Starting auto orchestration...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!error && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {progress?.step === 'completed' 
                ? 'Workflow completed successfully' 
                : 'Processing your request...'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
