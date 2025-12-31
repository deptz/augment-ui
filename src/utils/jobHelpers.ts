import type { BatchResponse } from '../types/api';

/**
 * Check if response is async (BatchResponse)
 */
export function isAsyncResponse(response: any): response is BatchResponse {
  return 'job_id' in response && 'status_url' in response;
}

/**
 * Extract created tickets from job results
 */
export function getCreatedTicketKeys(jobResult: any): {
  stories: string[];
  tasks: string[];
} {
  if (jobResult.creation_results?.created_tickets) {
    return {
      stories: jobResult.creation_results.created_tickets.stories || [],
      tasks: jobResult.creation_results.created_tickets.tasks || []
    };
  }
  return { stories: [], tasks: [] };
}

/**
 * Handle 409 Conflict response from axios error
 * Returns the active job ID if found, null otherwise
 */
export function handleDuplicateJob(error: any): string | null {
  if (error?.response?.status === 409) {
    const activeJobId = error.response.headers['x-active-job-id'] || 
                        error.response.headers['X-Active-Job-Id'];
    return activeJobId || null;
  }
  return null;
}




