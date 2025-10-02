'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Code, Copy, Check, Save, RotateCcw, Download } from 'lucide-react';
import { createHybridCapabilities, HybridCapability } from '@/lib/workflow-utils';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface CapabilityYamlEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
  capability?: HybridCapability;
  initialCapabilities?: string[];
  onSave?: (yamlContent: string) => void;
}

// Generate individual capability YAML
const generateCapabilityYaml = (capability: HybridCapability, agentName: string) => {
  const normalizedName = capability.name.toLowerCase().replace(/\s+/g, '-');
  
  return `# ${capability.name} Capability Configuration
# Agent: ${agentName}
# Category: ${capability.category}

capability:
  id: "${capability.id}"
  name: "${capability.name}"
  display_name: "${capability.name}"
  category: "${capability.category}"
  icon: "${capability.icon}"
  version: "1.0.0"
  
metadata:
  description: "${capability.description}"
  examples: ${JSON.stringify(capability.examples || [], null, 4).replace(/"/g, '"')}
  tags:
    - "${capability.category}"
    - "ai-capability"
    - "${normalizedName}"
  
configuration:
  enabled: true
  priority: "high"  # high | medium | low
  auto_trigger: false
  
  # Execution settings
  execution:
    timeout_seconds: 30
    max_retries: 3
    parallel_execution: false
    
  # Input/Output configuration  
  io_config:
    input_validation: true
    output_format: "structured"  # structured | raw | formatted
    streaming: false
    
  # Performance settings
  performance:
    cache_results: true
    cache_duration_minutes: 60
    rate_limit_per_minute: 30
    
# Capability-specific parameters
parameters:
  ${capability.category === 'cognitive' ? `# Cognitive capability parameters
  analysis_depth: "comprehensive"  # basic | detailed | comprehensive
  confidence_threshold: 0.8
  source_validation: true
  fact_checking: true` : ''}${capability.category === 'creative' ? `# Creative capability parameters  
  creativity_level: "balanced"  # conservative | balanced | innovative
  tone: "professional"  # professional | casual | creative | technical
  format_options: ["markdown", "html", "plain"]
  include_examples: true` : ''}${capability.category === 'technical' ? `# Technical capability parameters
  api_timeout: 15
  retry_strategy: "exponential_backoff"
  data_validation: true
  error_handling: "graceful"
  supported_formats: ["json", "xml", "csv"]` : ''}${capability.category === 'communication' ? `# Communication capability parameters
  language_detection: true
  context_awareness: true
  formality_level: "professional"
  audience_adaptation: true` : ''}

# Integration settings
integrations:
  webhook_notifications: false
  external_apis: []
  database_logging: true
  
# Security settings
security:
  input_sanitization: true
  output_filtering: true
  access_control:
    require_auth: true
    allowed_roles: ["admin", "agent-manager"]
    
# Monitoring & Analytics
monitoring:
  track_usage: true
  performance_metrics: true
  error_logging: true
  success_rate_tracking: true
  
# Development settings (remove in production)
development:
  debug_mode: false
  verbose_logging: false
  test_mode: false`;
};

