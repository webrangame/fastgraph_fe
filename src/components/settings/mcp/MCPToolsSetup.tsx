'use client';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { useCreateMCPServerMutation, useTestMCPConnectionMutation } from '@/redux/api/mcp/mcpApi';
import { useAuditLog } from '@/hooks/useAuditLog';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface MCPConfig {
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  authType: string;
  apiKey: string;
  timeout: number;
  retries: number;
  configYml?: string;
}

interface MCPToolsSetupProps {
  config: MCPConfig;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onConfigChange: (field: keyof MCPConfig, value: string | number) => void;
  onConnect: () => void;
  onNavigateToAvailableMCPs?: () => void;
}

export default function MCPToolsSetup({ 
  config, 
  connectionStatus, 
  onConfigChange, 
  onConnect,
  onNavigateToAvailableMCPs
}: MCPToolsSetupProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'yaml'>('config');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [yamlContent, setYamlContent] = useState<string>(config?.configYml || '');
  const [yamlErrors, setYamlErrors] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues
  } = useForm<MCPConfig>({
    mode: 'onChange',
    defaultValues: config
  });

  const [createMCPServer, { isLoading: isCreating }] = useCreateMCPServerMutation();
  const [testMCPConnection, { isLoading: isTesting }] = useTestMCPConnectionMutation();
  const { logActivity } = useAuditLog();

  const isConnecting = connectionStatus === 'connecting' || isCreating || isTesting;
  const canConnect = isValid && !isConnecting;

  // Watch for changes and update parent component
  React.useEffect(() => {
    const subscription = watch((value) => {
      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
          onConfigChange(key as keyof MCPConfig, val);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onConfigChange]);

  // Validate YAML (basic presence checks)
  const validateYaml = (content: string) => {
    const errors: string[] = [];
    if (content && content.trim()) {
      const hasColon = content.includes(':');
      const hasDash = content.split('\n').some((l) => l.trim().startsWith('-'));
      if (!hasColon && !hasDash) {
        errors.push('YAML appears invalid: missing key-value (:) or list (-) structure');
      }
    }
    setYamlErrors(errors);
    return errors.length === 0;
  };

  const handleYamlChange = (value?: string) => {
    const newVal = value ?? '';
    setYamlContent(newVal);
    validateYaml(newVal);
  };

  const handleYamlMount = (ed: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = ed;
    setTimeout(() => {
      const model = ed.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, 'yaml');
      }
      ed.updateOptions({});
    }, 50);
  };

  const handleYamlSaveToForm = () => {
    if (validateYaml(yamlContent)) {
      // Save YAML into the form state only on explicit save to avoid re-renders while typing
      setValue('configYml', yamlContent, { shouldDirty: true, shouldValidate: true });
      toast.success('YAML saved to configuration');
    } else {
      toast.error('Please fix YAML errors before saving');
    }
  };

  const handleYamlReset = () => {
    const currentFormYaml = getValues('configYml') || '';
    setYamlContent(currentFormYaml);
    setYamlErrors([]);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) model.setValue(currentFormYaml);
    }
  };


  // Handle MCP server creation and connection
  const handleMCPServerConnect = async (formData: MCPConfig) => {
    try {
      // First test the connection
      toast.loading('Testing connection...', { id: 'mcp-test' });
      const testResult = await testMCPConnection({
        serverName: formData.serverName,
        serverId: formData.serverId,
        serverType: formData.serverType,
        serverUrl: formData.serverUrl,
        authType: formData.authType,
        apiKey: formData.apiKey,
        timeout: formData.timeout,
        retries: formData.retries,
        configYml: formData.configYml,
      }).unwrap();

      if (testResult.success) {
        toast.success('Connection test successful!', { id: 'mcp-test' });
        
        // Log connection test audit
        await logActivity({
          action: 'test',
          resource: 'mcp',
          description: `MCP server connection test successful: ${formData.serverName}`,
          details: `Server URL: ${formData.serverUrl}, Type: ${formData.serverType}`,
          task: 'mcp-connection-test',
          endpoint: '/api/v1/mcp/test-connection',
          method: 'POST',
          statusCode: 200,
          metadata: {
            serverName: formData.serverName,
            serverType: formData.serverType,
            serverUrl: formData.serverUrl,
            authType: formData.authType
          }
        });
        
        // Create the MCP server
        toast.loading('Creating MCP server...', { id: 'mcp-create' });
        const createResult = await createMCPServer({
          serverName: formData.serverName,
          serverId: formData.serverId,
          serverType: formData.serverType,
          serverUrl: formData.serverUrl,
          protocolVersion: '1.0',
          authType: formData.authType,
          apiKey: formData.apiKey,
          timeout: formData.timeout,
          retries: formData.retries,
          configYml: formData.configYml,
          customHeaders: {},
          metadata: {
            description: `${formData.serverName} MCP Server`,
            version: '1.0.0'
          }
        }).unwrap();

        // Log MCP server creation audit
        await logActivity({
          action: 'create',
          resource: 'mcp',
          description: `MCP server created: ${formData.serverName}`,
          details: `Server ID: ${formData.serverId}, Type: ${formData.serverType}, URL: ${formData.serverUrl}`,
          task: 'mcp-server-creation',
          endpoint: '/api/v1/mcp/servers',
          method: 'POST',
          statusCode: 201,
          metadata: {
            serverId: formData.serverId,
            serverName: formData.serverName,
            serverType: formData.serverType,
            serverUrl: formData.serverUrl,
            authType: formData.authType,
            timeout: formData.timeout,
            retries: formData.retries,
            hasConfigYml: !!formData.configYml
          }
        });

        toast.success('MCP server created successfully! Redirecting to Available MCPs...', { id: 'mcp-create' });
        
        // Call the parent onConnect callback
        onConnect();
        
        // Navigate to Available MCPs section after successful save
        if (onNavigateToAvailableMCPs) {
          // Add a small delay to ensure the toast is visible
          setTimeout(() => {
            onNavigateToAvailableMCPs();
          }, 1500);
        }
      } else {
        // Log failed connection test audit
        await logActivity({
          action: 'test',
          resource: 'mcp',
          description: `MCP server connection test failed: ${formData.serverName}`,
          details: `Error: ${testResult.message}, Server URL: ${formData.serverUrl}`,
          task: 'mcp-connection-test',
          endpoint: '/api/v1/mcp/test-connection',
          method: 'POST',
          statusCode: 400,
          metadata: {
            serverName: formData.serverName,
            serverType: formData.serverType,
            serverUrl: formData.serverUrl,
            authType: formData.authType,
            errorMessage: testResult.message
          }
        });
        
        toast.error('Connection test failed: ' + testResult.message, { id: 'mcp-test' });
      }
    } catch (error: any) {
      console.error('MCP server creation failed:', error);
      
      // Log error audit
      await logActivity({
        action: 'create',
        resource: 'mcp',
        description: `MCP server creation failed: ${formData.serverName}`,
        details: `Error: ${error?.data?.message || error?.message || 'Unknown error'}`,
        task: 'mcp-server-creation',
        endpoint: '/api/v1/mcp/servers',
        method: 'POST',
        statusCode: 500,
        metadata: {
          serverName: formData.serverName,
          serverType: formData.serverType,
          serverUrl: formData.serverUrl,
          authType: formData.authType,
          errorMessage: error?.data?.message || error?.message || 'Unknown error'
        }
      });
      
      toast.error(
        error?.data?.message || 
        error?.message || 
        'Failed to create MCP server. Please check your configuration.',
        { id: 'mcp-test' }
      );
    }
  };

  return (
    <div className="theme-card-bg rounded-sm p-6 theme-border border theme-shadow">
      <h3 className="text-xl font-semibold theme-text-primary mb-4">MCP Settings</h3>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b theme-border">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config' ? 'border-blue-600 theme-text-primary' : 'border-transparent theme-text-secondary hover:theme-text-primary'
          }`}
          onClick={() => setActiveTab('config')}
        >
          MCP Configuration Panel
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'yaml' ? 'border-blue-600 theme-text-primary' : 'border-transparent theme-text-secondary hover:theme-text-primary'
          }`}
          onClick={() => setActiveTab('yaml')}
        >
          YAML editor
        </button>
      </div>

      <div style={{ display: activeTab === 'config' ? 'block' : 'none' }} className="space-y-6">
          {/* Basic Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium theme-text-primary flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Basic Configuration</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Server Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('serverName', {
                  required: 'Server name is required',
                  minLength: {
                    value: 3,
                    message: 'Server name must be at least 3 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9-_]+$/,
                    message: 'Server name can only contain letters, numbers, hyphens, and underscores'
                  }
                })}
                placeholder="e.g., weather-api-mcp"
                className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.serverName ? 'border-red-500' : ''
                }`}
                disabled={isConnecting}
              />
              {errors.serverName && (
                <p className="mt-1 text-sm text-red-500">{errors.serverName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Server ID <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                {...register('serverId', {
                  validate: (value) => {
                    // Allow empty values
                    if (!value || value.trim() === '') {
                      return true;
                    }
                    
                    // Check format: only lowercase letters, numbers, and hyphens
                    if (!/^[a-z0-9-]+$/.test(value)) {
                      return 'Server ID can only contain lowercase letters, numbers, and hyphens';
                    }
                    
                    // Check length: must be at least 3 characters if provided
                    if (value.length < 3) {
                      return 'Server ID must be at least 3 characters if provided';
                    }
                    
                    return true;
                  }
                })}
                placeholder="Enter custom server ID"
                className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.serverId ? 'border-red-500' : ''
                }`}
                disabled={isConnecting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a custom server ID (3+ characters) or leave empty. Only lowercase letters, numbers, and hyphens allowed.
              </p>
              {errors.serverId && (
                <p className="mt-1 text-sm text-red-500">{errors.serverId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Connection Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('serverType', {
                    required: 'Connection type is required'
                  })}
                  className={`w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none ${
                    errors.serverType ? 'border-red-500' : ''
                  }`}
                  disabled={isConnecting}
                >
                  <option value="">Select connection type</option>
                  <option value="http">HTTP/REST</option>
                  <option value="websocket">WebSocket</option>
                  <option value="stdio">Standard I/O</option>
                  <option value="tcp">TCP Socket</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
              </div>
              {errors.serverType && (
                <p className="mt-1 text-sm text-red-500">{errors.serverType.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                MCP Protocol Version
              </label>
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none"
                  disabled={isConnecting}
                >
                  <option value="1.0">MCP 1.0</option>
                  <option value="0.9">MCP 0.9 (Beta)</option>
                  <option value="0.8">MCP 0.8 (Legacy)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Server URL/Endpoint <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              {...register('serverUrl', {
                required: 'Server URL is required',
                pattern: {
                  value: /^https?:\/\/.+|^wss?:\/\/.+|^stdio$|^tcp:\/\/.+/,
                  message: 'Please enter a valid URL (http/https/ws/wss) or stdio/tcp'
                }
              })}
              placeholder="https://api.example.com/mcp or ws://localhost:8080"
              className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.serverUrl ? 'border-red-500' : ''
              }`}
              disabled={isConnecting}
            />
            {errors.serverUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.serverUrl.message}</p>
            )}
          </div>

        </div>

        {/* Authentication Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium theme-text-primary flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Authentication & Security</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Authentication Type
              </label>
              <div className="relative">
                <select
                  {...register('authType')}
                  className="w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none"
                  disabled={isConnecting}
                >
                  <option value="none">No Authentication</option>
                  <option value="api-key">API Key</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="basic">Basic Auth</option>
                  <option value="custom">Custom Headers</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                API Key / Token
              </label>
              <input
                type="password"
                {...register('apiKey', {
                  validate: (value) => {
                    const authType = watch('authType');
                    if (authType !== 'none' && !value) {
                      return 'API key is required when authentication is enabled';
                    }
                    return true;
                  }
                })}
                placeholder="Enter your API key or token"
                className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.apiKey ? 'border-red-500' : ''
                }`}
                disabled={isConnecting}
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-500">{errors.apiKey.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Connection Timeout (ms)
              </label>
              <input
                type="number"
                {...register('timeout', {
                  required: 'Timeout is required',
                  min: {
                    value: 1000,
                    message: 'Timeout must be at least 1000ms'
                  },
                  max: {
                    value: 300000,
                    message: 'Timeout must not exceed 300000ms'
                  },
                  valueAsNumber: true
                })}
                min="1000"
                max="300000"
                className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.timeout ? 'border-red-500' : ''
                }`}
                disabled={isConnecting}
              />
              {errors.timeout && (
                <p className="mt-1 text-sm text-red-500">{errors.timeout.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Max Retry Attempts
              </label>
              <input
                type="number"
                {...register('retries', {
                  required: 'Retry attempts is required',
                  min: {
                    value: 0,
                    message: 'Retry attempts must be at least 0'
                  },
                  max: {
                    value: 10,
                    message: 'Retry attempts must not exceed 10'
                  },
                  valueAsNumber: true
                })}
                min="0"
                max="10"
                className={`w-full px-3 py-2 theme-border border rounded-sm theme-input-bg theme-input-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.retries ? 'border-red-500' : ''
                }`}
                disabled={isConnecting}
              />
              {errors.retries && (
                <p className="mt-1 text-sm text-red-500">{errors.retries.message}</p>
              )}
            </div>
          </div>

          {/* Connect Button */}
          <div className="flex justify-end pt-4 border-t theme-border">
            <button
              onClick={handleSubmit(handleMCPServerConnect)}
              disabled={!canConnect}
              className={`px-6 py-2 rounded-sm font-medium transition-colors flex items-center space-x-2 ${
                !canConnect
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isConnecting && <AlertCircle className="w-4 h-4 animate-spin" />}
              <span>
                {isCreating ? 'Creating...' : 
                 isTesting ? 'Testing...' : 
                 isConnecting ? 'Connecting...' : 'Connect'}
              </span>
            </button>
          </div>
      </div>
      </div>
      <div style={{ display: activeTab === 'yaml' ? 'block' : 'none' }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium theme-text-primary">Configuration YAML</h4>
              <p className="text-xs theme-text-secondary">Edit advanced MCP server settings using YAML</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleYamlReset}
                className="px-3 py-1.5 text-sm rounded-sm theme-hover-bg theme-text-primary"
              >
                Reset to saved
              </button>
              <button
                onClick={handleYamlSaveToForm}
                className="px-3 py-1.5 text-sm rounded-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Save YAML
              </button>
            </div>
          </div>

          <div className="h-[420px] theme-border border rounded-sm overflow-hidden">
            <Editor
              key={activeTab === 'yaml' ? 'yaml-open' : 'yaml-closed'}
              height="100%"
              defaultLanguage="yaml"
              language="yaml"
              defaultValue={yamlContent}
              onChange={handleYamlChange}
              onMount={handleYamlMount}
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
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs theme-text-secondary">
            <div className="flex items-center gap-3">
              <span>Lines: {yamlContent.split('\n').length}</span>
              <span>•</span>
              <span>Characters: {yamlContent.length}</span>
            </div>
            {yamlErrors.length > 0 ? (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>{yamlErrors.length} error{yamlErrors.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Valid</span>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}