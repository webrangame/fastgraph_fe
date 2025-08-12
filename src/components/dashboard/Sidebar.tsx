'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Workflow, 
  Bot, 
  BarChart3, 
  Settings,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

// Extracted navigation items for reuse
export const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Workflows',
    href: '/dashboard/workflows',
    icon: Workflow,
  },
  // {
  //   name: 'Agents',
  //   href: '/dashboard/agents',
  //   icon: Bot,
  // },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void; // For mobile drawer to close on navigation
}

export default function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Safely get theme context
  const themeContext = useTheme();
  const { theme, toggleTheme, isLoaded } = themeContext;

  const isActive = (href: string) => {
    return pathname === href;
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  // On mobile, never show collapsed state - always show full sidebar
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <div className={`theme-sidebar-bg theme-text-secondary h-screen flex flex-col font-['Open_Sans'] transition-all duration-300 ease-in-out theme-border shadow-sm ${
      isCollapsed ? 'w-20' : 'w-64'
    } ${isMobile ? 'w-80 max-w-[80vw]' : ''}`} 
    style={{ borderRightWidth: isMobile ? '0' : '1px' }}>
      
      {/* Logo/Brand Section */}
      <div className="p-3 theme-border" style={{ borderBottomWidth: '1px' }}>
        <button
          onClick={isMobile ? undefined : toggleCollapse}
          className={`flex items-center space-x-3 w-full text-left rounded-lg p-2 transition-colors group ${
            isMobile ? '' : 'theme-hover-bg'
          }`}
          title={isMobile ? undefined : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          disabled={isMobile}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">AA</span>
          </div>
          {!isCollapsed && (
            <span className="theme-text-primary font-semibold text-lg tracking-tight group-hover:text-blue-600 transition-colors">
              ADMIN
            </span>
          )}
        </button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 theme-border" style={{ borderBottomWidth: '1px' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md">
              <span className="text-gray-700 font-semibold text-sm">NH</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className="theme-text-primary font-semibold text-sm">Nowak Helme</span>
                <ChevronDown className="w-4 h-4 theme-text-muted hover:text-gray-600 transition-colors cursor-pointer" />
              </div>
              <span className="theme-text-muted text-xs font-medium">Admin Head</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {isCollapsed && (
        <div className="p-3 theme-border flex justify-center" style={{ borderBottomWidth: '1px' }}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md">
            <span className="text-gray-700 font-semibold text-xs">NH</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
              } ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200'
                  : 'theme-text-secondary theme-hover-bg hover:text-gray-900'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 transition-all duration-200 ${
                isCollapsed ? 'mr-0' : 'mr-4'
              } ${
                isActive(item.href) 
                  ? 'text-blue-600' 
                  : 'theme-text-muted'
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="font-semibold tracking-wide">{item.name}</span>
                  
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow-sm"></div>
                  )}
                </>
              )}
              
              {isCollapsed && isActive(item.href) && (
                <div className="absolute right-2 w-2 h-2 bg-blue-600 rounded-full shadow-sm"></div>
              )}
            </Link>
          ))}
        </div>

        {/* Theme Toggle in Sidebar */}
        {isLoaded && (
          <div className="mt-8 px-3">
            <div className="theme-border pt-4" style={{ borderTopWidth: '1px' }}>
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 theme-text-secondary theme-hover-bg ${
                  isCollapsed 
                    ? 'justify-center p-3 min-w-[2.5rem] min-h-[2.5rem]' 
                    : 'p-3'
                }`}
                title={isCollapsed ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
              >
                {theme === 'dark' ? (
                  <Sun className={`w-5 h-5 text-yellow-500 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                ) : (
                  <Moon className={`w-5 h-5 theme-text-secondary flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                )}
                {!isCollapsed && (
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className={`${isLoaded ? 'mt-4' : 'mt-8'} px-4`}>
            <div className="theme-border pt-6" style={{ borderTopWidth: '1px' }}>
              <div className="text-xs theme-text-muted font-medium uppercase tracking-wider">
                Version 2.0.1
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}