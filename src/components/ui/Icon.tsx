import * as Icons from 'lucide-react';

interface IconProps {
  name: keyof typeof Icons;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, className = 'w-5 h-5', style }: IconProps) {
  const IconComponent = Icons[name] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  return <IconComponent className={className} style={style} />;
}