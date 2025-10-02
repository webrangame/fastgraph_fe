'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Eye, Code, Copy, Check } from 'lucide-react';
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

// (Editing removed) Read-only preview only

// VS Code-like YAML syntax highlighting (read-only)
const escapeHtml = (code: string): string =>
  code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const highlightYaml = (code: string): string => {
  const escaped = escapeHtml(code);
  return escaped
    // Comments
    .replace(/(#.*$)/gm, '<span style="color: #6A9955; font-style: italic;">$1</span>')
    // Keys (start of line until colon)
    .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/gm, '$1<span style="color: #4FC1FF;">$2</span><span style="color: var(--text-primary);">:</span>')
    // Quoted strings
    .replace(/:\s*&quot;([^&]*)&quot;/g, ': <span style="color: #CE9178;">&quot;$1&quot;</span>')
    .replace(/:\s*'([^']*)'/g, ': <span style="color: #CE9178;">&#39;$1&#39;</span>')
    // Booleans
    .replace(/:\s*(true|false)\b/g, ': <span style="color: #569CD6;">$1</span>')
    // Nulls
    .replace(/:\s*(null|~)\b/g, ': <span style="color: #569CD6;">$1</span>')
    // Numbers
    .replace(/:\s*(-?\d+\.\d+|-?\d+)\b/g, ': <span style="color: #B5CEA8;">$1</span>')
    // Array dash
    .replace(/^(\s*)-\s/mg, '$1<span style="color: var(--text-primary);">- </span>');
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
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      validateYaml(yamlContent);
    }
  }, [isOpen, agentName, capability, initialCapabilities]);

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedYaml = useMemo(() => highlightYaml(yamlContent), [yamlContent]);

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
                <span className="ml-2 text-blue-700 dark:text-blue-300 text-xs font-mono">
                  .yaml
                </span>
              </h2>
              <p className="text-xs theme-text-secondary">
                {agentName} • {capability ? capability.category : 'capability'} configuration
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Read-only Preview Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-full flex flex-col theme-bg">
            <div className="p-3 border-b theme-border theme-input-bg">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 theme-text-muted" />
                <span className="text-sm font-medium theme-text-secondary">Configuration Preview</span>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold theme-text-primary mb-2">YAML</h3>
                  <div className="theme-preview-bg p-3 rounded-lg overflow-auto">
                    <pre
                      className="font-mono text-xs theme-text-primary whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: highlightedYaml }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold theme-text-primary mb-2">Configuration Summary</h3>
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
                    <h3 className="text-sm font-semibold theme-text-primary mb-2">Errors</h3>
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t theme-border theme-header-bg text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="theme-text-primary">FastGraph</span>
            </div>
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
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}