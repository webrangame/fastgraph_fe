'use client';
import React, { useState } from 'react';
import { Server, Brain, Info, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContextWindowPreset {
  name: string;
  value: number;
  description: string;
  useCase: string;
}

const contextWindowPresets: ContextWindowPreset[] = [
  {
    name: 'Small',
    value: 4096,
    description: '4K tokens',
    useCase: 'Quick tasks, simple queries'
  },
  {
    name: 'Medium',
    value: 8192,
    description: '8K tokens',
    useCase: 'Standard workflows, code review'
  },
  {
    name: 'Large',
    value: 16384,
    description: '16K tokens',
    useCase: 'Complex analysis, long documents'
  },
  {
    name: 'Extra Large',
    value: 32768,
    description: '32K tokens',
    useCase: 'Large codebases, extensive context'
  },
  {
    name: 'Maximum',
    value: 131072,
    description: '128K tokens',
    useCase: 'Full document processing, comprehensive analysis'
  }
];

export default function AdvancedSettings() {
  const [contextWindowSize, setContextWindowSize] = useState<number>(8192);
  const [customValue, setCustomValue] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [showSaved, setShowSaved] = useState<boolean>(false);

  const handlePresetSelect = (preset: ContextWindowPreset) => {
    setContextWindowSize(preset.value);
    setIsCustomMode(false);
    setCustomValue('');
  };

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 200000) {
      setContextWindowSize(numValue);
    }
  };

  const saveSettings = () => {
    // Here you would typically save to a backend or local storage
    console.log('Saving context window size:', contextWindowSize);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const selectedPreset = contextWindowPresets.find(p => p.value === contextWindowSize);

  return (
    <div className="theme-card-bg rounded-lg theme-border border theme-shadow">
      <div className="p-6 theme-border border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary flex items-center gap-2">
              <Server className="w-5 h-5" />
              Advanced Settings
            </h2>
            <p className="theme-text-secondary mt-1">
              Configure advanced system parameters and performance settings
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Context Window Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold theme-text-primary">Context Window Size</h3>
          </div>
          
          <div className="relative theme-card-bg border-l-4 border-blue-400 rounded-r-lg p-4 mb-4 theme-hover-bg transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium theme-text-primary">About Context Window</h4>
                <p className="theme-text-secondary text-sm mt-1">
                  The context window determines how much text the AI can process at once. Larger windows allow for more complex analysis but may use more resources.
                </p>
              </div>
            </div>
          </div>

          {/* Current Setting Display */}
          <div className="theme-input-bg rounded-lg p-4 theme-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium theme-text-primary">Current Setting</p>
                <p className="text-sm theme-text-secondary">
                  {contextWindowSize.toLocaleString()} tokens
                  {selectedPreset && ` (${selectedPreset.name})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {(contextWindowSize / 1024).toFixed(1)}K
                </p>
                <p className="text-xs theme-text-secondary">tokens</p>
              </div>
            </div>
          </div>

          {/* Preset Options */}
          <div>
            <h4 className="font-medium theme-text-primary mb-3">Preset Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contextWindowPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-lg transition-all duration-200 text-left border-2 ${
                    contextWindowSize === preset.value && !isCustomMode
                      ? 'border-blue-500 theme-card-bg ring-2 ring-blue-500/20 theme-text-primary'
                      : 'theme-border theme-hover-bg theme-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-sm font-mono text-blue-600">{preset.description}</span>
                  </div>
                  <p className="text-xs theme-text-secondary">{preset.useCase}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Value Input */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="customMode"
                checked={isCustomMode}
                onChange={(e) => {
                  setIsCustomMode(e.target.checked);
                  if (!e.target.checked) {
                    setCustomValue('');
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="customMode" className="font-medium theme-text-primary">
                Custom Value
              </label>
            </div>
            
            {isCustomMode && (
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Enter custom token count (1-200000)"
                  value={customValue}
                  onChange={(e) => handleCustomValueChange(e.target.value)}
                  className="flex-1 theme-input-bg theme-border border rounded-lg px-3 py-2 theme-text-primary"
                  min="1"
                  max="200000"
                />
                <div className="flex items-center px-3 py-2 theme-input-bg theme-border border rounded-lg">
                  <span className="text-sm theme-text-secondary">tokens</span>
                </div>
              </div>
            )}
          </div>

          {/* Performance Warning */}
          {contextWindowSize > 50000 && (
            <div className="relative theme-card-bg border-l-4 border-amber-400 rounded-r-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium theme-text-primary">Performance Notice</h4>
                  <p className="theme-text-secondary text-sm mt-1">
                    Large context windows may result in slower processing and increased resource usage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t theme-border">
            <div className="text-sm theme-text-secondary">
              Changes will apply to new workflow executions
            </div>
            <Button 
              variant="primary" 
              onClick={saveSettings}
              className="flex items-center gap-2"
              disabled={isCustomMode && (!customValue || parseInt(customValue) <= 0)}
            >
              {showSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>

        {/* Additional Advanced Settings Placeholder */}
        <div className="pt-6 border-t theme-border">
          <h3 className="text-lg font-semibold theme-text-primary mb-3">Additional Settings</h3>
          <div className="theme-input-bg rounded-lg p-4 theme-border border text-center">
            <p className="theme-text-secondary">
              More advanced configuration options will be available here in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}