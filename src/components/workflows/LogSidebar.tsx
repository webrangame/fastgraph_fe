"use client";

import { X, Bot, MessageSquare, Activity, CheckCircle, AlertCircle, XCircle, Trash2, GripVertical, Settings, Play, Pause } from "lucide-react";
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
  };
  initialWidth?: number;
  onWidthChange?: (width: number) => void;
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
  agentData,
  initialWidth = 400,
  onWidthChange
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

  // Always auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [logs]);

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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
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
      {agentData && (agentData.inputs?.length || agentData.outputs?.length) && (
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

// Mock theme context for demonstration
const useMockTheme = () => ({ isDark: false });

// Mock log streaming hook for demo
const useMockLogStreaming = (agentId: string) => {
  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: '1',
      message: 'Agent initialized successfully',
      timestamp: Date.now() - 30000,
      type: 'success' as const,
      status: 'completed' as const
    },
    {
      id: '2',
      message: 'Processing user input: "Generate a marketing strategy"',
      timestamp: Date.now() - 25000,
      type: 'info' as const,
      status: 'completed' as const
    },
    {
      id: '3',
      message: 'Analyzing market trends and competitor data',
      timestamp: Date.now() - 20000,
      type: 'info' as const,
      status: 'pending' as const
    },
    {
      id: '4',
      message: 'Warning: API rate limit approaching (80% used)',
      timestamp: Date.now() - 15000,
      type: 'warning' as const,
      status: 'completed' as const
    },
    {
      id: '5',
      message: 'Successfully generated marketing insights',
      timestamp: Date.now() - 10000,
      type: 'success' as const,
      status: 'completed' as const
    },
    {
      id: '6',
      message: 'Error: Unable to access external database',
      timestamp: Date.now() - 5000,
      type: 'error' as const,
      status: 'failed' as const
    }
  ]);

  const [isConnected, setIsConnected] = useState(true);

  const clearLogs = () => setLogs([]);

  // Add a new log every 5 seconds for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogMessage = {
        id: Date.now().toString(),
        message: `New log entry at ${new Date().toLocaleTimeString()}`,
        timestamp: Date.now(),
        type: (['info', 'success', 'warning', 'error'] as const)[Math.floor(Math.random() * 4)],
        status: (['pending', 'completed', 'failed'] as const)[Math.floor(Math.random() * 3)]
      };
      setLogs(prev => [...prev, newLog]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { logs, isConnected, clearLogs };
};

// Light Mode Demo Component
export function LogSidebarLightDemo() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(400);

  const mockAgentData = {
    inputs: ['user_query', 'market_data', 'competitor_info'],
    outputs: ['strategy_report', 'recommendations'],
    capabilities: ['analysis', 'generation', 'research']
  };

  // Create a light mode version of LogSidebar with mock data
  const LightModeLogSidebar = ({ 
    isOpen, 
    onClose, 
    agentId, 
    agentName, 
    agentRole,
    agentData,
    initialWidth = 400,
    onWidthChange
  }: LogSidebarProps) => {
    const { logs, isConnected, clearLogs } = useMockLogStreaming(agentId);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    
    const [width, setWidth] = useState(initialWidth);
    const [isActivelyResizing, setIsActivelyResizing] = useState(false);
    
    const MIN_WIDTH = 300;
    const MAX_WIDTH = 800;

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, [logs]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      setIsActivelyResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      if (sidebarRef.current) {
        sidebarRef.current.style.transition = 'none';
      }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (sidebarRef.current) {
        sidebarRef.current.style.transition = 'transform 300ms ease-in-out';
      }
    }, []);

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
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-900'
          };
        case 'error':
          return {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900'
          };
        case 'warning':
          return {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-900'
          };
        default:
          return {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-900'
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
      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 transition-all duration-150 group z-10"
          onMouseDown={handleMouseDown}
          style={{
            background: isActivelyResizing ? 'rgba(59, 130, 246, 0.2)' : undefined
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 group-hover:bg-blue-400 transition-colors duration-150" />
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 scale-90 group-hover:scale-100">
            <GripVertical className="w-3 h-3 text-blue-500 drop-shadow-sm" />
          </div>
          
          <div className="absolute -left-1 -right-1 top-0 bottom-0" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? 'bg-emerald-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <span>{agentName}</span>
                <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  {isConnected ? 'Live' : 'Offline'}
                </div>
              </h2>
              <p className="text-xs text-gray-600">
                {agentRole} • {filteredLogs.length} logs
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={clearLogs}
              className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
              title="Close sidebar"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Agent Details Section */}
        {agentData && (agentData.inputs?.length || agentData.outputs?.length) && (
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="space-y-3">
              {agentData.inputs && agentData.inputs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <Settings className="w-3 h-3 mr-1" />
                    Inputs:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {agentData.inputs.map((input, idx) => (
                      <span 
                        key={idx}
                        className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors duration-200 cursor-default"
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-800 mb-2">
                No logs yet
              </h3>
              <p className="text-gray-600 text-sm max-w-xs">
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
                    <div className="flex-shrink-0 mt-0.5 p-1 rounded-full bg-white shadow-sm">
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
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : log.status === 'failed'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {log.status === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-1" />}
                              {log.status}
                            </span>
                          )}
                          <span className={`text-xs ${colors.text} opacity-70 font-mono bg-white px-2 py-0.5 rounded-md`}>
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
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
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
  };

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      {/* Main Content Area */}
      <div className="h-full p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              LogSidebar Light Mode Demo
            </h1>
            <p className="text-gray-600 mb-6">
              Interactive demonstration of the LogSidebar component with light theme styling
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isOpen 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isOpen ? <X className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isOpen ? 'Close Sidebar' : 'Open Sidebar'}</span>
              </button>
              
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
                Width: <span className="font-mono font-bold">{width}px</span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <GripVertical className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Resizable</h3>
              <p className="text-gray-600 text-sm">Drag the left edge to resize the sidebar from 300px to 800px</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Live Updates</h3>
              <p className="text-gray-600 text-sm">Real-time log streaming with auto-scroll and status indicators</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Interactive</h3>
              <p className="text-gray-600 text-sm">Clear logs, close sidebar, and hover effects throughout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Component */}
      <LightModeLogSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        agentId="demo-agent"
        agentName="Marketing Assistant"
        agentRole="Content Strategy AI"
        agentData={mockAgentData}
        initialWidth={width}
        onWidthChange={setWidth}
      />
      
      {/* Backdrop when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Default export for demo
export default LogSidebarLightDemo;