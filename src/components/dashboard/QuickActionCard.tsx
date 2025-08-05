'use client';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  colors: { light: string; gradient: string };
  href: string;
}

export function QuickActionCard({ title, description, icon, colors }: QuickActionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button className="group relative rounded-2xl p-6 text-left shadow-lg overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 transform-gpu">
      {/* Conditional Background */}
      <div className="absolute inset-0 rounded-2xl">
        {isDark ? (
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient}`} />
        ) : (
          <div 
            className="absolute inset-0 rounded-2xl backdrop-blur-xl border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${colors.light}10, ${colors.light}15)`,
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}
          />
        )}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
            <Icon 
              name={icon as any} 
              className="w-6 h-6" 
              style={{ color: isDark ? 'white' : colors.light }} 
            />
          </div>
          <Icon 
            name="ArrowRight" 
            className="w-5 h-5 transition-all duration-500 group-hover:translate-x-2" 
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : colors.light }} 
          />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? 'white' : colors.light }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)' }}>  
          {description}
        </p>
      </div>
    </button>
  );
}