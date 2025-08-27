"use client";

import { X, Bot, Circle, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLogStreaming } from "@/hooks/workflows/useLogStreaming";

interface LogStreamingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  agentRole: string;
}

interface LogMessage {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  status?: 'pending' | 'completed' | 'failed';
}

export function LogStreamingPopup({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  agentRole 
}: LogStreamingPopupProps) {
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

  const getMessageIcon = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return <Circle className="w-3 h-3 text-green-500 fill-current" />;
      case 'error':
        return <Circle className="w-3 h-3 text-red-500 fill-current" />;
      case 'warning':
        return <Circle className="w-3 h-3 text-yellow-500 fill-current" />;
      default:
        return <Circle className="w-3 h-3 text-blue-500 fill-current" />;
    }
  };

  const getMessageColor = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'theme-text-primary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="theme-card-bg rounded-xl shadow-2xl border-2 theme-border max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b theme-border shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold theme-text-primary flex items-center space-x-2">
                <span>{agentName}</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              </h2>
              <p className="theme-text-secondary text-sm">
                {agentRole} • {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 text-sm theme-text-muted hover:theme-text-primary border theme-border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 theme-text-muted" />
            </button>
          </div>
        </div>

        {/* Connection Status Bar */}
        <div className={`px-4 py-2 text-xs border-b theme-border ${
          isConnected 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-green-500 animate-ping' : 'bg-red-500'
            }`} />
            <span>
              {isConnected ? 'Live log streaming active' : 'Connection lost - attempting to reconnect...'}
            </span>
          </div>
        </div>

        {/* Chat-style Log Container */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-gray-900/50"
        >
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageSquare className="w-12 h-12 theme-text-muted mb-4" />
              <h3 className="text-sm font-medium theme-text-primary mb-2">No logs yet</h3>
              <p className="text-xs theme-text-muted">
                Logs will appear here in real-time when the agent starts processing
              </p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id || index}
                className="flex items-start space-x-3 p-3 theme-card-bg rounded-lg border theme-border hover:shadow-sm transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getMessageIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${getMessageColor(log.type)}`}>
                      {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-xs theme-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm theme-text-secondary leading-relaxed break-words">
                    {log.message}
                  </p>
                  {log.status && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        log.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : log.status === 'failed'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer with message count */}
        {logs.length > 0 && (
          <div className="px-4 py-3 border-t theme-border shrink-0 bg-gray-50/30 dark:bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div className="text-xs theme-text-muted">
                {logs.length} message{logs.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Auto-scroll ON
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}