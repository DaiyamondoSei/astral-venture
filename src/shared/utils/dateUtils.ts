
/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a human-readable string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a date to include time (e.g., "Jan 1, 2023, 12:30 PM")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Format a date relative to the current time (e.g., "5 minutes ago", "yesterday", etc.)
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    if (diffInDays === 1) return 'yesterday';
    return `${diffInDays} days ago`;
  }

  // If more than a week, just use the standard date format
  return formatDate(date);
}

/**
 * Get the start and end dates for different time periods
 */
export function getDateRange(period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      // Set to start of current week (Sunday)
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      // Set to end of current week (Saturday)
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      // Set to start of current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      // Set to end of current month
      end.setMonth(now.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      // Set to start of current year
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      // Set to end of current year
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}
