import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ 
  icon = <Inbox className="w-12 h-12 text-warmGray-300" />,
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-warmGray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-warmGray-500 mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
