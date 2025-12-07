import { describe, it, expect } from 'vitest';
import type {
  BatchResponse,
  JobStatus,
  JobStatusType,
  JobListParams,
  PRDStorySyncRequest,
  PRDStorySyncResponse,
  StoryDetail,
  TestCase,
  TaskDetail,
} from '../../src/types/api';

describe('API Types', () => {
  describe('BatchResponse', () => {
    it('should have required fields', () => {
      const batchResponse: BatchResponse = {
        job_id: 'test-job-id',
        status: 'started',
        message: 'Job started',
        status_url: '/jobs/test-job-id',
      };

      expect(batchResponse.job_id).toBe('test-job-id');
      expect(batchResponse.status).toBe('started');
      expect(batchResponse.message).toBe('Job started');
      expect(batchResponse.status_url).toBe('/jobs/test-job-id');
    });
  });

  describe('JobStatus', () => {
    it('should have required fields', () => {
      const jobStatus: JobStatus = {
        job_id: 'test-job-id',
        job_type: 'single',
        status: 'processing',
        progress: {},
        started_at: new Date().toISOString(),
        processed_tickets: 0,
        successful_tickets: 0,
        failed_tickets: 0,
      };

      expect(jobStatus.job_id).toBe('test-job-id');
      expect(jobStatus.job_type).toBe('single');
      expect(jobStatus.status).toBe('processing');
      expect(jobStatus.processed_tickets).toBe(0);
    });

    it('should support all status types', () => {
      const statuses: JobStatusType[] = ['started', 'processing', 'completed', 'failed', 'cancelled'];
      
      statuses.forEach(status => {
        const jobStatus: JobStatus = {
          job_id: 'test-job-id',
          job_type: 'single',
          status,
          progress: {},
          started_at: new Date().toISOString(),
          processed_tickets: 0,
          successful_tickets: 0,
          failed_tickets: 0,
        };

        expect(jobStatus.status).toBe(status);
      });
    });
  });

  describe('JobListParams', () => {
    it('should support optional filters', () => {
      const params: JobListParams = {
        status: 'processing',
        job_type: 'single',
        limit: 50,
      };

      expect(params.status).toBe('processing');
      expect(params.job_type).toBe('single');
      expect(params.limit).toBe(50);
    });

    it('should support null filters', () => {
      const params: JobListParams = {
        status: null,
        job_type: null,
        limit: 100,
      };

      expect(params.status).toBeNull();
      expect(params.job_type).toBeNull();
      expect(params.limit).toBe(100);
    });
  });

  describe('PRDStorySyncRequest', () => {
    it('should have optional fields', () => {
      const request: PRDStorySyncRequest = {
        epic_key: 'EPIC-123',
        prd_url: null,
        dry_run: true,
        async_mode: false,
        existing_ticket_action: 'skip',
        llm_provider: 'openai',
        llm_model: 'gpt-4',
      };

      expect(request.epic_key).toBe('EPIC-123');
      expect(request.dry_run).toBe(true);
      expect(request.existing_ticket_action).toBe('skip');
    });

    it('should support all existing_ticket_action values', () => {
      const actions: Array<'skip' | 'update' | 'error'> = ['skip', 'update', 'error'];
      
      actions.forEach(action => {
        const request: PRDStorySyncRequest = {
          existing_ticket_action: action,
        };

        expect(request.existing_ticket_action).toBe(action);
      });
    });
  });

  describe('StoryDetail', () => {
    it('should have required fields', () => {
      const storyDetail: StoryDetail = {
        summary: 'Test Story',
        description: 'Test description',
      };

      expect(storyDetail.summary).toBe('Test Story');
      expect(storyDetail.description).toBe('Test description');
    });

    it('should support optional fields', () => {
      const testCase: TestCase = {
        title: 'Test Case 1',
        type: 'acceptance',
        description: 'Test description',
        expected_result: 'Expected result',
      };

      const storyDetail: StoryDetail = {
        summary: 'Test Story',
        description: 'Test description',
        acceptance_criteria: ['Criteria 1', 'Criteria 2'],
        test_cases: [testCase],
        jira_key: 'STORY-123',
      };

      expect(storyDetail.acceptance_criteria).toHaveLength(2);
      expect(storyDetail.test_cases).toHaveLength(1);
      expect(storyDetail.jira_key).toBe('STORY-123');
    });
  });

  describe('PRDStorySyncResponse', () => {
    it('should have required fields', () => {
      const response: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {
          stories: ['STORY-1'],
        },
        story_details: [],
        errors: [],
        warnings: [],
        execution_time_seconds: 1.5,
      };

      expect(response.epic_key).toBe('EPIC-123');
      expect(response.success).toBe(true);
      expect(response.execution_time_seconds).toBe(1.5);
    });

    it('should support optional fields', () => {
      const storyDetail: StoryDetail = {
        summary: 'Test Story',
        description: 'Test description',
      };

      const taskDetail: TaskDetail = {
        summary: 'Test Task',
        purpose: 'Test purpose',
        team: 'Backend',
        depends_on_tasks: [],
        blocked_by_teams: [],
        estimated_days: 2,
        confidence_level: 0.8,
      };

      const response: PRDStorySyncResponse = {
        epic_key: 'EPIC-123',
        operation_mode: 'planning',
        success: true,
        created_tickets: {
          stories: ['STORY-1'],
          tasks: ['TASK-1'],
        },
        story_details: [storyDetail],
        task_details: [taskDetail],
        summary_stats: {
          total_stories: 1,
          total_tasks: 1,
        },
        errors: [],
        warnings: ['Warning 1'],
        execution_time_seconds: 2.0,
        system_prompt: 'System prompt',
        user_prompt: 'User prompt',
      };

      expect(response.story_details).toHaveLength(1);
      expect(response.task_details).toHaveLength(1);
      expect(response.warnings).toHaveLength(1);
      expect(response.system_prompt).toBe('System prompt');
    });
  });
});

