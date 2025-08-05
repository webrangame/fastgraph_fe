'use client';
import { ReactNode, HTMLAttributes } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glassmorphism?: boolean;
  children: ReactNode;
}

export function Card({
  children,
  className = '',
  hover = false,
  glassmorphism = false,
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseClasses = `theme-card-bg rounded-2xl theme-shadow theme-border transition-all duration-300 ${className}`;
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300' : '';
  const glassClasses = glassmorphism && !isDark ? 'backdrop-blur-xl border-white/20' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${glassClasses}`}
      style={{ borderWidth: '1px', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
