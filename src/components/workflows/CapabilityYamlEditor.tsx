'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RefreshCw, Eye, Code, Sparkles, Download, Upload, Copy, Check } from 'lucide-react';
import { createHybridCapabilities, HybridCapability } from '@/lib/workflow-utils';

interface CapabilityYamlEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
  capability?: HybridCapability;
  initialCapabilities?: string[];
}

// Generate individual capability YAML
const generateCapabilityYaml = (capability: HybridCapability, agentName: string) => {
  const normalizedName = capability.name.toLowerCase().replace(/\s+/g, '-');
  
  return `# ${capability.name} Capability Configuration
# Agent: ${agentName}
# Category: ${capability.category}
# Last Updated: ${new Date().toISOString()}

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

// VS Code-like YAML syntax highlighting with theme-aware colors
const highlightYaml = (code: string): string => {
  return code
    // Comments
    .replace(/(#.*$)/gm, '<span style="color: #6A9955; font-style: italic;">$1</span>')
    // Keys
    .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm, '$1<span style="color: #4FC1FF;">$2</span><span style="color: var(--text-primary);">:</span>')
    // String values
    .replace(/:\s*"([^"]*)"/g, ': <span style="color: #CE9178;">"$1"</span>')
    .replace(/:\s*'([^']*)'/g, ': <span style="color: #CE9178;">\'$1\'</span>')
    // Boolean values
    .replace(/:\s*(true|false)\b/g, ': <span style="color: #569CD6;">$1</span>')
    // Numbers
    .replace(/:\s*(\d+\.?\d*)\b/g, ': <span style="color: #B5CEA8;">$1</span>')
    // Array items
    .replace(/^(\s*)-\s*/gm, '$1<span style="color: var(--text-primary);">- </span>')
    // Null values
    .replace(/:\s*(null|~)\b/g, ': <span style="color: #569CD6;">$1</span>');
};

export function CapabilityYamlEditor({ 
  isOpen, 
  onClose, 
  agentName, 
  agentId,
  capability,
  initialCapabilities = []
}: CapabilityYamlEditorProps) {
  const [yamlContent, setYamlContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Initialize YAML content
  useEffect(() => {
    if (isOpen) {
      let yamlContent = '';
      
      if (capability) {
        yamlContent = generateCapabilityYaml(capability, agentName);
      } else {
        const hybridCaps = createHybridCapabilities(initialCapabilities);
        if (hybridCaps.length > 0) {
          yamlContent = generateCapabilityYaml(hybridCaps[0], agentName);
        }
      }
      
      setYamlContent(yamlContent);
      setHasChanges(false);
    }
  }, [isOpen, agentName, capability, initialCapabilities]);

  // Update syntax highlighting when content changes
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlightYaml(yamlContent);
    }
  }, [yamlContent]);

  // Track cursor position
  const handleCursorChange = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value.substring(0, textarea.selectionStart);
      const lines = text.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      setCursorPosition({ line, column });
    }
  };

  // Basic YAML validation for individual capabilities
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

  const handleContentChange = (content: string) => {
    setYamlContent(content);
    setHasChanges(true);
    validateYaml(content);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Saving individual capability YAML:', capability?.name, yamlContent);
    
    setIsSaving(false);
    setHasChanges(false);
    
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseYamlToPreview = (yaml: string) => {
    const capabilities: string[] = [];
    const lines = yaml.split('\n');
    let inCapabilities = false;
    
    lines.forEach(line => {
      if (line.includes('capability:')) inCapabilities = true;
      if (inCapabilities && line.includes('name:')) {
        const match = line.match(/name:\s*"?([^"]+)"?/);
        if (match) capabilities.push(match[1]);
      }
    });
    
    return capabilities;
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
              <h2 className="text-lg font-bold theme-text-primary flex items-center">
                {capability ? `${capability.name}` : 'Capability'} Configuration
                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded font-mono">
                  .yaml
                </span>
              </h2>
              <p className="text-sm theme-text-secondary">
                {agentName} • {capability ? capability.category : 'capability'} configuration
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex items-center theme-input-bg rounded-lg p-1">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  !isPreviewMode 
                    ? 'theme-bg theme-text-primary shadow-sm' 
                    : 'theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Code className="w-4 h-4 mr-1.5 inline" />
                Editor
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isPreviewMode 
                    ? 'theme-bg theme-text-primary shadow-sm' 
                    : 'theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Eye className="w-4 h-4 mr-1.5 inline" />
                Preview
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VS Code-like Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Editor Panel */}
          <div className={`${isPreviewMode ? 'w-1/2' : 'w-full'} flex flex-col border-r theme-border`}>
            
            {/* Editor Toolbar - VS Code style */}
            <div className="flex items-center justify-between px-4 py-2 border-b theme-border theme-input-bg">
              <div className="flex items-center space-x-4">

                <span className="text-sm theme-text-secondary font-mono">
                  {capability ? `${capability.name.toLowerCase().replace(/\s+/g, '-')}.yaml` : 'capability.yaml'}
                </span>
                {hasChanges && (
                  <div className="w-2 h-2 theme-bg rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-xs theme-text-muted">
                <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                <span>•</span>
                <span>YAML</span>
                <span>•</span>
                <span>UTF-8</span>
                {validationErrors.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500">{validationErrors.length} errors</span>
                  </>
                )}
              </div>
            </div>

            {/* VS Code-like Editor */}
            <div className="flex-1 flex overflow-hidden theme-bg">
              
              {/* Line Numbers */}
              <div className="theme-input-bg border-r theme-border px-2 py-4 min-w-[60px]">
              <div className="space-y-0">
                {Array.from({ length: yamlContent.split('\n').length }, (_, index) => (
                  <div 
                    key={index}
                    className="text-right pr-2 theme-text-muted select-none leading-6"
                    style={{ fontSize: '13px', fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 relative overflow-hidden">
                {/* Syntax Highlighted Background */}
                <pre
                  ref={highlightRef}
                  className="absolute inset-0 p-4 font-mono text-sm leading-6 theme-text-primary pointer-events-none overflow-auto whitespace-pre-wrap break-words"
                  style={{ 
                    fontSize: '13px', 
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineHeight: '1.5'
                  }}
                  aria-hidden="true"
                />
                
                {/* Actual Textarea */}
                <textarea
                  ref={textareaRef}
                  value={yamlContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyUp={handleCursorChange}
                  onClick={handleCursorChange}
                  className="absolute inset-0 p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-blue-500 resize-none border-none outline-none overflow-auto whitespace-pre-wrap break-words"
                  style={{ 
                    fontSize: '13px', 
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineHeight: '1.5'
                  }}
                  placeholder="Enter YAML configuration..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {isPreviewMode && (
            <div className="w-1/2 flex flex-col theme-bg">
              <div className="p-3 border-b theme-border theme-input-bg">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 theme-text-muted" />
                  <span className="text-sm font-medium theme-text-secondary">Configuration Preview</span>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold theme-text-primary mb-2">Configuration Summary:</h3>
                    <div className="text-xs theme-text-secondary space-y-1 theme-input-bg p-3 rounded-lg">
                      <div>• Capability: {capability?.name || 'Unknown'}</div>
                      <div>• Category: {capability?.category || 'Unknown'}</div>
                      <div>• Agent: {agentName}</div>
                      <div>• Status: {validationErrors.length === 0 ? '✅ Valid' : '❌ Invalid'}</div>
                      <div>• Lines: {yamlContent.split('\n').length}</div>
                    </div>
                  </div>
                  
                  {validationErrors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold theme-text-primary mb-2">Errors:</h3>
                      <div className="space-y-1">
                        {validationErrors.map((error, idx) => (
                          <div key={idx} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            • {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VS Code-like Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t theme-border theme-header-bg text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="theme-text-primary">FastGraph</span>
            </div>
            <span className="theme-text-secondary">Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
            <span className="theme-text-secondary">YAML</span>
            {validationErrors.length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded">
                {validationErrors.length} errors
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCopy}
              className="theme-text-secondary hover:theme-text-primary px-2 py-1 rounded transition-colors duration-200"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            
            <button
              onClick={onClose}
              className="theme-text-secondary hover:theme-text-primary px-3 py-1 rounded transition-colors duration-200"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || validationErrors.length > 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}