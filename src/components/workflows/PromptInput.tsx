'use client';

import { useState } from 'react';
import { MessageCircle, Send, Minimize2, Plus, Play, GitBranch } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

export function PromptInput({ onSubmit, isProcessing }: PromptInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = () => {
    if (inputValue.trim() && !isProcessing) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group border border-cyan-400/30"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-xl shadow-xl border border-cyan-200/20 dark:border-cyan-400/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-cyan-500/80 backdrop-blur-md border-b border-cyan-400/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-white">Workflow Assistant</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                <span className="text-xs text-white/90">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Input Section */}
        <div className="p-4 bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to modify your workflow, add agents, or execute commands..."
              className="w-full h-20 p-3 pr-12 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-400/30 rounded-lg resize-none text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              disabled={isProcessing}
            />
            
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isProcessing}
              className={`absolute bottom-3 right-2 p-2 rounded-lg backdrop-blur-sm transition-all border ${
                inputValue.trim() && !isProcessing
                  ? 'bg-cyan-500/80 hover:bg-cyan-500 text-white shadow-md hover:shadow-lg border-cyan-400/30'
                  : 'bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-300/30 dark:border-gray-600/30'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInputValue('Add a customer service agent to the workflow')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <span>Add Agent</span>
            </button>
            
            <button
              onClick={() => setInputValue('Execute the current workflow')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              <span>Execute</span>
            </button>
            
            <button
              onClick={() => setInputValue('Show me workflow statistics')}
              className="flex items-center space-x-2 px-3 py-2 bg-cyan-100/60 dark:bg-cyan-900/30 backdrop-blur-sm text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-200/60 dark:hover:bg-cyan-900/50 transition-colors border border-cyan-200/30 dark:border-cyan-700/30"
            >
              <div className="w-5 h-5 bg-cyan-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <GitBranch className="w-3 h-3 text-white" />
              </div>
              <span>Stats</span>
            </button>
          </div>

          {/* Status Indicator */}
          {isProcessing && (
            <div className="mt-3 flex items-center space-x-3 p-3 bg-cyan-50/60 dark:bg-cyan-900/20 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 rounded-lg">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <div className="text-cyan-700 dark:text-cyan-300 font-medium">Processing your request...</div>
                <div className="text-cyan-600 dark:text-cyan-400 text-sm">This may take a few seconds</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}