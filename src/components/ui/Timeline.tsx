import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  category?: string;
  icon?: ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  formatDate?: (date: string) => string;
  formatAmount?: (amount: number) => string;
}

export default function Timeline({ 
  items, 
  className,
  formatDate = (d) => d,
  formatAmount = (a) => `¥${a.toLocaleString()}`
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-warmGray-500">
        暂无记录
      </div>
    );
  }

  const groupedByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className={cn('space-y-6', className)}>
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-warmGray-200" />
            <span className="text-sm font-medium text-warmGray-500 px-3 py-1 bg-warmGray-50 rounded-full">
              {formatDate(date)}
            </span>
            <div className="h-px flex-1 bg-warmGray-200" />
          </div>
          
          <div className="space-y-0">
            {groupedByDate[date].map((item, index) => (
              <div 
                key={item.id} 
                className={cn(
                  'timeline-item',
                  index === groupedByDate[date].length - 1 && 'border-l-transparent pb-0'
                )}
              >
                <div className={cn(
                  'timeline-dot',
                  item.color || 'bg-primary-400'
                )} />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.icon && (
                        <span className="text-primary-500">{item.icon}</span>
                      )}
                      <h4 className="font-medium text-warmGray-800">{item.title}</h4>
                      {item.category && (
                        <span className="text-xs px-2 py-0.5 bg-warmGray-100 text-warmGray-600 rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-warmGray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  {item.amount !== undefined && (
                    <span className="font-mono font-semibold text-warmGray-800">
                      {formatAmount(item.amount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
