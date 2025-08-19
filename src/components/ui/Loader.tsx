'use client';

import { useTheme } from '@/components/ThemeProvider';
import { HTMLAttributes } from 'react';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function Loader({ 
  size = 'md', 
  message = 'Loading...', 
  className = '',
  ...props 
}: LoaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const borderSize = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4'
  };
  
  return (
    <div 
      className="flex flex-col items-center justify-center theme-bg p-4 rounded-lg"
      {...props}
    >
      <div 
        className={`
          ${sizeClasses[size]} 
          ${borderSize[size]}
          border-t-2 border-r-2 rounded-full 
          border-t-blue-500 border-r-blue-500 
          border-b-transparent border-l-transparent
          animate-spin
          ${className}
        `}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm theme-text-secondary">
          {message}
        </p>
      )}
    </div>
  );
}