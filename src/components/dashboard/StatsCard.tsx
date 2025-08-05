'use client';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  colors: { light: string; gradient: string };
  description: string;
  hasProgress?: boolean;
}

export function StatsCard({ title, value, change, icon, colors, description, hasProgress }: StatsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const shadowColor = `${colors.light}30`;

  return (
    <Card 
      className="p-6 group" 
      hover 
      style={{ boxShadow: isDark ? undefined : `0 4px 20px ${shadowColor}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg transition-all duration-300 group-hover:scale-105`}
        >
          <Icon name={icon as any} className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="theme-text-secondary text-sm font-medium">{title}</h3>
          <p className="theme-text-muted text-xs">{description}</p>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold theme-text-primary">{value}</div>
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" className="w-3 h-3" style={{ color: colors.light }} />
              <span className="text-sm font-semibold" style={{ color: colors.light }}>{change}</span>
              <span className="theme-text-muted text-xs">vs last month</span>
            </div>
          </div>
        </div>
      </div>
      
      {hasProgress && (
        <div className="mt-4">
          <div className="w-full theme-input-bg rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all duration-500`}
              style={{width: value}}
            />
          </div>
        </div>
      )}
    </Card>
  );
}