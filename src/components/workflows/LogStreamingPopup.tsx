"use client";

import { X, Bot, MessageSquare, Activity, CheckCircle, AlertCircle, XCircle, Trash2, Maximize2 } from "lucide-react";
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
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Always auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [logs, isMinimized]);

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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full transition-all duration-300 ${
        isMinimized ? 'max-h-20' : 'max-h-[85vh]'
      } overflow-hidden flex flex-col`}>
        
        {/* Modern Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                isConnected ? 'bg-emerald-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <span>{agentName}</span>
                <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
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
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={clearLogs}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Modern Log Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No logs yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Logs will appear here as the agent processes tasks
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  const colors = getLogColors(log.type);
                  return (
                    <div
                      key={log.id}
                      className={`group relative ${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-sm animate-in slide-in-from-left-4 fade-in`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationDuration: '400ms',
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getLogIcon(log.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text} opacity-70`}>
                              {log.type}
                            </span>
                            <div className="flex items-center space-x-2">
                              {log.status && (
                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded-full ${
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
          </>
        )}
      </div>
    </div>
  );
}