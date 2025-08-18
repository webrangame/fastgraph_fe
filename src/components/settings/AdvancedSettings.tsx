'use client';
import React from 'react';
import { Server } from 'lucide-react';

export default function AdvancedSettings() {
  return (
    <div className="theme-card-bg rounded-lg p-8 text-center theme-border border theme-shadow">
      <Server className="w-16 h-16 theme-text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold theme-text-primary mb-2">
        Advanced Settings
      </h3>
      <p className="theme-text-secondary">
        Advanced settings will be available here.
      </p>
    </div>
  );
}