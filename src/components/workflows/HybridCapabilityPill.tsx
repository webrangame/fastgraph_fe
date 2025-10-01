'use client';

import React from 'react';
import { HybridCapability } from '@/lib/workflow-utils';

interface HybridCapabilityPillProps {
  capability: HybridCapability;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onEdit?: (capability: HybridCapability) => void;
}

export function HybridCapabilityPill({ 
  capability, 
  size = 'md',
  className = '',
  onEdit
}: HybridCapabilityPillProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const iconSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  };

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center space-x-1.5 rounded-full font-medium
          border border-white/20 shadow-sm transition-all duration-200
          hover:scale-105 hover:shadow-md cursor-pointer
          ${sizeClasses[size]} ${className}
        `}
        style={{
          backgroundColor: `${capability.color}15`,
          borderColor: `${capability.color}30`,
          color: capability.color
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onEdit) {
            onEdit(capability);
          }
        }}
        title={onEdit ? `Click to edit ${capability.name} configuration` : undefined}
      >
        {/* Icon */}
        <span className={iconSizes[size]}>{capability.icon}</span>
        
        {/* Name */}
        <span className="font-medium">{capability.name}</span>
      </div>
    </div>
  );
}