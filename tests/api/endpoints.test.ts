import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getJobStatus, listJobs, cancelJob, getJobByTicket } from '../../src/api/endpoints';
import apiClient from '../../src/api/client';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  default: {
    axios: {
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Job API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getJobStatus', () => {
    it('should fetch job status', async () => {
      const mockJob = {
        job_id: 'test-job-id',
        job_type: 'single',
        status: 'processing',
        progress: {},
        started_at: new Date().toISOString(),
        processed_tickets: 0,
        successful_tickets: 0,
        failed_tickets: 0,
      };

      vi.mocked(apiClient.axios.get).mockResolvedValue({ data: mockJob });

      const result = await getJobStatus('test-job-id');

      expect(apiClient.axios.get).toHaveBeenCalledWith('/jobs/test-job-id');
      expect(result).toEqual(mockJob);
    });
  });

  describe('listJobs', () => {
    it('should list jobs without filters', async () => {
      const mockJobs = [
        {
          job_id: 'job-1',
          job_type: 'single',
          status: 'completed',
          progress: {},
          started_at: new Date().toISOString(),
          processed_tickets: 1,
          successful_tickets: 1,
          failed_tickets: 0,
        },
      ];

      vi.mocked(apiClient.axios.get).mockResolvedValue({ data: mockJobs });

      const result = await listJobs();

      expect(apiClient.axios.get).toHaveBeenCalledWith('/jobs', { params: undefined });
      expect(result).toEqual(mockJobs);
    });

    it('should list jobs with filters', async () => {
      const mockJobs: any[] = [];
      const filters = { status: 'processing' as const, limit: 10 };

      vi.mocked(apiClient.axios.get).mockResolvedValue({ data: mockJobs });

      const result = await listJobs(filters);

      expect(apiClient.axios.get).toHaveBeenCalledWith('/jobs', { params: filters });
      expect(result).toEqual(mockJobs);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a job', async () => {
      vi.mocked(apiClient.axios.delete).mockResolvedValue({ data: {} });

      await cancelJob('test-job-id');

      expect(apiClient.axios.delete).toHaveBeenCalledWith('/jobs/test-job-id');
    });
  });

  describe('getJobByTicket', () => {
    it('should get job by ticket key', async () => {
      const mockJob = {
        job_id: 'test-job-id',
        job_type: 'single',
        status: 'completed',
        progress: {},
        started_at: new Date().toISOString(),
        processed_tickets: 1,
        successful_tickets: 1,
        failed_tickets: 0,
        ticket_key: 'PROJ-123',
      };

      vi.mocked(apiClient.axios.get).mockResolvedValue({ data: mockJob });

      const result = await getJobByTicket('PROJ-123');

      expect(apiClient.axios.get).toHaveBeenCalledWith('/jobs/ticket/PROJ-123');
      expect(result).toEqual(mockJob);
    });
  });
});

