'use client';

import React, { useState } from 'react';
import { HybridCapability } from '@/lib/workflow-utils';

interface HybridCapabilityPillProps {
  capability: HybridCapability;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function HybridCapabilityPill({ 
  capability, 
  size = 'md',
  showTooltip = true,
  className = ''
}: HybridCapabilityPillProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);

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
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {/* Icon */}
        <span className={iconSizes[size]}>{capability.icon}</span>
        
        {/* Name */}
        <span className="font-medium">{capability.name}</span>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && showTooltipState && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 
                     theme-card-bg border theme-border rounded-lg shadow-xl p-3 w-64
                     animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Arrow */}
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                       border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: 'var(--card-bg)' }}
          />
          
          {/* Tooltip Content */}
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <span className="text-lg">{capability.icon}</span>
              <div>
                <h4 className="font-semibold theme-text-primary text-sm">
                  {capability.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${capability.color}20`,
                      color: capability.color
                    }}
                  >
                    {capability.category}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xs theme-text-secondary leading-relaxed">
              {capability.description}
            </p>
            
            
            {/* Examples */}
            {capability.examples && capability.examples.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs theme-text-muted">Examples:</span>
                <div className="flex flex-wrap gap-1">
                  {capability.examples.slice(0, 4).map((example, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 theme-input-bg theme-text-primary 
                                 rounded border theme-border"
                    >
                      {example}
                    </span>
                  ))}
                  {capability.examples.length > 4 && (
                    <span className="text-[10px] theme-text-muted">
                      +{capability.examples.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
