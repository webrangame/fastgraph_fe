"use client";

import { X, Bot, MessageSquare, Activity, CheckCircle, AlertCircle, XCircle, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLogStreaming } from "@/hooks/workflows/useLogStreaming";

interface LogSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  agentRole: string;
  agentData?: {
    inputs?: string[];
    outputs?: string[];
    capabilities?: string[];
  };
}

interface LogMessage {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  status?: 'pending' | 'completed' | 'failed';
}

export function LogSidebar({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  agentRole,
  agentData
}: LogSidebarProps) {
  const { logs, isConnected, clearLogs } = useLogStreaming(agentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Always auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [logs]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Use all logs since we removed filtering
  const filteredLogs = logs;

  const getLogIcon = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColors = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-800/30',
          text: 'text-emerald-900 dark:text-emerald-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800/30',
          text: 'text-red-900 dark:text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800/30',
          text: 'text-amber-900 dark:text-amber-100'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800/30',
          text: 'text-blue-900 dark:text-blue-100'
        };
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-[10000] transition-transform duration-300 ease-in-out flex flex-col ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ width: '400px' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
              isConnected ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{agentName}</span>
              <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {agentRole} • {filteredLogs.length} logs
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={clearLogs}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agent Details Section */}
      {agentData && (agentData.inputs?.length || agentData.outputs?.length) && (
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="space-y-3">
            {/* Inputs */}
            {agentData.inputs && agentData.inputs.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Inputs:</span>
                <div className="flex flex-wrap gap-2">
                  {agentData.inputs.map((input, idx) => (
                    <span 
                      key={idx}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                    >
                      {input}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              No logs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
              Logs will appear here as the agent processes tasks
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const colors = getLogColors(log.type);
            return (
              <div
                key={log.id}
                className={`group relative ${colors.bg} ${colors.border} border rounded-lg p-3 transition-all duration-200 hover:shadow-sm animate-in slide-in-from-right-2 fade-in`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '400ms',
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text} opacity-70`}>
                        {log.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        {log.status && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded-full ${
                            log.status === 'completed' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                              : log.status === 'failed'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          }`}>
                            {log.status}
                          </span>
                        )}
                        <span className={`text-xs ${colors.text} opacity-60`}>
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${colors.text}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}