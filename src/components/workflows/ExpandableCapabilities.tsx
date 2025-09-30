'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { HybridCapability, createHybridCapabilities, CATEGORY_COLORS } from '@/lib/workflow-utils';
import { HybridCapabilityPill } from './HybridCapabilityPill';

interface ExpandableCapabilitiesProps {
  capabilities: string[];
  maxVisible?: number;
  showCategoryGroups?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ExpandableCapabilities({ 
  capabilities, 
  maxVisible = 4,
  showCategoryGroups = false,
  size = 'md',
  className = ''
}: ExpandableCapabilitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const hybridCapabilities = createHybridCapabilities(capabilities);
  const visibleCapabilities = isExpanded ? hybridCapabilities : hybridCapabilities.slice(0, maxVisible);
  const hasMore = hybridCapabilities.length > maxVisible;

  // Group capabilities by category
  const groupedCapabilities = hybridCapabilities.reduce((acc, cap) => {
    if (!acc[cap.category]) acc[cap.category] = [];
    acc[cap.category].push(cap);
    return acc;
  }, {} as Record<string, HybridCapability[]>);

  const categories = Object.keys(groupedCapabilities);

  if (showCategoryGroups && isExpanded) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Category Filter */}
        <div className="flex items-center space-x-2 pb-2 border-b theme-border">
          <Sparkles className="w-4 h-4 theme-text-muted" />
          <span className="text-sm font-medium theme-text-secondary">Categories:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2 py-1 text-xs rounded-full transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'theme-input-bg theme-text-secondary hover:theme-text-primary'
              }`}
            >
              All ({hybridCapabilities.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 py-1 text-xs rounded-full transition-all duration-200 capitalize ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'theme-input-bg theme-text-secondary hover:theme-text-primary'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] : undefined
                }}
              >
                {category} ({groupedCapabilities[category].length})
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Capabilities */}
        <div className="space-y-4">
          {categories
            .filter(category => !selectedCategory || category === selectedCategory)
            .map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] }}
                  />
                  <h4 className="text-sm font-semibold theme-text-primary capitalize">
                    {category} Capabilities
                  </h4>
                  <span className="text-xs theme-text-muted">
                    ({groupedCapabilities[category].length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-5">
                  {groupedCapabilities[category].map((capability) => (
                    <HybridCapabilityPill
                      key={capability.id}
                      capability={capability}
                      size={size}
                      showTooltip={true}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Collapse Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center space-x-2 px-4 py-2 text-sm theme-text-secondary 
                       hover:theme-text-primary theme-input-bg hover:theme-hover-bg 
                       rounded-lg transition-all duration-200 border theme-border"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Show Less</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Capability Pills */}
      <div className="flex flex-wrap gap-2">
        {visibleCapabilities.map((capability) => (
          <HybridCapabilityPill
            key={capability.id}
            capability={capability}
            size={size}
            showTooltip={true}
          />
        ))}
      </div>

      {/* Expand/Collapse Controls */}
      {hasMore && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs theme-text-muted">
            <Sparkles className="w-3 h-3" />
            <span>
              Showing {visibleCapabilities.length} of {hybridCapabilities.length} capabilities
            </span>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium
                       theme-text-secondary hover:theme-text-primary 
                       theme-input-bg hover:theme-hover-bg rounded-lg 
                       transition-all duration-200 border theme-border hover:border-blue-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Show {hybridCapabilities.length - maxVisible} More</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Category Summary (when collapsed) */}
      {!isExpanded && categories.length > 1 && (
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-xs theme-text-muted">Categories:</span>
          <div className="flex space-x-1">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center space-x-1"
                title={`${groupedCapabilities[category].length} ${category} capabilities`}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] }}
                />
                <span className="text-xs theme-text-muted">
                  {groupedCapabilities[category].length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
