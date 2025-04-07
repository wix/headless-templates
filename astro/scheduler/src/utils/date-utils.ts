/**
 * Date and time utility functions
 */
import { format as formatDate, startOfToday, addDays } from 'date-fns';
import { DATE_FORMAT, TIME_FORMAT } from './constants';

/**
 * Format a date using the standard app date format
 */
export function formatDisplayDate(date: Date): string {
  return formatDate(date, DATE_FORMAT);
}

/**
 * Format a time string from ISO format to display format
 */
export function formatDisplayTime(dateString: string): string {
  const date = new Date(dateString);
  return Intl.DateTimeFormat("en-US", TIME_FORMAT).format(date);
}

/**
 * Generate a range of dates starting from today
 */
export function generateDateRange(daysAhead: number = 30): Date[] {
  const today = startOfToday();
  const dates: Date[] = [];
  
  for (let i = 0; i < daysAhead; i++) {
    dates.push(addDays(today, i));
  }
  
  return dates;
}

/**
 * Get the days of the week
 */
export function getDaysOfWeek(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Check if a date is in the past
 */
export function isInPast(date: Date): boolean {
  return date < startOfToday();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = startOfToday();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Get a future date limit (for booking restrictions)
 */
export function getMaxBookingDate(maxDays: number = 60): Date {
  return addDays(startOfToday(), maxDays);
}

/**
 * Group dates by month for calendar display
 */
export function groupDatesByMonth(dates: Date[]): Record<string, Date[]> {
  return dates.reduce((acc, date) => {
    const monthYear = formatDate(date, 'MMMM yyyy');
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(date);
    return acc;
  }, {} as Record<string, Date[]>);
}
