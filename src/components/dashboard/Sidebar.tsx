'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Workflow,
  Bot,
  BarChart3,
  Settings,
  CreditCard,
  ChevronDown,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { selectCurrentUser, logout } from '@/redux/slice/authSlice';
import { useLogoutMutation } from '../../../lib/api/authApi';

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
  {
    name: 'Pricing',
    href: '/dashboard/pricing',
    icon: CreditCard,
  },
];

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void; // For mobile drawer to close on navigation
}

export default function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();
  
  // Safely get theme context
  const themeContext = useTheme();
  const { theme, toggleTheme, isLoaded } = themeContext;

  // Get user's first name and initials
  const firstName = user?.fullName ? user.fullName : 'User';
  const initials = user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

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

  const handleLogout = async () => {
    try {
      // Call logout API
      await logoutMutation(null).unwrap();
      // Dispatch logout action to clear Redux state
      dispatch(logout());
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state and redirect
      dispatch(logout());
      router.push('/login');
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
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          {!isCollapsed && (
            <span className="theme-text-primary font-semibold text-lg tracking-tight group-hover:text-blue-600 transition-colors">
              {firstName}
            </span>
          )}
        </button>
      </div>

      {/* User Profile Section */}
     
      {/* Collapsed User Avatar */}
      {isCollapsed && (
        <div className="p-3 theme-border flex justify-center" style={{ borderBottomWidth: '1px' }}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md">
            <span className="text-gray-700 font-semibold text-xs">{initials}</span>
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

        {/* Logout Button */}
        <div className="px-3 mt-4">
          <div className="theme-border pt-4" style={{ borderTopWidth: '1px' }}>
            <button
              onClick={handleLogout}
              className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full ${
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
              } theme-text-secondary theme-hover-bg hover:text-red-600 hover:bg-red-50`}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className={`w-5 h-5 transition-all duration-200 ${
                isCollapsed ? 'mr-0' : 'mr-4'
              } theme-text-muted group-hover:text-red-600`} />
              
              {!isCollapsed && (
                <span className="font-semibold tracking-wide group-hover:text-red-600">Logout</span>
              )}
            </button>
          </div>
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