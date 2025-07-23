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
  ChevronDown
} from 'lucide-react';

const navigationItems = [
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
  {
    name: 'Agents',
    href: '/dashboard/agents',
    icon: Bot,
  },
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`bg-gray-900 text-gray-300 h-screen flex flex-col font-['Open_Sans'] transition-all duration-300 ease-in-out ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo/Brand Section - Click to toggle */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={toggleCollapse}
          className="flex items-center space-x-3 w-full text-left hover:bg-gray-800 rounded-lg p-2 transition-colors group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg tracking-tight group-hover:text-blue-200 transition-colors">ADMINTO</span>
          )}
        </button>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">NH</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className="text-white font-semibold text-sm">Nowak Helme</span>
                <ChevronDown className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" />
              </div>
              <span className="text-gray-400 text-xs font-medium">Admin Head</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {collapsed && (
        <div className="p-3 border-b border-gray-700 flex justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-xs">NH</span>
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
              className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
              } ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 transition-all duration-200 ${
                collapsed ? 'mr-0' : 'mr-4'
              } ${
                isActive(item.href) 
                  ? 'text-white' 
                  : 'text-gray-400 group-hover:text-white'
              }`} />
              
              {!collapsed && (
                <>
                  <span className="font-semibold tracking-wide">{item.name}</span>
                  
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm"></div>
                  )}
                </>
              )}
              
              {collapsed && isActive(item.href) && (
                <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
              )}
            </Link>
          ))}
        </div>

        {!collapsed && (
          <div className="mt-8 px-4">
            <div className="border-t border-gray-700 pt-6">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Version 2.0.1
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}