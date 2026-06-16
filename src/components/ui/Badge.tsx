import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'accent' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    success: 'bg-primary-100 text-primary-700',
    warning: 'bg-accent-100 text-accent-700',
    danger: 'bg-danger-100 text-danger-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-warmGray-100 text-warmGray-700',
    accent: 'bg-accent-100 text-accent-700',
    primary: 'bg-primary-100 text-primary-700',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn('badge', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
