'use client';

import { Bot } from 'lucide-react';
import { createdAgents } from '@/lib/constants';
import type { ProcessedAgent } from '@/services/workflows/agentProcessor';

interface AgentSidebarProps {
  isMobile?: boolean;
  onAgentSelect?: () => void;
  agents?: Record<string, ProcessedAgent>;
}

export function AgentSidebar({ isMobile = false, onAgentSelect, agents }: AgentSidebarProps) {
  const handleDragStart = (e: React.DragEvent, agentData: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'agent',
      name: agentData.name,
      color: agentData.color
    }));
  };

  const handleAgentClick = (agent: any) => {
    // On mobile, simulate drag and drop behavior or handle touch interactions
    if (isMobile && onAgentSelect) {
      onAgentSelect(); // Close mobile drawer
    }
  };

  const colorPalette = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];
  const getColorForAgent = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };

  const availableAgents = agents
    ? Object.entries(agents).map(([key, agent]) => ({
        id: key,
        name: agent.name || key,
        icon: Bot,
        color: getColorForAgent(key)
      }))
    : createdAgents;

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} theme-sidebar-bg ${!isMobile ? 'theme-border border-r' : ''}`}>
      <div className="p-4">
        {!isMobile && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold theme-text-secondary">Available Agents</h3>
          </div>
        )}
        
        <div className="space-y-2">
          {availableAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.id}
                className={`flex items-center space-x-3 p-3 rounded-lg theme-hover-bg cursor-grab active:cursor-grabbing group transition-colors ${
                  isMobile ? 'active:scale-95' : ''
                }`}
                draggable={!isMobile}
                onDragStart={!isMobile ? (e) => handleDragStart(e, agent) : undefined}
                onClick={() => handleAgentClick(agent)}
              >
                <div className={`p-2 rounded-lg ${agent.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`${isMobile ? 'text-base' : 'text-sm'} theme-text-secondary group-hover:theme-text-primary font-medium transition-colors block truncate`}>
                    {agent.name}
                  </span>
                  {isMobile && (
                    <span className="text-xs theme-text-muted">
                      Tap to add to workflow
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isMobile && (
          <div className="mt-6 p-3 theme-card-bg rounded-lg theme-border border">
            <p className="text-xs theme-text-muted text-center">
              Tap an agent to add it to your workflow canvas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}