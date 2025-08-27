'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCapabilities: () => void;
}

export default function SuccessModal({ isOpen, onClose, onViewCapabilities }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-card-bg rounded-lg max-w-md w-full p-6 theme-shadow">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">Connection Successful!</h3>
            <p className="theme-text-secondary text-sm">MCP server has been connected successfully.</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onViewCapabilities}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Available MCPs
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 theme-border border rounded-lg theme-text-secondary hover:theme-hover-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}