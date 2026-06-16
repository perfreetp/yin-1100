import { cn, getProgressColor } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  isOverBudget?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  progress, 
  showLabel = false, 
  height = 'md',
  isOverBudget = false,
  className 
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const colorClass = getProgressColor(clampedProgress, isOverBudget);

  return (
    <div className="w-full">
      <div className={cn('progress-bar', heights[height], className)}>
        <div
          className={cn('progress-bar-fill', colorClass)}
          style={{ 
            width: `${clampedProgress}%`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-warmGray-500">
          <span>{clampedProgress.toFixed(1)}%</span>
          {isOverBudget && <span className="text-danger-500 font-medium">已超支</span>}
        </div>
      )}
    </div>
  );
}
