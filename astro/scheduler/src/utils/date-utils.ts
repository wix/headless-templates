/**
 * Date and time utility functions
 */
import { DATE_FORMAT, TIME_FORMAT } from './constants';

/**
 * Format a date using the standard app date format
 */
export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
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
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
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
 * Get start of today with time set to 00:00:00
 */
export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

