'use client';

import { useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  Sparkles,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react';

interface PromptInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

// Mock agent data - replace with your actual agent types
// const agents = [
//   { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', icon: '🧠', description: 'Most capable model' },
//   { id: 'claude-3-haiku', name: 'Claude 3 Haiku', icon: '⚡', description: 'Fast and efficient' },
//   { id: 'gpt-4', name: 'GPT-4', icon: '🤖', description: 'OpenAI\'s latest model' },
//   { id: 'gemini-pro', name: 'Gemini Pro', icon: '✨', description: 'Google\'s advanced AI' }
// ];

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

export function PromptInput({ onSubmit, isProcessing }: PromptInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (inputValue.trim() && !isProcessing) {
      onSubmit(inputValue.trim());
      setInputValue('');
      setAttachedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files].slice(0, 5)); // Limit to 5 files
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="fixed bottom-6 z-50 w-full pointer-events-none">
      <div className="ml-40 mr-40 flex justify-center pointer-events-auto">
        <div className="w-full max-w-2xl px-4">
          <div className="theme-card backdrop-blur-md rounded-2xl shadow-2xl border theme-border overflow-hidden">
        
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="px-4 py-3 theme-bg border-b theme-border">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-lg border border-cyan-200/30 dark:border-cyan-700/30">
                  {getFileIcon(file.type)}
                  <span className="text-sm theme-text-primary truncate max-w-32">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-0.5 rounded-full hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-3 p-4">
          {/* Input Area */}
          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to add to your workflow..."
              className="w-full min-h-12 max-h-32 px-4 py-3 pr-24 theme-surface border theme-border rounded-xl resize-none theme-text-primary placeholder:theme-text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              disabled={isProcessing}
              rows={1}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 m-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-text-muted hover:theme-text-primary transition-colors"
                disabled={isProcessing}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isProcessing}
                className={`p-2 rounded-lg transition-all ${
                  inputValue.trim() && !isProcessing
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 theme-text-muted cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-lg border border-cyan-200/30 dark:border-cyan-700/30">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <div className="flex-1">
                <div className="font-medium text-cyan-700 dark:text-cyan-300">
                  Processing your request
                </div>
                <div className="text-sm text-cyan-600 dark:text-cyan-400">
                  Analyzing your request and updating workflow...
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-cyan-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setInputValue('Add a customer service agent to handle inquiries')}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 theme-text-muted hover:theme-text-primary transition-colors border theme-border"
            >
              Add Agent
            </button>
            <button
              onClick={() => setInputValue('Create a data processing pipeline')}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 theme-text-muted hover:theme-text-primary transition-colors border theme-border"
            >
              Data Pipeline
            </button>
            <button
              onClick={() => setInputValue('Set up email notifications for workflow completion')}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 theme-text-muted hover:theme-text-primary transition-colors border theme-border"
            >
              Notifications
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}