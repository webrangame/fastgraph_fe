'use client';
import { Icon } from '@/components/ui/Icon';

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon: string;
}

const typeStyles = {
  success: 'bg-emerald-100 text-emerald-600',
  error: 'bg-rose-100 text-rose-600', 
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-blue-100 text-blue-600'
};

export function ActivityItem({ title, description, time, type, icon }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl theme-hover-bg transition-colors">
      <div className={`p-2 rounded-lg flex-shrink-0 ${typeStyles[type]}`}>
        <Icon name={icon as any} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="theme-text-primary font-medium text-sm mb-1">{title}</h4>
        <p className="theme-text-secondary text-xs mb-2">{description}</p>
        <div className="flex items-center theme-text-muted text-xs">
          <Icon name="Clock" className="w-3 h-3 mr-1" />
          {time}
        </div>
      </div>  
    </div>
  );
}