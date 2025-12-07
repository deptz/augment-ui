import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncStoriesFromPRD } from '../../src/api/endpoints';
import apiClient from '../../src/api/client';
import type { PRDStorySyncResponse, BatchResponse } from '../../src/types/api';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  default: {
    axios: {
      post: vi.fn(),
    },
  },
}));

describe('PRD Story Sync API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncStoriesFromPRD', () => {
    it('should sync stories with epic_key', async () => {
      const mockResponse: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {
          stories: ['STORY-1', 'STORY-2'],
        },
        story_details: [],
        errors: [],
        warnings: [],
        execution_time_seconds: 1.5,
      };

      vi.mocked(apiClient.axios.post).mockResolvedValue({ data: mockResponse });

      const result = await syncStoriesFromPRD({
        epic_key: 'EPIC-123',
        dry_run: true,
      });

      expect(apiClient.axios.post).toHaveBeenCalledWith('/plan/stories/sync-from-prd', {
        epic_key: 'EPIC-123',
        dry_run: true,
        async_mode: false,
        existing_ticket_action: 'skip',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should sync stories with prd_url', async () => {
      const mockResponse: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {
          stories: ['STORY-1'],
        },
        story_details: [],
        errors: [],
        warnings: [],
        execution_time_seconds: 1.2,
      };

      vi.mocked(apiClient.axios.post).mockResolvedValue({ data: mockResponse });

      const result = await syncStoriesFromPRD({
        prd_url: 'https://example.atlassian.net/wiki/spaces/PROJ/pages/123456789/PRD',
        dry_run: false,
        existing_ticket_action: 'update',
      });

      expect(apiClient.axios.post).toHaveBeenCalledWith('/plan/stories/sync-from-prd', {
        prd_url: 'https://example.atlassian.net/wiki/spaces/PROJ/pages/123456789/PRD',
        dry_run: false,
        async_mode: false,
        existing_ticket_action: 'update',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle async mode and return BatchResponse', async () => {
      const mockBatchResponse: BatchResponse = {
        job_id: 'job-123',
        status: 'started',
        message: 'Job started',
        status_url: '/jobs/job-123',
      };

      vi.mocked(apiClient.axios.post).mockResolvedValue({ data: mockBatchResponse });

      const result = await syncStoriesFromPRD({
        epic_key: 'EPIC-123',
        async_mode: true,
        llm_provider: 'openai',
        llm_model: 'gpt-4',
      });

      expect(apiClient.axios.post).toHaveBeenCalledWith('/plan/stories/sync-from-prd', {
        epic_key: 'EPIC-123',
        dry_run: true,
        async_mode: true,
        existing_ticket_action: 'skip',
        llm_provider: 'openai',
        llm_model: 'gpt-4',
      });
      expect(result).toEqual(mockBatchResponse);
    });

    it('should default to dry_run=true and async_mode=false', async () => {
      const mockResponse: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {},
        story_details: [],
        errors: [],
        warnings: [],
        execution_time_seconds: 1.0,
      };

      vi.mocked(apiClient.axios.post).mockResolvedValue({ data: mockResponse });

      await syncStoriesFromPRD({
        epic_key: 'EPIC-123',
      });

      expect(apiClient.axios.post).toHaveBeenCalledWith('/plan/stories/sync-from-prd', {
        epic_key: 'EPIC-123',
        dry_run: true,
        async_mode: false,
        existing_ticket_action: 'skip',
      });
    });

    it('should handle existing_ticket_action options', async () => {
      const mockResponse: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {},
        story_details: [],
        errors: [],
        warnings: [],
        execution_time_seconds: 1.0,
      };

      vi.mocked(apiClient.axios.post).mockResolvedValue({ data: mockResponse });

      await syncStoriesFromPRD({
        epic_key: 'EPIC-123',
        existing_ticket_action: 'error',
      });

      expect(apiClient.axios.post).toHaveBeenCalledWith('/plan/stories/sync-from-prd', {
        epic_key: 'EPIC-123',
        dry_run: true,
        async_mode: false,
        existing_ticket_action: 'error',
      });
    });
  });
});


