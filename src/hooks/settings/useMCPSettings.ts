import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import { useGetMCPServersByUserQuery } from '@/redux/api/mcp/mcpApi';

export interface MCPConfig {
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  authType: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

export interface MCPCapability {
  name: string;
  type: 'Tool' | 'Resource';
  description: string;
  enabled: boolean;
}

export interface MCPServer {
  id: string;
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  protocolVersion: string;
  authType: string;
  timeout: number;
  retries: number;
  connectionStatus: string;
  lastErrorMessage: string;
  lastConnectedAt: string;
  lastDisconnectedAt: string;
  customHeaders: Record<string, any>;
  metadata: Record<string, any>;
  isActive: boolean;
  connectionAttempts: number;
  successfulConnections: number;
  failedConnections: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  connectionUptime: number;
}

export const useMCPSettings = () => {
  const user = useSelector(selectCurrentUser);
  const userId = user?.id || user?.userId || '1'; // Fallback to '1' if user ID not available
  
  // Fetch MCP servers created by the current user
  const { data: mcpServers, isLoading, error } = useGetMCPServersByUserQuery(userId, {
    skip: !userId
  });

  const [mcpConfig, setMcpConfig] = useState<MCPConfig>({
    serverName: '',
    serverId: '',
    serverType: '',
    serverUrl: '',
    authType: 'none',
    apiKey: '',
    timeout: 30000,
    retries: 3
  });

  const [availableMCPs, setAvailableMCPs] = useState<MCPCapability[]>([]);

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Transform MCP servers to capabilities
  const transformServersToCapabilities = (servers: MCPServer[]): MCPCapability[] => {
    return servers.map(server => ({
      name: server.serverName,
      type: 'Tool' as const,
      description: `MCP Server: ${server.serverName} (${server.serverType}) - ${server.connectionStatus}`,
      enabled: server.isActive && server.connectionStatus === 'connected'
    }));
  };

  // Update availableMCPs when mcpServers data changes
  useEffect(() => {
    if (mcpServers && Array.isArray(mcpServers)) {
      const capabilities = transformServersToCapabilities(mcpServers);
      setAvailableMCPs(capabilities);
    }
  }, [mcpServers]);

  const updateConfig = (field: keyof MCPConfig, value: string | number) => {
    setMcpConfig(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'serverName' && !prev.serverId ? { 
        serverId: (value as string).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') 
      } : {})
    }));
  };

  const toggleCapability = (index: number) => {
    setAvailableMCPs(prev => prev.map((cap, i) => 
      i === index ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const handleConnect = async () => {
    if (!mcpConfig.serverName || !mcpConfig.serverUrl) {
      alert('Please fill in required fields');
      return;
    }

    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowSuccessModal(true);
      
      // Add new capabilities based on connection
      setAvailableMCPs(prev => [
        ...prev,
        {
          name: 'custom_tool',
          type: 'Tool',
          description: `Custom tool from ${mcpConfig.serverName}`,
          enabled: true
        }
      ]);
    }, 2000);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };
  
  const handleViewCapabilities = () => {
    setShowSuccessModal(false);
    // This could trigger a callback to parent component to change active section
  };

  return {
    mcpConfig,
    availableMCPs,
    connectionStatus,
    showSuccessModal,
    updateConfig,
    toggleCapability,
    handleConnect,
    handleSuccessModalClose,
    handleViewCapabilities,
    // API states
    isLoadingMCPServers: isLoading,
    mcpServersError: error,
    mcpServers
  };
};