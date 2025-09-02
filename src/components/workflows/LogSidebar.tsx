"use client";

import { X, Bot, MessageSquare, Activity, Trash2, GripVertical, Settings, FileText, Terminal, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLogStreaming } from "@/hooks/workflows/useLogStreaming";
import { useTheme } from "@/components/ThemeProvider"; // Theme provider import

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
    inputValues?: Record<string, any>;
    agentInput?: string;
  };
  initialWidth?: number;
  onWidthChange?: (width: number) => void;
  logsOverride?: Array<{
    id?: string;
    message: string;
    timestamp?: number | string;
    type?: 'info' | 'warning' | 'error' | 'success';
    status?: 'pending' | 'completed' | 'failed';
  }>;
  executionResults?: {
    [agentName: string]: {
      result?: any;
      success?: boolean;
      outputs?: Record<string, any>;
      [key: string]: any;
    };
  };
}

interface LogMessage {
  id: string;
  message: string;
  timestamp: number | string;
  type: 'info' | 'warning' | 'error' | 'success';
  status?: 'pending' | 'completed' | 'failed';
}

export function LogSidebar({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName, 
  agentRole,
  agentData,
  initialWidth = 450,
  onWidthChange,
  logsOverride,
  executionResults
}: LogSidebarProps) {
  const { logs, isConnected, clearLogs } = useLogStreaming(agentId);
  const { theme, isLoaded } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<'input' | 'logs' | 'output'>('logs');
  
  // State for sidebar width with localStorage persistence
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logSidebarWidth');
      return saved ? parseInt(saved, 10) : initialWidth;
    }
    return initialWidth;
  });
  
  // State for tracking resize activity
  const [isActivelyResizing, setIsActivelyResizing] = useState(false);
  
  // Constraints for resizing
  const MIN_WIDTH = 300;
  const MAX_WIDTH = 800;

  // Debounced localStorage save to avoid excessive writes during resize
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce localStorage writes
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('logSidebarWidth', width.toString());
      }, 300);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [width]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Normalize logs when override is provided
  const effectiveLogs: LogMessage[] = (logsOverride && logsOverride.length > 0)
    ? logsOverride.map((l, idx) => ({
        id: l.id || `${agentId}-${idx}`,
        message: l.message,
        timestamp: l.timestamp ?? Date.now(),
        type: (l.type as LogMessage['type']) || 'info',
        status: l.status,
      }))
    : logs;

  // Always auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'logs') {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [effectiveLogs, activeTab]);

  // Auto-switch to input tab if there's agent input data available
  useEffect(() => {
    if (agentData && (agentData.agentInput || (agentData.inputValues && Object.keys(agentData.inputValues).length > 0))) {
      setActiveTab('input');
    }
  }, [agentData]);

  // Extract agent result from execution results
  const agentResult = executionResults?.[agentName]?.result;
  const agentSuccess = executionResults?.[agentName]?.success;
  const agentOutputs = executionResults?.[agentName]?.outputs;

  // Handle resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    setIsActivelyResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // Add active state to sidebar for visual feedback
    if (sidebarRef.current) {
      sidebarRef.current.style.transition = 'none';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    // Cancel previous animation frame to avoid stacking
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth performance
    animationFrameRef.current = requestAnimationFrame(() => {
      const newWidth = window.innerWidth - e.clientX;
      const constrainedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      
      setWidth(constrainedWidth);
      onWidthChange?.(constrainedWidth);
    });
  }, [MIN_WIDTH, MAX_WIDTH, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    setIsActivelyResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Restore transition for smooth width changes when not resizing
    if (sidebarRef.current) {
      sidebarRef.current.style.transition = 'transform 300ms ease-in-out';
    }
  }, []);

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

  // Handle mouse events for resizing
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // Use all logs since we removed filtering
  const filteredLogs = effectiveLogs;

  const formatTime = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : undefined;
    if (!date) return String(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div 
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full theme-sidebar-bg theme-border shadow-2xl z-[10000] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} 
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/30 transition-all duration-150 group z-10"
        onMouseDown={handleMouseDown}
        style={{
          background: isActivelyResizing ? 'rgba(59, 130, 246, 0.3)' : undefined
        }}
      >
        {/* Visual indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 theme-border group-hover:bg-blue-500 transition-colors duration-150" />
        
        {/* Grip icon */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 scale-90 group-hover:scale-100">
          <GripVertical className="w-3 h-3 text-blue-500 drop-shadow-sm" />
        </div>
        
        {/* Hover area extension */}
        <div className="absolute -left-1 -right-1 top-0 bottom-0" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 theme-border shrink-0 theme-header-bg" style={{ borderBottomWidth: '1px' }}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 theme-sidebar-bg ${
              isConnected ? 'bg-emerald-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h2 className="text-lg font-bold theme-text-primary flex items-center space-x-2">
              <span>{agentName}</span>
                              <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isConnected 
                    ? (theme === 'dark' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
                    : (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800')
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </h2>
            <p className="text-xs theme-text-secondary">
              {agentRole} • {filteredLogs.length} logs
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={clearLogs}
            className="p-2 theme-text-secondary hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary theme-hover-bg rounded-lg transition-all duration-200 group"
            title="Close sidebar"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="theme-border theme-header-bg" style={{ borderBottomWidth: '1px' }}>
        <div className="flex">
          {/* Agent Input Tab */}
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              !agentData || (!agentData.agentInput && (!agentData.inputValues || Object.keys(agentData.inputValues).length === 0))
                ? 'text-gray-400 cursor-not-allowed'
                : activeTab === 'input'
                ? 'theme-text-primary bg-blue-500/10 border-b-2 border-blue-500'
                : 'theme-text-secondary hover:theme-text-primary theme-hover-bg'
            }`}
            disabled={!agentData || (!agentData.agentInput && (!agentData.inputValues || Object.keys(agentData.inputValues).length === 0))}
          >
            <FileText className="w-4 h-4 mr-2" />
            Agent Input
            {agentData && (agentData.agentInput || (agentData.inputValues && Object.keys(agentData.inputValues).length > 0)) && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
          
          {/* Logs Tab */}
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              activeTab === 'logs'
                ? 'theme-text-primary bg-blue-500/10 border-b-2 border-blue-500'
                : 'theme-text-secondary hover:theme-text-primary theme-hover-bg'
            }`}
          >
            <Terminal className="w-4 h-4 mr-2" />
            Logs ({filteredLogs.length})
            {filteredLogs.length > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>
          
          {/* Output Tab */}
          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              !agentResult && !agentOutputs
                ? 'text-gray-400 cursor-not-allowed'
                : activeTab === 'output'
                ? 'theme-text-primary bg-blue-500/10 border-b-2 border-blue-500'
                : 'theme-text-secondary hover:theme-text-primary theme-hover-bg'
            }`}
            disabled={!agentResult && !agentOutputs}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Output
            {(agentResult || agentOutputs) && (
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${agentSuccess ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'input' ? (
          /* Agent Input Tab Content */
          <div className="p-4 theme-bg">
            {agentData && ((agentData.inputValues && Object.keys(agentData.inputValues).length > 0) || agentData.agentInput) ? (
              <div className="space-y-4">
                {/* Input Values */}
                {agentData.inputValues && Object.keys(agentData.inputValues).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold theme-text-primary flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Input Values
                    </h3>
                    <div className="theme-card-bg rounded-lg p-3 border theme-border">
                      <div className="space-y-2 text-sm">
                        {Object.entries(agentData.inputValues).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="font-medium theme-text-primary">{key}:</div>
                            <div className="theme-text-secondary bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs font-mono whitespace-pre-wrap break-words">
                              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Input (LLM prompt) */}
                {agentData.agentInput && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold theme-text-primary flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Agent Prompt
                    </h3>
                    <div className="theme-card-bg rounded-lg p-3 border theme-border">
                      <div className="text-sm theme-text-secondary whitespace-pre-wrap break-words font-mono bg-gray-50 dark:bg-gray-800 rounded p-3">
                        {agentData.agentInput}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 theme-card-bg rounded-full mb-4">
                  <FileText className="w-12 h-12 theme-text-muted" />
                </div>
                <h3 className="text-base font-medium theme-text-primary mb-2">
                  No agent input data
                </h3>
                <p className="theme-text-secondary text-sm max-w-xs">
                  Agent input and configuration will appear here when available
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'output' ? (
          /* Agent Output Tab Content */
          <div className="p-4 theme-bg">
            {(agentResult || agentOutputs) ? (
              <div className="space-y-4">
                {/* Execution Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold theme-text-primary flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Execution Status
                  </h3>
                  <div className="theme-card-bg rounded-lg p-3 border theme-border">
                    <div className={`text-sm font-medium flex items-center ${
                      agentSuccess ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        agentSuccess ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      {agentSuccess ? 'Completed Successfully' : 'Completed with Issues'}
                    </div>
                  </div>
                </div>

                {/* Final Result */}
                {agentResult && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold theme-text-primary flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Final Result
                    </h3>
                    <div className="theme-card-bg rounded-lg p-3 border theme-border">
                      <div className="text-sm theme-text-secondary whitespace-pre-wrap break-words font-mono bg-gray-50 dark:bg-gray-800 rounded p-3 max-h-96 overflow-y-auto">
                        {typeof agentResult === 'string' ? agentResult : JSON.stringify(agentResult, null, 2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Outputs */}
                {/* {agentOutputs && Object.keys(agentOutputs).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold theme-text-primary flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Agent Outputs
                    </h3>
                    <div className="theme-card-bg rounded-lg p-3 border theme-border">
                      <div className="space-y-3 text-sm">
                        {Object.entries(agentOutputs).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="font-medium theme-text-primary border-b theme-border pb-1">{key}:</div>
                            <div className="theme-text-secondary bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 theme-card-bg rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 theme-text-muted" />
                </div>
                <h3 className="text-base font-medium theme-text-primary mb-2">
                  No output data yet
                </h3>
                <p className="theme-text-secondary text-sm max-w-xs">
                  Agent output and final results will appear here when execution is complete
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Logs Tab Content */
          <div className="p-3 theme-bg font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 theme-card-bg rounded-full mb-4">
                  <MessageSquare className="w-12 h-12 theme-text-muted" />
                </div>
                <h3 className="text-base font-medium theme-text-primary mb-2">
                  No logs yet
                </h3>
                <p className="theme-text-secondary text-sm max-w-xs">
                  Logs will appear here as the agent processes tasks
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log) => {
                  const typeColor =
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'success' ? 'text-emerald-400' :
                    'text-blue-400';
                  return (
                    <div key={log.id} className="whitespace-pre-wrap break-words">
                      <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>{' '}
                      <span className={`${typeColor} uppercase`}>{log.type}</span>{' '}
                      <span className="text-gray-500">-</span>{' '}
                      <span className="theme-text-primary">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="theme-border p-3 theme-header-bg flex items-center justify-between text-xs theme-text-secondary" style={{ borderTopWidth: '1px' }}>
        <div className="flex items-center space-x-4">
          {activeTab === 'logs' ? (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Auto-scroll enabled</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>{logs.filter(l => l.status === 'pending').length} pending</span>
              </div>
            </>
          ) : activeTab === 'output' ? (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Agent output & final results</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>Agent input & configuration</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="capitalize font-medium">{activeTab}</span>
          <span className="text-gray-400">•</span>
          <span className="font-mono">{width}px</span>
        </div>
      </div>
    </div>
  );
}