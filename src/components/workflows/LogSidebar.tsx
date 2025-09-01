"use client";

import { X, Bot, MessageSquare, Activity, CheckCircle, AlertCircle, XCircle, Trash2, GripVertical, Settings } from "lucide-react";
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
  initialWidth = 400,
  onWidthChange,
  logsOverride
}: LogSidebarProps) {
  const { logs, isConnected, clearLogs } = useLogStreaming(agentId);
  const { theme, isLoaded } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [effectiveLogs]);

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
      const isDark = theme === 'dark';
      switch (type) {
        case 'success':
          return {
            bg: isDark ? 'bg-emerald-950/20' : 'bg-emerald-50',
            border: isDark ? 'border-emerald-800/30' : 'border-emerald-200',
            text: isDark ? 'text-emerald-100' : 'text-emerald-900'
          };
        case 'error':
          return {
            bg: isDark ? 'bg-red-950/20' : 'bg-red-50',
            border: isDark ? 'border-red-800/30' : 'border-red-200',
            text: isDark ? 'text-red-100' : 'text-red-900'
          };
        case 'warning':
          return {
            bg: isDark ? 'bg-amber-950/20' : 'bg-amber-50',
            border: isDark ? 'border-amber-800/30' : 'border-amber-200',
            text: isDark ? 'text-amber-100' : 'text-amber-900'
          };
        default:
          return {
            bg: isDark ? 'bg-blue-950/20' : 'bg-blue-50',
            border: isDark ? 'border-blue-800/30' : 'border-blue-200',
            text: isDark ? 'text-blue-100' : 'text-blue-900'
          };
      }
    };

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

      {/* Agent Details Section */}
      {agentData && (agentData.inputs?.length || agentData.outputs?.length || (agentData.inputValues && Object.keys(agentData.inputValues).length > 0)) && (
        <div className="theme-border p-4 theme-header-bg" style={{ borderBottomWidth: '1px' }}>
          <div className="space-y-3">
            {/* Inputs */}
            {agentData.inputs && agentData.inputs.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-semibold theme-text-primary flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  Inputs:
                </span>
                <div className="flex flex-wrap gap-2">
                  {agentData.inputs.map((input, idx) => (
                    <span 
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-default ${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/40'
                          : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                      }`}
                    >
                      {input}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Input Values */}
            {agentData.inputValues && Object.keys(agentData.inputValues).length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-semibold theme-text-primary flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  Input Values:
                </span>
                <div className="space-y-1 text-xs theme-text-secondary">
                  {Object.entries(agentData.inputValues).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-2">
                      <span className="font-medium theme-text-primary">{key}:</span>
                      <span className="theme-text-secondary break-all text-right">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 theme-bg">
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
          filteredLogs.map((log, index) => {
            const colors = getLogColors(log.type);
            return (
              <div
                key={log.id}
                className={`group relative ${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] animate-in slide-in-from-right-2 fade-in cursor-default`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '400ms',
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5 p-1 rounded-full theme-sidebar-bg shadow-sm">
                    {getLogIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-80`}>
                        {log.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        {log.status && (
                                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                              log.status === 'completed' 
                                ? (theme === 'dark' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                                : log.status === 'failed'
                                ? (theme === 'dark' ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200')
                                : (theme === 'dark' ? 'bg-amber-900/50 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-200')
                            }`}>
                            {log.status === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-1" />}
                            {log.status}
                          </span>
                        )}
                        <span className={`text-xs ${colors.text} opacity-70 font-mono theme-sidebar-bg px-2 py-0.5 rounded-md`}>
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${colors.text} font-medium`}>
                      {log.message}
                    </p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Bar */}
      <div className="theme-border p-3 theme-header-bg flex items-center justify-between text-xs theme-text-secondary" style={{ borderTopWidth: '1px' }}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Auto-scroll enabled</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>{logs.filter(l => l.status === 'pending').length} pending</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono">{width}px</span>
        </div>
      </div>
    </div>
  );
}