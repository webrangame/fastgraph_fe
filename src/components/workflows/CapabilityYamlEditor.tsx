'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Eye, Code, Sparkles, Download, Upload, Copy, Check } from 'lucide-react';
import { createHybridCapabilities, HybridCapability } from '@/lib/workflow-utils';

interface CapabilityYamlEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
  capability?: HybridCapability; // For single capability editing
  initialCapabilities?: string[]; // For bulk editing (legacy)
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

  // Initialize YAML content
  useEffect(() => {
    if (isOpen) {
      let yamlContent = '';
      
      if (capability) {
        // Single capability editing
        yamlContent = generateCapabilityYaml(capability, agentName);
      } else {
        // Legacy: bulk editing (fallback)
        const hybridCaps = createHybridCapabilities(initialCapabilities);
        if (hybridCaps.length > 0) {
          yamlContent = generateCapabilityYaml(hybridCaps[0], agentName);
        }
      }
      
      setYamlContent(yamlContent);
      setHasChanges(false);
    }
  }, [isOpen, agentName, capability, initialCapabilities]);

  // Basic YAML validation for individual capabilities
  const validateYaml = (content: string) => {
    const errors: string[] = [];
    
    // Check for basic YAML structure
    if (!content.includes('capability:')) errors.push('Missing capability configuration');
    if (!content.includes('name:')) errors.push('Missing capability name');
    if (!content.includes('category:')) errors.push('Missing category');
    
    // Check for required sections
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production: await saveCapabilityConfig(agentId, capability?.id, yamlContent);
    console.log('Saving individual capability YAML:', capability?.name, yamlContent);
    
    setIsSaving(false);
    setHasChanges(false);
    
    // Show success feedback
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
    // Simple YAML parsing for preview (in production use proper YAML parser)
    const capabilities: string[] = [];
    const lines = yaml.split('\n');
    let inCapabilities = false;
    
    lines.forEach(line => {
      if (line.includes('capabilities:')) inCapabilities = true;
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
      <div className="theme-card-bg rounded-2xl shadow-2xl border theme-border w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text-primary">
                {capability ? `${capability.icon} ${capability.name}` : 'Capability'} Editor
              </h2>
              <p className="text-sm theme-text-secondary">
                Configure {capability ? capability.name : 'capability'} for {agentName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  !isPreviewMode 
                    ? 'bg-white dark:bg-gray-700 theme-text-primary shadow-sm' 
                    : 'theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <Code className="w-4 h-4 mr-1.5 inline" />
                Edit
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isPreviewMode 
                    ? 'bg-white dark:bg-gray-700 theme-text-primary shadow-sm' 
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

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Editor Panel */}
          <div className={`${isPreviewMode ? 'w-1/2' : 'w-full'} flex flex-col border-r theme-border`}>
            
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-3 border-b theme-border bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 theme-text-muted" />
                <span className="text-sm font-medium theme-text-secondary">
                  {capability ? `${capability.name} Configuration` : 'YAML Configuration'}
                </span>
                {validationErrors.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                    {validationErrors.length} errors
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded transition-all duration-200"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="p-1.5 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded transition-all duration-200" title="Import YAML">
                  <Upload className="w-4 h-4" />
                </button>
                <button className="p-1.5 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded transition-all duration-200" title="Export YAML">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* YAML Editor */}
            <div className="flex-1 relative">
              <textarea
                value={yamlContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm theme-bg theme-text-primary resize-none border-none outline-none"
                style={{ 
                  lineHeight: '1.6',
                  tabSize: 2
                }}
                placeholder="Enter YAML configuration..."
                spellCheck={false}
              />
              
              {/* Line numbers overlay could go here */}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 border-t theme-border bg-red-50 dark:bg-red-900/20">
                <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Validation Errors:</div>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {isPreviewMode && (
            <div className="w-1/2 flex flex-col">
              <div className="p-3 border-b theme-border bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 theme-text-muted" />
                  <span className="text-sm font-medium theme-text-secondary">Live Preview</span>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold theme-text-primary mb-2">Parsed Capabilities:</h3>
                    <div className="flex flex-wrap gap-2">
                      {parseYamlToPreview(yamlContent).map((cap, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold theme-text-primary mb-2">Configuration Summary:</h3>
                    <div className="text-xs theme-text-secondary space-y-1">
                      <div>• Capability: {capability?.name || 'Unknown'}</div>
                      <div>• Category: {capability?.category || 'Unknown'}</div>
                      <div>• Agent: {agentName}</div>
                      <div>• Status: {validationErrors.length === 0 ? '✅ Valid' : '❌ Invalid'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t theme-border bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-4 text-xs theme-text-muted">
            <span>Lines: {yamlContent.split('\n').length}</span>
            <span>Characters: {yamlContent.length}</span>
            {hasChanges && <span className="text-orange-500">• Unsaved changes</span>}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || validationErrors.length > 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg 
                         hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

