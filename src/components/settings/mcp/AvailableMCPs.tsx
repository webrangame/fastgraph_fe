'use client';
import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Loader2, Server } from 'lucide-react';
import { useGetMCPServersByStatusQuery } from '@/redux/api/mcp/mcpApi';

interface AvailableMCP {
  name: string;
  type: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

interface AvailableMCPsProps {
  capabilities?: any[];
  connectionStatus?: 'disconnected' | 'connecting' | 'connected';
  onToggleCapability?: (index: number) => void;
}

export default function AvailableMCPs({ 
  capabilities, 
  connectionStatus, 
  onToggleCapability 
}: AvailableMCPsProps) {
  const [availableMCPs, setAvailableMCPs] = useState<AvailableMCP[]>([]);
  const { data: savedConfigs, isLoading } = useGetMCPServersByStatusQuery('active');

  // Parse MCP servers from YAML/JSON content
  const parseMCPServers = (content: string): AvailableMCP[] => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.mcpServers) {
        const servers: AvailableMCP[] = [];
        Object.entries(parsed.mcpServers).forEach(([name, config]: [string, any]) => {
          servers.push({
            name,
            type: config.type || 'stdio',
            command: config.command,
            args: config.args,
            env: config.env,
            url: config.url
          });
        });
        return servers;
      }
    } catch (error) {
      console.error('Failed to parse MCP servers:', error);
    }
    return [];
  };

  // Update available MCPs when config is loaded
  useEffect(() => {
    if (savedConfigs && savedConfigs.length > 0 && !isLoading) {
      const savedConfig = savedConfigs[0];
      if (savedConfig && savedConfig.yamlContent) {
        const mcpServers = parseMCPServers(savedConfig.yamlContent);
        setAvailableMCPs(mcpServers);
      }
    }
  }, [savedConfigs, isLoading]);
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          className: 'bg-green-100 text-green-800',
          icon: <Check className="w-4 h-4" />,
          text: 'Connected'
        };
      case 'connecting':
        return {
          className: 'bg-yellow-100 text-yellow-800',
          icon: <AlertCircle className="w-4 h-4 animate-spin" />,
          text: 'Connecting'
        };
      default:
        return {
          className: 'bg-red-100 text-red-800',
          icon: <X className="w-4 h-4" />,
          text: 'Disconnected'
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (isLoading) {
    return (
      <div className="theme-card-bg rounded-lg p-6 theme-border border theme-shadow">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin theme-text-primary" />
          <span className="ml-3 theme-text-secondary">Loading MCP servers...</span>
        </div>
      </div>
    );
  }

  if (availableMCPs.length === 0) {
    return (
      <div className="theme-card-bg rounded-lg p-6 theme-border border theme-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold theme-text-primary">Available MCPs</h3>
        </div>
        <div className="text-center py-12">
          <Server className="w-12 h-12 mx-auto theme-text-muted mb-4" />
          <p className="theme-text-secondary">No MCP servers configured yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card-bg rounded-lg p-6 theme-border border theme-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold theme-text-primary flex items-center gap-2">
          <Server className="w-5 h-5" />
          Available MCPs ({availableMCPs.length})
        </h3>
        {connectionStatus && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${statusConfig.className}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {availableMCPs.map((mcp, index) => (
          <div key={mcp.name} className="theme-border border rounded-lg p-4 theme-hover-bg transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-semibold theme-text-primary capitalize">{mcp.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  mcp.type === 'stdio' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {mcp.type}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 mt-3">
              {mcp.command && (
                <div className="text-sm theme-text-secondary">
                  <span className="font-medium">Command:</span> <code className="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{mcp.command}</code>
                  {mcp.args && mcp.args.length > 0 && (
                    <span className="ml-2">
                      {mcp.args.map((arg, i) => (
                        <span key={i}><code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{arg}</code> </span>
                      ))}
                    </span>
                  )}
                </div>
              )}
              {mcp.url && (
                <div className="text-sm theme-text-secondary">
                  <span className="font-medium">URL:</span> <code className="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded break-all">{mcp.url}</code>
                </div>
              )}
              {mcp.env && Object.keys(mcp.env).length > 0 && (
                <div className="text-sm theme-text-secondary">
                  <span className="font-medium">Environment Variables:</span> <span className="ml-1 text-xs">{Object.keys(mcp.env).length} configured</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}