export function CapabilityYamlEditor({ 
  isOpen, 
  onClose, 
  agentName, 
  agentId,
  capability,
  initialCapabilities = [],
  onSave
}: CapabilityYamlEditorProps) {
  const [yamlContent, setYamlContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Detect system theme
  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(darkMode ? 'vs-dark' : 'light');
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'vs-dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute initial YAML based on props (used for editor defaultValue)
  const computedInitialYaml = useMemo(() => {
    if (capability) {
      return generateCapabilityYaml(capability, agentName);
    }
    const hybridCaps = createHybridCapabilities(initialCapabilities);
    if (hybridCaps.length > 0) {
      return generateCapabilityYaml(hybridCaps[0], agentName);
    }
    return '';
  }, [agentName, capability, initialCapabilities]);

  // Initialize YAML content when opening
  useEffect(() => {
    if (isOpen) {
      setYamlContent(computedInitialYaml);
      setInitialContent(computedInitialYaml);
      setIsDirty(false);
      validateYaml(computedInitialYaml);
    }
  }, [isOpen, computedInitialYaml]);

  // Basic YAML validation
  const validateYaml = (content: string) => {
    const errors: string[] = [];
    
    if (!content.includes('capability:')) errors.push('Missing capability configuration');
    if (!content.includes('name:')) errors.push('Missing capability name');
    if (!content.includes('category:')) errors.push('Missing category');
    if (!content.includes('configuration:')) errors.push('Missing configuration section');
    if (!content.includes('parameters:')) errors.push('Missing parameters section');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setYamlContent(newValue);
    setIsDirty(newValue !== initialContent);
    validateYaml(newValue);
  };

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Force proper initialization and syntax highlighting
    setTimeout(() => {
      editor.layout();
      const model = editor.getModel();
      if (model) {
        // Force re-tokenization by setting language
        monaco.editor.setModelLanguage(model, 'yaml');
      }
      // Force a paint/render cycle
      editor.updateOptions({});
    }, 50);
  };

  const handleSave = () => {
    if (validateYaml(yamlContent)) {
      onSave?.(yamlContent);
      setInitialContent(yamlContent);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    setYamlContent(initialContent);
    setIsDirty(false);
    validateYaml(initialContent);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(initialContent);
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${capability?.name || 'capability'}-config.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
      <div className="theme-card-bg rounded-2xl shadow-2xl border theme-border w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* VS Code-like Header */}
        <div className="flex items-center justify-between p-4 border-b theme-border theme-header-bg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold theme-text-primary flex items-center gap-2">
                {capability ? `${capability.name}` : 'Capability'} Configuration
                <span className="text-blue-700 dark:text-blue-300 text-xs font-mono">
                  .yaml
                </span>
                {isDirty && (
                  <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                    Modified
                  </span>
                )}
              </h2>
              <p className="text-xs theme-text-secondary">
                {agentName} • {capability ? capability.category : 'capability'} configuration
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-all duration-200"
              title="Download YAML"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b theme-border theme-bg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!isDirty || validationErrors.length > 0}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDirty && validationErrors.length === 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  title="Save (Ctrl+S)"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={!isDirty}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isDirty
                      ? 'theme-text-primary theme-hover-bg'
                      : 'theme-text-secondary cursor-not-allowed opacity-50'
                  }`}
                  title="Reset to original"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm theme-text-primary theme-hover-bg transition-all duration-200"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-xs theme-text-secondary">
                <div className="flex items-center space-x-2">
                  <span>Lines: {yamlContent.split('\n').length}</span>
                  <span>•</span>
                  <span>Characters: {yamlContent.length}</span>
                </div>
                {validationErrors.length > 0 && (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {validationErrors.length === 0 && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Valid</span>
                  </div>
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden relative">
              <Editor
                key={isOpen ? 'editor-open' : 'editor-closed'}
                height="100%"
                defaultLanguage="yaml"
                language="yaml"
                defaultValue={computedInitialYaml}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                theme={theme}
                loading={
                  <div className="flex items-center justify-center h-full theme-bg">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm theme-text-secondary">Initializing Monaco Editor...</span>
                    </div>
                  </div>
                }
                options={{
                  minimap: { enabled: true },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  wrappingStrategy: 'advanced',
                  folding: true,
                  foldingStrategy: 'indentation',
                  showFoldingControls: 'always',
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  contextmenu: true,
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>

            {/* Validation Errors Panel */}
            {validationErrors.length > 0 && (
              <div className="border-t theme-border theme-bg p-3 max-h-32 overflow-y-auto">
                <div className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    >
                      <span className="font-bold">❌</span>
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t theme-border theme-header-bg text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="theme-text-primary font-medium">FastGraph YAML Editor</span>
            </div>
            <span className="theme-text-secondary">Monaco Editor</span>
            <span className="theme-text-secondary">•</span>
            <span className="theme-text-secondary">{capability?.category || 'Capability'}</span>
          </div>
          
          <div className="flex items-center space-x-2 theme-text-secondary">
            <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd>
            <span>to save</span>
          </div>
        </div>
      </div>
    </div>
  );
}