'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileDrawer from '@/components/dashboard/MobileDrawer';
import MobileHeader from '@/components/dashboard/MobileHeader';
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import UserProfileFetcher from '@/components/auth/UserProfileFetcher';
import SubscriptionGuard from '@/components/auth/SubscriptionGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setMobileDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleMobileNavigate = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <AuthGuard>
      <UserProfileFetcher>
        <SubscriptionGuard>
          <ThemeProvider>
            <div className="flex h-screen theme-bg transition-colors duration-300">
              
              {/* Desktop Sidebar - Hidden on mobile/tablet */}
              <div className="hidden lg:block">
                <Sidebar />
              </div>

              {/* Mobile Drawer - Only visible on mobile/tablet */}
              <MobileDrawer 
                isOpen={mobileDrawerOpen} 
                onClose={handleDrawerClose}
              >
                <Sidebar 
                  isMobile={true} 
                  onNavigate={handleMobileNavigate}
                />
              </MobileDrawer>

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col overflow-hidden">
                
                {/* Mobile Header - Only visible on mobile/tablet */}
                <MobileHeader onMenuClick={handleMobileMenuClick} />
                
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
                
              </main>
            </div>
          </ThemeProvider>
        </SubscriptionGuard>
      </UserProfileFetcher>
    </AuthGuard>
  );
}