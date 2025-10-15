'use client';

import { User, Crown } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface CustomUserAgentNodeProps {
  data: {
    label: string;
    role: string;
    capabilities?: string[];
    isCustom?: boolean;
  };
  selected?: boolean;
  id: string;
}

/**
 * CustomUserAgentNode - Matches project theme system
 * Features: Theme-aware, properly sized, consistent with project design
 */
export function CustomUserAgentNode({ data, selected, id }: CustomUserAgentNodeProps) {
  return (
    <div 
      className={`relative theme-card-bg rounded-lg border-2 transition-all theme-shadow cursor-pointer group ${
        selected 
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/25' 
          : 'theme-border hover:border-indigo-400/50'
      }`}
      style={{
        padding: '8px 10px',
        minWidth: '110px',
        maxWidth: '130px',
        fontSize: '9px'
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#6366f1',
          width: 7,
          height: 7,
          border: '1.5px solid white',
          left: -3.5
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#6366f1',
          width: 7,
          height: 7,
          border: '1.5px solid white',
          right: -3.5
        }}
      />
      
      {/* Badge */}
      <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[6.5px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-0.5">
        <Crown className="w-2 h-2" strokeWidth={2.5} />
        <span>CUSTOM</span>
      </div>
      
      {/* Compact agent content */}
      <div className="flex items-center space-x-2">
        <div className="p-1 rounded bg-indigo-500/10 flex-shrink-0 border border-indigo-500/20">
          <User className="w-3 h-3 text-indigo-500 dark:text-indigo-400" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="theme-text-primary font-semibold text-[9.5px] leading-tight truncate">
            {data.label}
          </div>
          <div className="theme-text-muted text-[8px] leading-tight truncate mt-0.5">
            {data.role}
          </div>
        </div>
      </div>
      
      {/* Status dot */}
      <div className="absolute top-2 right-2">
        <div className="relative">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    </div>
  );
}

