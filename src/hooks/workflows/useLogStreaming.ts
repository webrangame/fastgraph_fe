"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface LogMessage {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  status?: 'pending' | 'completed' | 'failed';
}

interface UseLogStreamingReturn {
  logs: LogMessage[];
  isConnected: boolean;
  addLog: (message: string, type?: LogMessage['type'], status?: LogMessage['status']) => void;
  clearLogs: () => void;
}

// Simulate different types of log messages for demo
const SAMPLE_LOGS = [
  { message: "Initializing agent connection...", type: 'info' as const, status: 'pending' as const },
  { message: "Loading agent configuration", type: 'info' as const },
  { message: "Agent successfully connected", type: 'success' as const, status: 'completed' as const },
  { message: "Processing user request", type: 'info' as const, status: 'pending' as const },
  { message: "Analyzing input parameters", type: 'info' as const },
  { message: "Executing primary workflow", type: 'info' as const },
  { message: "Intermediate result generated", type: 'success' as const },
  { message: "Validating output format", type: 'info' as const },
  { message: "Task completed successfully", type: 'success' as const, status: 'completed' as const },
  { message: "Memory cache updated", type: 'info' as const },
  { message: "Connection timeout detected", type: 'warning' as const },
  { message: "Retrying connection...", type: 'info' as const, status: 'pending' as const },
  { message: "Connection restored", type: 'success' as const, status: 'completed' as const },
  { message: "Processing next batch", type: 'info' as const },
  { message: "Rate limit approaching", type: 'warning' as const },
  { message: "All tasks completed successfully", type: 'success' as const, status: 'completed' as const }
];

export function useLogStreaming(agentId: string): UseLogStreamingReturn {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logIdCounterRef = useRef(0);

  // Simulate streaming connection
  useEffect(() => {
    if (!agentId) return;

    // Reset state for new agent
    setLogs([]);
    setCurrentLogIndex(0);
    logIdCounterRef.current = 0;
    setIsConnected(false);

    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      
      // Start streaming logs
      intervalRef.current = setInterval(() => {
        setCurrentLogIndex(prevIndex => {
          if (prevIndex < SAMPLE_LOGS.length) {
            const sampleLog = SAMPLE_LOGS[prevIndex];
            logIdCounterRef.current += 1;
            const newLog: LogMessage = {
              id: `${agentId}-log-${logIdCounterRef.current}-${Date.now()}`,
              message: sampleLog.message,
              timestamp: Date.now(),
              type: sampleLog.type,
              status: sampleLog.status
            };

            setLogs(prevLogs => [...prevLogs, newLog]);
            return prevIndex + 1;
          } else {
            // Stop streaming when all sample logs are added
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return prevIndex;
          }
        });
      }, Math.random() * 2000 + 1000); // Random interval between 1-3 seconds
    }, 800);

    return () => {
      clearTimeout(connectTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsConnected(false);
      setCurrentLogIndex(0);
    };
  }, [agentId]);

  // Simulate occasional connection issues
  useEffect(() => {
    if (!isConnected) return;

    const connectionIssueTimeout = setTimeout(() => {
      if (Math.random() < 0.1) { // 10% chance of connection issue
        setIsConnected(false);
        
        // Reconnect after 2-4 seconds
        setTimeout(() => {
          setIsConnected(true);
        }, Math.random() * 2000 + 2000);
      }
    }, Math.random() * 10000 + 5000); // Random between 5-15 seconds

    return () => clearTimeout(connectionIssueTimeout);
  }, [isConnected, logs.length]);

  const addLog = useCallback((
    message: string, 
    type: LogMessage['type'] = 'info', 
    status?: LogMessage['status']
  ) => {
    logIdCounterRef.current += 1;
    const newLog: LogMessage = {
      id: `${agentId}-manual-log-${logIdCounterRef.current}-${Date.now()}`,
      message,
      timestamp: Date.now(),
      type,
      status
    };

    setLogs(prevLogs => [...prevLogs, newLog]);
  }, [agentId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setCurrentLogIndex(0);
    logIdCounterRef.current = 0;
  }, []);

  return {
    logs,
    isConnected,
    addLog,
    clearLogs
  };
}