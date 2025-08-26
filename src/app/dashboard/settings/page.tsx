'use client';
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import MCPSettings from '@/components/settings/MCPSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import AdvancedSettings from '@/components/settings/AdvancedSettings';
import APIKeysSettings from '@/components/settings/APIKeysSettings';

export default function SettingsPage() {
  // Set 'general' as the default active section instead of null
  const [activeSection, setActiveSection] = useState<string | null>('general');

  const renderContent = () => {
    switch (activeSection) {
      case 'available-mcps':
      case 'mcp-tools-setup':
        return (
          <MCPSettings 
            activeSubSection={activeSection} 
            onSectionChange={setActiveSection}
          />
        );
      case 'general':
        return <GeneralSettings />;
      case 'api-keys':
        return <APIKeysSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return (
          <div className="theme-card-bg rounded-lg p-8 text-center theme-border border theme-shadow">
            <Settings className="w-16 h-16 theme-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              Select a Setting Category
            </h3>
            <p className="theme-text-secondary">
              Choose a category from the sidebar to configure your application settings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="theme-bg min-h-screen theme-text-primary transition-colors duration-300">
      {/* Desktop Header */}
      <header className="hidden lg:block theme-header-bg px-6 py-4 theme-border theme-shadow border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="theme-text-secondary text-sm">Configure your application settings here.</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <SettingsSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            <div className="lg:w-2/3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}