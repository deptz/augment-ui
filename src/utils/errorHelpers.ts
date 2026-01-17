/**
 * Error handling utilities for Draft PR feature
 * Provides error code mapping, suggested actions, and contextual error messages
 */

export interface ErrorContext {
  stage?: string;
  action?: string;
  jobId?: string;
  planHash?: string;
}

export interface ErrorInfo {
  message: string;
  suggestedActions: string[];
  documentationLink?: string;
  errorCode?: string;
}

// Error code to error info mapping
const ERROR_MAP: Record<string, (context?: ErrorContext) => ErrorInfo> = {
  // HTTP Status Codes
  '400': (context) => ({
    message: 'Invalid request. Please check your input and try again.',
    suggestedActions: [
      'Verify all required fields are filled',
      'Check that story key format is correct',
      'Ensure repository URLs are valid',
    ],
    errorCode: '400',
  }),
  '401': () => ({
    message: 'Authentication failed. Please check your credentials.',
    suggestedActions: [
      'Verify your username and password',
      'Check if your session has expired',
      'Try logging in again',
    ],
    errorCode: '401',
  }),
  '403': () => ({
    message: 'Access denied. You do not have permission to perform this action.',
    suggestedActions: [
      'Contact your administrator for access',
      'Verify your account permissions',
    ],
    errorCode: '403',
  }),
  '404': (context) => ({
    message: context?.jobId
      ? `Job ${context.jobId} not found. It may have been deleted or never existed.`
      : 'Resource not found.',
    suggestedActions: [
      'Check if the job ID is correct',
      'Verify the resource exists',
      'Try refreshing the page',
    ],
    errorCode: '404',
  }),
  '409': (context) => ({
    message: context?.action === 'approve'
      ? 'Plan was modified during approval. Please refresh and approve the latest version.'
      : 'Conflict detected. The resource has been modified by another process.',
    suggestedActions: [
      'Refresh the page to get the latest state',
      'Review changes before retrying',
      context?.action === 'approve' ? 'Approve the latest plan version' : 'Retry the operation',
    ],
    errorCode: '409',
  }),
  '422': () => ({
    message: 'Validation error. Please check your input.',
    suggestedActions: [
      'Review all form fields',
      'Check for required fields',
      'Verify data formats are correct',
    ],
    errorCode: '422',
  }),
  '429': () => ({
    message: 'Too many requests. Please wait a moment before trying again.',
    suggestedActions: [
      'Wait a few seconds before retrying',
      'Reduce the frequency of requests',
    ],
    errorCode: '429',
  }),
  '500': () => ({
    message: 'Internal server error. Our team has been notified.',
    suggestedActions: [
      'Try again in a few moments',
      'If the problem persists, contact support',
    ],
    errorCode: '500',
  }),
  '503': () => ({
    message: 'Service temporarily unavailable. Please try again later.',
    suggestedActions: [
      'Wait a few minutes and try again',
      'Check system status page',
    ],
    errorCode: '503',
  }),

  // Draft PR Specific Errors
  'STORY_NOT_FOUND': (context) => ({
    message: `Story ${context?.stage || ''} not found in JIRA.`,
    suggestedActions: [
      'Verify the story key is correct',
      'Check if the story exists in JIRA',
      'Ensure you have access to the story',
    ],
    documentationLink: '/docs/story-requirements',
  }),
  'REPO_INACCESSIBLE': (context) => ({
    message: 'Repository is not accessible. Check permissions and URL.',
    suggestedActions: [
      'Verify repository URL is correct',
      'Check repository access permissions',
      'Ensure the repository exists',
    ],
    documentationLink: '/docs/repository-setup',
  }),
  'PLAN_ALREADY_APPROVED': () => ({
    message: 'This plan has already been approved and cannot be revised.',
    suggestedActions: [
      'View the current job status',
      'Check if a new plan version is available',
    ],
  }),
  'JOB_FAILED': (context) => ({
    message: `Job failed at ${context?.stage || 'unknown'} stage.`,
    suggestedActions: [
      'Check artifacts for detailed error information',
      'Review the error message above',
      'Try retrying the job',
      'Contact support if the issue persists',
    ],
  }),
  'STAGE_INVALID': (context) => ({
    message: `Invalid stage: ${context?.stage}. Cannot retry from this stage.`,
    suggestedActions: [
      'Check the current job status',
      'Verify the stage name is correct',
    ],
  }),
};

/**
 * Get error information based on error object and context
 */
export function getErrorInfo(error: any, context?: ErrorContext): ErrorInfo {
  // Try to extract error code from response
  const statusCode = error?.response?.status?.toString();
  const errorDetail = error?.response?.data?.detail || error?.message || 'An unexpected error occurred';
  
  // Check for specific error codes in detail
  let errorCode: string | undefined;
  if (typeof errorDetail === 'string') {
    // Try to match known error patterns
    if (errorDetail.includes('not found') || errorDetail.includes('does not exist')) {
      errorCode = 'STORY_NOT_FOUND';
    } else if (errorDetail.includes('not accessible') || errorDetail.includes('permission')) {
      errorCode = 'REPO_INACCESSIBLE';
    } else if (errorDetail.includes('already approved')) {
      errorCode = 'PLAN_ALREADY_APPROVED';
    } else if (errorDetail.includes('failed')) {
      errorCode = 'JOB_FAILED';
    }
  }

  // Use status code if available
  if (statusCode && ERROR_MAP[statusCode]) {
    const errorInfo = ERROR_MAP[statusCode](context);
    return {
      ...errorInfo,
      message: errorDetail || errorInfo.message,
    };
  }

  // Use specific error code if found
  if (errorCode && ERROR_MAP[errorCode]) {
    return ERROR_MAP[errorCode](context);
  }

  // Default error info
  return {
    message: typeof errorDetail === 'string' ? errorDetail : 'An unexpected error occurred',
    suggestedActions: [
      'Try refreshing the page',
      'Check your network connection',
      'Contact support if the problem persists',
    ],
  };
}

/**
 * Format error message with context
 */
export function formatErrorMessage(error: any, context?: ErrorContext): string {
  const errorInfo = getErrorInfo(error, context);
  return errorInfo.message;
}

/**
 * Get suggested actions for an error
 */
export function getSuggestedActions(error: any, context?: ErrorContext): string[] {
  const errorInfo = getErrorInfo(error, context);
  return errorInfo.suggestedActions;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const statusCode = error?.response?.status;
  // Retryable status codes: 429, 500, 502, 503, 504
  return [429, 500, 502, 503, 504].includes(statusCode);
}
