import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useJobPolling } from '../../src/composables/useJobPolling';
import * as endpoints from '../../src/api/endpoints';
import * as uiStore from '../../src/stores/ui';

// Mock the API endpoints
vi.mock('../../src/api/endpoints', () => ({
  getJobStatus: vi.fn(),
  cancelJob: vi.fn(),
}));

// Mock the UI store
vi.mock('../../src/stores/ui', () => ({
  useUIStore: vi.fn(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  })),
}));

describe('useJobPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with null job', () => {
    const jobId = ref<string | null>(null);
    const { job, isLoading, isPolling } = useJobPolling(jobId);

    expect(job.value).toBeNull();
    expect(isLoading.value).toBe(false);
    expect(isPolling.value).toBe(false);
  });

  it('should start polling when jobId is set', async () => {
    const jobId = ref<string | null>('test-job-id');
    const mockJob = {
      job_id: 'test-job-id',
      job_type: 'single',
      status: 'processing' as const,
      progress: {},
      started_at: new Date().toISOString(),
      processed_tickets: 0,
      successful_tickets: 0,
      failed_tickets: 0,
    };

    vi.mocked(endpoints.getJobStatus).mockResolvedValue(mockJob);

    const { startPolling, isPolling, stopPolling } = useJobPolling(jobId);

    startPolling();

    // Wait for initial poll
    await vi.runOnlyPendingTimersAsync();

    expect(isPolling.value).toBe(true);
    expect(endpoints.getJobStatus).toHaveBeenCalledWith('test-job-id');
    
    // Clean up to prevent infinite timers
    stopPolling();
  });

  it('should stop polling when job completes', async () => {
    const jobId = ref<string | null>('test-job-id');
    const completedJob = {
      job_id: 'test-job-id',
      job_type: 'single',
      status: 'completed' as const,
      progress: {},
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      processed_tickets: 1,
      successful_tickets: 1,
      failed_tickets: 0,
      results: { success: true },
    };

    vi.mocked(endpoints.getJobStatus).mockResolvedValue(completedJob);

    const onComplete = vi.fn();
    const { startPolling, isPolling } = useJobPolling(jobId, { onComplete });

    startPolling();

    // Wait for polling to complete
    await vi.runOnlyPendingTimersAsync();

    expect(isPolling.value).toBe(false);
    expect(onComplete).toHaveBeenCalledWith(completedJob);
  });

  it('should stop polling when job fails', async () => {
    const jobId = ref<string | null>('test-job-id');
    const failedJob = {
      job_id: 'test-job-id',
      job_type: 'single',
      status: 'failed' as const,
      progress: {},
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      processed_tickets: 0,
      successful_tickets: 0,
      failed_tickets: 0,
      error: 'Job failed',
    };

    vi.mocked(endpoints.getJobStatus).mockResolvedValue(failedJob);

    const onError = vi.fn();
    const { startPolling, isPolling } = useJobPolling(jobId, { onError });

    startPolling();

    // Wait for polling to complete
    await vi.runOnlyPendingTimersAsync();

    expect(isPolling.value).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it('should handle 404 errors by stopping polling', async () => {
    const jobId = ref<string | null>('test-job-id');
    const error = new Error('Not found');
    (error as any).response = { status: 404 };

    vi.mocked(endpoints.getJobStatus).mockRejectedValue(error);

    const { startPolling, isPolling } = useJobPolling(jobId);

    startPolling();

    // Wait for error handling
    await vi.runOnlyPendingTimersAsync();

    expect(isPolling.value).toBe(false);
  });

  it('should cancel job when cancelJob is called', async () => {
    const jobId = ref<string | null>('test-job-id');
    const activeJob = {
      job_id: 'test-job-id',
      job_type: 'single',
      status: 'processing' as const,
      progress: {},
      started_at: new Date().toISOString(),
      processed_tickets: 0,
      successful_tickets: 0,
      failed_tickets: 0,
    };

    vi.mocked(endpoints.getJobStatus).mockResolvedValue(activeJob);
    vi.mocked(endpoints.cancelJob).mockResolvedValue(undefined);

    const { startPolling, cancelJob: cancelJobFn, job } = useJobPolling(jobId);

    startPolling();
    await vi.runOnlyPendingTimersAsync();

    // Set job status
    job.value = activeJob;

    await cancelJobFn();

    expect(endpoints.cancelJob).toHaveBeenCalledWith('test-job-id');
  });
});

