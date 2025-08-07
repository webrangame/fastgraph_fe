'use client';

import { Bot } from 'lucide-react';
import { createdAgents } from '@/lib/constants';

export function AgentSidebar() {
  const handleDragStart = (e: React.DragEvent, agentData: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'agent',
      name: agentData.name,
      color: agentData.color
    }));
  };

  return (
    <div className="w-64 theme-sidebar-bg theme-border border-r">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold theme-text-secondary">Available Agents</h3>
        </div>
        
        <div className="space-y-2">
          {createdAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.id}
                className="flex items-center space-x-3 p-3 rounded-lg theme-hover-bg cursor-grab active:cursor-grabbing group transition-colors"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, agent)}
              >
                <div className={`p-2 rounded-lg ${agent.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm theme-text-secondary group-hover:theme-text-primary font-medium transition-colors">
                  {agent.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}