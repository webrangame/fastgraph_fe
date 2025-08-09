'use client';

import { ReactNode, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  headerColor?: string;
  headerIcon?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md',
  headerColor = 'blue',
  headerIcon = 'Workflow'
}: ModalProps) {
  const { theme } = useTheme();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Animated Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Animated Modal */}
      <div className={`relative theme-card-bg rounded-2xl theme-shadow w-full ${maxWidth} transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
      }`}>
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-6 theme-border relative overflow-hidden" 
             style={{ borderBottomWidth: '1px' }}>
          {/* Subtle gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            headerColor === 'purple' 
              ? 'from-purple-500/5 to-indigo-500/5' 
              : 'from-blue-500/5 to-purple-500/5'
          }`} />
          
          <div className="relative flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              headerColor === 'purple' ? 'bg-purple-500/10' : 'bg-blue-500/10'
            }`}>
              <Icon 
                name={headerIcon as any} 
                className={`w-5 h-5 ${
                  headerColor === 'purple' ? 'text-purple-500' : 'text-blue-500'
                }`} 
              />
            </div>
            <h2 className="text-xl font-semibold theme-text-primary">{title}</h2>
          </div>
          
          <button
            onClick={onClose}
            className="relative p-2 rounded-lg theme-hover-bg transition-all duration-200 hover:scale-110 group"
          >
            <Icon name="X" className="w-5 h-5 theme-text-muted group-hover:theme-text-primary transition-colors" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}