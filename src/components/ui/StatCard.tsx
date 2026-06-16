import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/date';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  icon?: ReactNode;
  gradient?: string;
  className?: string;
  isMoney?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  gradient = 'from-primary-500 to-primary-600',
  className,
  isMoney = false
}: StatCardProps) {
  const displayValue = isMoney && typeof value === 'number' ? formatMoney(value) : value;
  
  const trendConfig = trend !== undefined ? {
    icon: trend > 0 ? <TrendingUp className="w-4 h-4" /> : trend < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />,
    color: trend > 0 ? 'text-white/90' : trend < 0 ? 'text-white/90' : 'text-white/70',
    text: `${trend > 0 ? '+' : ''}${trend}%`,
  } : null;

  return (
    <div className={cn(
      'stat-card bg-gradient-to-br',
      gradient,
      className
    )}>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2 font-mono">{displayValue}</p>
            {subtitle && (
              <p className="text-white/70 text-sm mt-1">{subtitle}</p>
            )}
            {trendConfig && (
              <div className={cn('flex items-center gap-1 mt-3 text-sm', trendConfig.color)}>
                {trendConfig.icon}
                <span>{trendConfig.text}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-white/20 rounded-xl">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
