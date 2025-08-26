'use client';
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Settings, Zap, Server, Key } from 'lucide-react';

interface SettingsSidebarProps {
  activeSection: string | null;
  onSectionChange: (section: string | null) => void;
}

const settingsSections = [
  {
    id: 'general',
    title: 'General Settings',
    icon: Settings,
    subSections: []
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    icon: Key,
    subSections: []
  },
  {
    id: 'mcp',
    title: 'MCP',
    icon: Zap,
    subSections: [
      { id: 'available-mcps', title: 'Available MCPs' },
      { id: 'mcp-tools-setup', title: 'MCP Tools Setup' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: Server,
    subSections: []
  }
];

export default function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['mcp']);

  const handleSectionClick = (section: any) => {
    if (section.subSections.length > 0) {
      // If section has subsections, toggle expansion
      toggleSection(section.id);
    } else {
      // If section has no subsections, select it directly
      onSectionChange(section.id);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="theme-card-bg rounded-lg theme-border border theme-shadow">
      <div className="p-4 theme-border border-b">
        <h2 className="text-lg font-semibold theme-text-primary">Configuration</h2>
      </div>
      
      <div className="p-2">
        {settingsSections.map((section) => (
          <div key={section.id} className="mb-2">
            <button
              onClick={() => handleSectionClick(section)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group ${
                activeSection === section.id && section.subSections.length === 0
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                  : 'theme-hover-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <section.icon className={`w-5 h-5 transition-colors ${
                  activeSection === section.id && section.subSections.length === 0
                    ? 'text-blue-600'
                    : 'theme-text-secondary group-hover:text-blue-600'
                }`} />
                <span className={`font-medium transition-colors ${
                  activeSection === section.id && section.subSections.length === 0
                    ? 'text-blue-700'
                    : 'theme-text-primary group-hover:text-blue-600'
                }`}>
                  {section.title}
                </span>
              </div>
              {section.subSections.length > 0 && (
                expandedSections.includes(section.id) ? (
                  <ChevronDown className="w-4 h-4 theme-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 theme-text-muted" />
                )
              )}
            </button>
            
            {expandedSections.includes(section.id) && section.subSections.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {section.subSections.map((subSection) => (
                  <button
                    key={subSection.id}
                    onClick={() => onSectionChange(subSection.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors text-sm tracking-wide ${
                      activeSection === subSection.id
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                        : 'theme-text-secondary theme-hover-bg hover:text-blue-600'
                    }`}
                  >
                    {subSection.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}