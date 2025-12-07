/**
 * Environment-aware logging utility
 * Only logs in development mode to prevent information leakage in production
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Logs a message only in development mode
 */
export function log(...args: any[]): void {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Logs a warning only in development mode
 */
export function warn(...args: any[]): void {
  if (isDevelopment) {
    console.warn(...args);
  }
}

/**
 * Logs an error only in development mode
 * Note: In production, errors should be handled gracefully without logging sensitive details
 */
export function error(...args: any[]): void {
  if (isDevelopment) {
    console.error(...args);
  }
}

/**
 * Logs debug information only in development mode
 */
export function debug(...args: any[]): void {
  if (isDevelopment) {
    console.debug(...args);
  }
}

/**
 * Logs information only in development mode
 */
export function info(...args: any[]): void {
  if (isDevelopment) {
    console.info(...args);
  }
}

/**
 * Sanitizes error objects for safe logging
 * Removes sensitive information and provides a safe error representation
 */
export function sanitizeError(error: any): {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
} {
  if (!error) {
    return { message: 'Unknown error' };
  }

  // Handle Axios errors
  if (error.response) {
    return {
      message: error.message || 'Request failed',
      status: error.response.status,
      statusText: error.response.statusText,
      url: error.config?.url,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
  };
}

