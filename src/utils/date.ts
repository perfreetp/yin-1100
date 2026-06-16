import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

export { parseISO };
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, fmt: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}

export function formatDisplayDate(date: string | Date): string {
  return formatDate(date, 'M月d日');
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getDaysDiff(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  return Math.max(0, differenceInDays(e, s));
}

export function getDaysFromNow(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

export function isSameDate(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

export function getMonthRange(date: string | Date = new Date()): { start: string; end: string } {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: formatDate(startOfMonth(d)),
    end: formatDate(endOfMonth(d)),
  };
}

export function getWeekRange(date: string | Date = new Date()): { start: string; end: string; days: Date[] } {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const start = startOfWeek(d, { weekStartsOn: 1 });
  const end = endOfWeek(d, { weekStartsOn: 1 });
  return {
    start: formatDate(start),
    end: formatDate(end),
    days: eachDayOfInterval({ start, end }),
  };
}

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;
  const endPadding = 6 - ((lastDay.getDay() + 6) % 7);
  
  const calendarStart = addDays(firstDay, -startPadding);
  const calendarEnd = addDays(lastDay, endPadding);
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function datesOverlap(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1;
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1;
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2;
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2;
  
  return s1 <= e2 && s2 <= e1;
}

export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, startOfDay(new Date()));
}

export function getWeekDays(date: Date): Date[] {
  const weekRange = getWeekRange(date);
  return weekRange.days;
}
