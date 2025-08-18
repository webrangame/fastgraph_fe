'use client';
import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface MCPConfig {
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  description: string;
  authType: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

interface MCPToolsSetupProps {
  config: MCPConfig;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onConfigChange: (field: keyof MCPConfig, value: string | number) => void;
  onConnect: () => void;
}

export default function MCPToolsSetup({ 
  config, 
  connectionStatus, 
  onConfigChange, 
  onConnect 
}: MCPToolsSetupProps) {
  const isConnecting = connectionStatus === 'connecting';
  const canConnect = config.serverName && config.serverUrl && !isConnecting;

  return (
    <div className="theme-card-bg rounded-sm p-6 theme-border border theme-shadow">
      <h3 className="text-xl font-semibold theme-text-primary mb-6">MCP Configuration Panel</h3>
      
      <div className="space-y-6">
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
                value={config.serverName}
                onChange={(e) => onConfigChange('serverName', e.target.value)}
                placeholder="e.g., weather-api-mcp"
                className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isConnecting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Server ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.serverId}
                readOnly
                placeholder="Auto-generated"
                className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Connection Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={config.serverType}
                  onChange={(e) => onConfigChange('serverType', e.target.value)}
                  className="w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none"
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
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                MCP Protocol Version
              </label>
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none"
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
              value={config.serverUrl}
              onChange={(e) => onConfigChange('serverUrl', e.target.value)}
              placeholder="https://api.example.com/mcp or ws://localhost:8080"
              className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isConnecting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => onConfigChange('description', e.target.value)}
              placeholder="Describe what this MCP server provides..."
              rows={3}
              className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical"
              disabled={isConnecting}
            />
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
                  value={config.authType}
                  onChange={(e) => onConfigChange('authType', e.target.value)}
                  className="w-full px-3 py-2 pr-10 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none"
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
                value={config.apiKey}
                onChange={(e) => onConfigChange('apiKey', e.target.value)}
                placeholder="Enter your API key or token"
                className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isConnecting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Connection Timeout (ms)
              </label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => onConfigChange('timeout', parseInt(e.target.value))}
                min="1000"
                max="300000"
                className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isConnecting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Max Retry Attempts
              </label>
              <input
                type="number"
                value={config.retries}
                onChange={(e) => onConfigChange('retries', parseInt(e.target.value))}
                min="0"
                max="10"
                className="w-full px-3 py-2 theme-border border rounded-sm theme-input-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isConnecting}
              />
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <div className="flex justify-end pt-4 border-t theme-border">
          <button
            onClick={onConnect}
            disabled={!canConnect}
            className={`px-6 py-2 rounded-sm font-medium transition-colors flex items-center space-x-2 ${
              !canConnect
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConnecting && <AlertCircle className="w-4 h-4 animate-spin" />}
            <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}