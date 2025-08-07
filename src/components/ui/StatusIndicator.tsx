'use client';

import { getStatusColor } from '@/lib/workflow-utils';

interface StatusIndicatorProps {
  status: string;
  className?: string;
}

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  return (
    <div 
      className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${className}`}
      title={`Status: ${status}`}
    />
  );
}