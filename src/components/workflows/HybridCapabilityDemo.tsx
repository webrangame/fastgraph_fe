'use client';

import React from 'react';
import { ExpandableCapabilities } from './ExpandableCapabilities';
import { HybridCapabilityPill } from './HybridCapabilityPill';
import { createHybridCapabilities, CATEGORY_COLORS } from '@/lib/workflow-utils';

export function HybridCapabilityDemo() {
  const sampleCapabilities = [
    'Research', 'Writing', 'Analysis', 'API Calls', 'Data Processing', 
    'Content Creation', 'Planning', 'Translation', 'Design', 'Automation',
    'Coding', 'Documentation', 'Feedback', 'Presentation'
  ];

  const hybridCaps = createHybridCapabilities(sampleCapabilities);

  return (
    <div className="space-y-8 p-6 theme-card-bg rounded-lg border theme-border max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-xl font-bold theme-text-primary flex items-center">
          <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>
          Hybrid Capability Display System
        </h2>
        <p className="theme-text-secondary text-sm">
          A comprehensive approach combining icons, skill indicators, category colors, and interactive tooltips
        </p>
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Individual Pills */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold theme-text-primary">Individual Pills</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium theme-text-secondary">Small Size</h4>
              <div className="flex flex-wrap gap-2">
                {hybridCaps.slice(0, 3).map((cap) => (
                  <HybridCapabilityPill key={cap.id} capability={cap} size="sm" />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium theme-text-secondary">Medium Size</h4>
              <div className="flex flex-wrap gap-2">
                {hybridCaps.slice(3, 6).map((cap) => (
                  <HybridCapabilityPill key={cap.id} capability={cap} size="md" />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium theme-text-secondary">Large Size</h4>
              <div className="flex flex-wrap gap-2">
                {hybridCaps.slice(6, 8).map((cap) => (
                  <HybridCapabilityPill key={cap.id} capability={cap} size="lg" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold theme-text-primary">Category System</h3>
          <div className="space-y-3">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="font-medium theme-text-primary capitalize text-sm">
                    {category}
                  </div>
                  <div className="text-xs theme-text-muted">
                    {hybridCaps.filter(cap => cap.category === category).length} capabilities
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hybridCaps
                    .filter(cap => cap.category === category)
                    .slice(0, 2)
                    .map((cap) => (
                      <HybridCapabilityPill 
                        key={cap.id} 
                        capability={cap} 
                        size="sm"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Capabilities - Compact View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold theme-text-primary">Expandable View (Compact)</h3>
        <div className="theme-input-bg rounded-lg p-4 border theme-border">
          <ExpandableCapabilities
            capabilities={sampleCapabilities}
            maxVisible={4}
            showCategoryGroups={false}
            size="md"
          />
        </div>
      </div>

      {/* Expandable Capabilities - Grouped View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold theme-text-primary">Expandable View (Category Groups)</h3>
        <div className="theme-input-bg rounded-lg p-4 border theme-border">
          <ExpandableCapabilities
            capabilities={sampleCapabilities}
            maxVisible={6}
            showCategoryGroups={true}
            size="md"
          />
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold theme-text-primary">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium theme-text-primary text-sm flex items-center">
              🎨 <span className="ml-2">Visual Design</span>
            </h4>
            <ul className="text-xs theme-text-secondary space-y-1 ml-6">
              <li>• Icon + text combination</li>
              <li>• Category color coding</li>
              <li>• Category badges</li>
              <li>• Responsive sizing (sm/md/lg)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium theme-text-primary text-sm flex items-center">
              ⚡ <span className="ml-2">Interactive Features</span>
            </h4>
            <ul className="text-xs theme-text-secondary space-y-1 ml-6">
              <li>• Hover tooltips with descriptions</li>
              <li>• Expandable "Show More" functionality</li>
              <li>• Category filtering</li>
              <li>• Smooth animations</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium theme-text-primary text-sm flex items-center">
              📊 <span className="ml-2">Information Display</span>
            </h4>
            <ul className="text-xs theme-text-secondary space-y-1 ml-6">
              <li>• Detailed capability descriptions</li>
              <li>• Usage examples</li>
              <li>• Category information</li>
              <li>• Category summaries</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium theme-text-primary text-sm flex items-center">
              🔧 <span className="ml-2">Customization</span>
            </h4>
            <ul className="text-xs theme-text-secondary space-y-1 ml-6">
              <li>• Configurable visibility limits</li>
              <li>• Category grouping toggle</li>
              <li>• Theme-aware styling</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
