import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProgressColor(progress: number, isOverBudget: boolean): string {
  if (isOverBudget) return 'bg-danger-500';
  if (progress >= 90) return 'bg-accent-500';
  if (progress >= 70) return 'bg-primary-400';
  return 'bg-primary-500';
}
