import { useState } from 'react';

export interface MCPConfig {
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  description: string;
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

export const useMCPSettings = () => {
  const [mcpConfig, setMcpConfig] = useState<MCPConfig>({
    serverName: '',
    serverId: '',
    serverType: '',
    serverUrl: '',
    description: '',
    authType: 'none',
    apiKey: '',
    timeout: 30000,
    retries: 3
  });

  const [availableMCPs, setAvailableMCPs] = useState<MCPCapability[]>([
    {
      name: 'get_weather',
      type: 'Tool',
      description: 'Get current weather information for a location',
      enabled: true
    },
    {
      name: 'search_web',
      type: 'Tool', 
      description: 'Search the web for information',
      enabled: true
    },
    {
      name: 'user_context',
      type: 'Resource',
      description: 'Access to user context and preferences',
      enabled: false
    }
  ]);

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const updateConfig = (field: keyof MCPConfig, value: string | number) => {
    setMcpConfig(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'serverName' ? { 
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
    handleViewCapabilities
  };
};