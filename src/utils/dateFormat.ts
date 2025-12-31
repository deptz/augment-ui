/**
 * Format a date string to YYYY-MM-DD HH:MM:SS in user's local timezone
 * @param dateString - ISO 8601 date string (from API)
 * @returns Formatted date string in user's timezone
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format in user's local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateString;
  }
}

/**
 * Format duration between two dates
 * @param start - ISO 8601 date string
 * @param end - ISO 8601 date string
 * @returns Formatted duration string
 */
export function formatDuration(start: string, end: string): string {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
      return `${diffMins}m ${diffSecs % 60}s`;
    } else {
      return `${diffSecs}s`;
    }
  } catch {
    return 'N/A';
  }
}

