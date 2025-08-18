'use client';
import React from 'react';
import { Settings } from 'lucide-react';

export default function GeneralSettings() {
  return (
    <div className="theme-card-bg rounded-lg p-8 text-center theme-border border theme-shadow">
      <Settings className="w-16 h-16 theme-text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold theme-text-primary mb-2">
        General Settings
      </h3>
      <p className="theme-text-secondary">
        General settings will be available here.
      </p>
    </div>
  );
}