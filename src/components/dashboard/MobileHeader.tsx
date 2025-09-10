'use client';

import { useState } from 'react';
import { Menu, Search, Flag, Bell, Settings } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="theme-header-bg px-4 py-3 theme-border theme-shadow lg:hidden" 
            style={{ borderBottomWidth: '1px' }}>
      
      {/* Main header row */}
      <div className="flex items-center justify-between">
        {/* Left side - Menu + Title */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-lg theme-hover-bg"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 theme-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold theme-text-primary">TimeLine</h1>
        </div>

        {/* Right side - Actions + Profile */}
        <div className="flex items-center space-x-2">
          {/* Search toggle (mobile) */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg theme-hover-bg"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 theme-text-secondary" />
          </button>

          {/* Notification bell */}
          <button className="p-2 rounded-lg theme-hover-bg">
            <Bell className="w-4 h-4 theme-text-secondary" />
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">NH</span>
          </div>
        </div>
      </div>

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search something.."
              className="theme-input-bg theme-input-text pl-10 pr-4 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 theme-border"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}