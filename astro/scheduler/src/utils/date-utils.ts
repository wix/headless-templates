/**
 * Date utility functions
 */

/**
 * Format a date using the standard app date format
 */
export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Get the days of the week
 */
export function getDaysOfWeek(): string[] {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

/**
 * Get start of today with time set to 00:00:00
 */
export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
