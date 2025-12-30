import { ref, onUnmounted, getCurrentInstance, type Ref } from 'vue';
import { getJobStatus, cancelJob } from '../api/endpoints';
import type { JobStatus, JobStatusType } from '../types/api';
import { useUIStore } from '../stores/ui';
import { warn, error } from '../utils/logger';

export interface UseJobPollingOptions {
  interval?: number; // Polling interval in milliseconds
  onComplete?: (job: JobStatus) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: JobStatusType) => void;
}

const FINAL_STATUSES: JobStatusType[] = ['completed', 'failed', 'cancelled'];

export function useJobPolling(jobId: Ref<string | null>, options: UseJobPollingOptions = {}) {
  const uiStore = useUIStore();
  const job = ref<JobStatus | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const isPolling = ref(false);
  const isCancelling = ref(false);
  
  const {
    interval = 3000, // Default 3 seconds
    onComplete,
    onError,
    onStatusChange,
  } = options;

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let retryCount = 0;
  const maxRetries = 3;
  let currentInterval = interval;

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isPolling.value = false;
    retryCount = 0;
    currentInterval = interval;
  };

  const poll = async () => {
    if (!jobId.value) {
      stopPolling();
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      
      const jobStatus = await getJobStatus(jobId.value);
      const previousStatus = job.value?.status;
      job.value = jobStatus;

      // Notify status change
      if (onStatusChange && previousStatus && previousStatus !== jobStatus.status) {
        onStatusChange(jobStatus.status);
      }

      // Check if job is in final state
      if (FINAL_STATUSES.includes(jobStatus.status)) {
        stopPolling();
        
        if (jobStatus.status === 'completed') {
          uiStore.showSuccess('Job completed successfully');
          if (onComplete) {
            onComplete(jobStatus);
          }
        } else if (jobStatus.status === 'failed') {
          const errorMsg = jobStatus.error || 'Job failed';
          uiStore.showError(`Job failed: ${errorMsg}`);
          if (onError) {
            onError(new Error(errorMsg));
          }
        } else if (jobStatus.status === 'cancelled') {
          uiStore.showInfo('Job cancelled');
          // Reset cancelling state when job is confirmed cancelled
          isCancelling.value = false;
        }
      }

      // Reset retry count on success
      retryCount = 0;
      currentInterval = interval;
    } catch (err: any) {
      retryCount++;
      error.value = err;

      // Handle different error types
      if (err.response?.status === 404) {
        // Job not found - stop polling
        stopPolling();
        uiStore.showError('Job not found');
        if (onError) {
          onError(new Error('Job not found'));
        }
        return;
      }

      if (err.response?.status === 401) {
        // Authentication error - stop polling
        stopPolling();
        uiStore.showError('Authentication required');
        if (onError) {
          onError(new Error('Authentication required'));
        }
        return;
      }

      // Network or other errors - retry with exponential backoff
      if (retryCount < maxRetries) {
        currentInterval = Math.min(currentInterval * 2, 10000); // Max 10 seconds
        warn(`Polling error (retry ${retryCount}/${maxRetries}):`, err);
      } else {
        // Max retries reached - stop polling
        stopPolling();
        uiStore.showError('Failed to poll job status');
        if (onError) {
          onError(err);
        }
      }
    } finally {
      isLoading.value = false;
    }
  };

  const startPolling = () => {
    if (!jobId.value) {
      warn('Cannot start polling: job_id is null');
      return;
    }

    if (isPolling.value) {
      warn('Polling already in progress');
      return;
    }

    isPolling.value = true;
    currentInterval = interval;
    retryCount = 0;

    // Poll immediately
    poll();

    // Then poll at intervals
    pollInterval = setInterval(() => {
      poll();
    }, currentInterval);
  };

  const handleCancel = async () => {
    if (!jobId.value) {
      warn('Cannot cancel: job_id is null');
      return;
    }

    // If we have job status, check if it's cancellable
    if (job.value) {
      // Only allow cancellation of active jobs
      if (!['started', 'processing'].includes(job.value.status)) {
        uiStore.showWarning('Job cannot be cancelled in its current state');
        return;
      }
    }
    // If job.value is null (e.g., polling hasn't completed yet), we still try to cancel
    // The API will handle the validation

    // Set cancelling state and disable button
    isCancelling.value = true;

    try {
      await cancelJob(jobId.value);
      stopPolling();
      uiStore.showInfo('Cancellation request sent');
      // Poll once more to get updated status (if we have job data)
      if (job.value) {
        await poll();
      }
    } catch (err: any) {
      // Reset cancelling state on error so user can try again
      isCancelling.value = false;
      uiStore.showError(err.response?.data?.detail || 'Failed to cancel job');
      error('Error cancelling job:', err);
      throw err; // Re-throw so callers can handle it
    }
  };

  // Cleanup on unmount (only if called within a component context)
  if (getCurrentInstance()) {
    onUnmounted(() => {
      stopPolling();
    });
  }

  return {
    job,
    isLoading,
    error,
    isPolling,
    isCancelling,
    startPolling,
    stopPolling,
    cancelJob: handleCancel,
    refresh: poll,
  };
}

