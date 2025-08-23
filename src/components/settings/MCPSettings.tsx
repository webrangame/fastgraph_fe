'use client';
import React from 'react';
import AvailableMCPs from '@/components/settings/mcp/AvailableMCPs';
import MCPToolsSetup from '@/components/settings/mcp/MCPToolsSetup';
import SuccessModal from '@/components/settings/mcp/SuccessModal';
import { useMCPSettings } from '@/hooks/settings/useMCPSettings';

interface MCPSettingsProps {
  activeSubSection: string;
  onSectionChange?: (section: string) => void;
}

export default function MCPSettings({ activeSubSection, onSectionChange }: MCPSettingsProps) {
  const {
    mcpConfig,
    availableMCPs,
    connectionStatus,
    showSuccessModal,
    updateConfig,
    toggleCapability,
    handleConnect,
    handleSuccessModalClose,
    handleViewCapabilities
  } = useMCPSettings();

  const handleViewCapabilitiesClick = () => {
    handleViewCapabilities();
    // Switch to available MCPs view
    if (onSectionChange) {
      onSectionChange('available-mcps');
    }
  };

  const renderContent = () => {
    switch (activeSubSection) {
      case 'available-mcps':
        return (
          <AvailableMCPs 
            capabilities={availableMCPs}
            connectionStatus={connectionStatus}
            onToggleCapability={toggleCapability}
          />
        );
      case 'mcp-tools-setup':
        return (
          <MCPToolsSetup 
            config={mcpConfig}
            connectionStatus={connectionStatus}
            onConfigChange={updateConfig}
            onConnect={handleConnect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onViewCapabilities={handleViewCapabilitiesClick}
      />
    </>
  );
}