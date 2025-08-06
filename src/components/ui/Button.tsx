'use client';

import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: LucideIcon;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'theme-input-bg theme-hover-bg theme-text-primary',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

export function Button({ 
  variant = 'secondary', 
  icon: Icon, 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}