'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for client-side hydration
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('dashboard-theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(systemPrefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('Could not access localStorage, using default theme');
        setTheme('dark');
      }
      setIsLoaded(true);
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(initializeTheme, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      
      // Add/remove classes for Tailwind
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      
      localStorage.setItem('dashboard-theme', theme);
      console.log('Theme applied:', theme);
    } catch (error) {
      console.warn('Could not apply theme:', error);
    }
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: theme === 'dark',
      isLoaded 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default context instead of throwing an error
    console.warn('useTheme called outside ThemeProvider, using defaults');
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => console.warn('Theme toggle called outside provider'),
      isDark: true,
      isLoaded: false
    };
  }
  return context;
}