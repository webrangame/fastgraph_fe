'use client';

import { AgentSidebar } from '../AgentSidebar';
import { X } from 'lucide-react';

interface MobileAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAgentDrawer({ isOpen, onClose }: MobileAgentDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] h-full theme-sidebar-bg theme-border border-r overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 theme-border border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold theme-text-primary">Agents</h2>
          <button
            onClick={onClose}
            className="p-2 theme-hover-bg rounded-lg theme-text-secondary hover:theme-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AgentSidebar isMobile={true} onAgentSelect={onClose} />
        </div>
      </div>
    </div>
  );
}