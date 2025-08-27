'use client';
import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface MCPCapability {
  name: string;
  type: 'Tool' | 'Resource';
  description: string;
  enabled: boolean;
}

interface AvailableMCPsProps {
  capabilities: MCPCapability[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onToggleCapability: (index: number) => void;
}

export default function AvailableMCPs({ 
  capabilities, 
  connectionStatus, 
  onToggleCapability 
}: AvailableMCPsProps) {
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

  return (
    <div className="theme-card-bg rounded-lg p-6 theme-border border theme-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold theme-text-primary">Available MCPs</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${statusConfig.className}`}>
          {statusConfig.icon}
          <span>{statusConfig.text}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {capabilities.map((capability, index) => (
          <div key={capability.name} className="theme-border border rounded-lg p-4 theme-hover-bg transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-semibold theme-text-primary">{capability.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  capability.type === 'Tool' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {capability.type}
                </span>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={capability.enabled}
                  onChange={() => onToggleCapability(index)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  capability.enabled 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 theme-hover-bg'
                }`}>
                  {capability.enabled && <Check className="w-3 h-3 text-white" />}
                </div>
              </label>
            </div>
            <p className="theme-text-secondary text-sm">{capability.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}