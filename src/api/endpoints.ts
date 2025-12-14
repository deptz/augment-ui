import apiClient from './client';
import type {
  LLMModelsResponse,
  TicketResponse,
  TaskGenerationResponse,
  StoryCoverageResponse,
  JiraUpdateRequest,
  JiraUpdateResponse,
  PromptResubmitRequest,
  PromptResubmitResponse,
  JiraCreateTicketRequest,
  JiraCreateTicketResponse,
  CreateStoryTicketRequest,
  CreateTaskRequest,
  CreateTaskResponse,
  BatchResponse,
  JobStatus,
  JobListResponse,
  JobListParams,
  PRDStorySyncRequest,
  PRDStorySyncResponse,
  SprintPlanningRequest,
  SprintPlanningResponse,
  TimelineRequest,
  TimelineResponse,
  UpdateStoryTicketRequest,
  BulkUpdateStoriesRequest,
  BulkUpdateStoriesResponse,
  BulkTicketCreationRequest,
  StoryCreationRequest,
  TaskCreationRequest,
  BulkCreationResponse,
  BulkCreateTasksRequest,
  BulkCreateTasksResponse,
  BulkCreateStoriesRequest,
  BulkCreateStoriesResponse,
} from '../types/api';

// Get available LLM models and providers
export async function getModels(): Promise<LLMModelsResponse> {
  const response = await apiClient.axios.get<LLMModelsResponse>('/models');
  return response.data;
}

// Generate description for a single ticket
export async function generateSingle(params: {
  ticket_key: string;
  llm_provider?: string;
  llm_model?: string;
  additional_context?: string;
  async_mode?: boolean;
}): Promise<TicketResponse | BatchResponse> {
  const response = await apiClient.axios.post<TicketResponse | BatchResponse>('/generate/single', {
    ...params,
    update_jira: false, // Always preview mode
    async_mode: params.async_mode ?? false,
  });
  return response.data;
}

// Generate tasks from story
export async function generateTasks(params: {
  story_keys: string[];
  epic_key: string;
  llm_provider?: string;
  llm_model?: string;
  additional_context?: string;
  async_mode?: boolean;
}): Promise<TaskGenerationResponse | BatchResponse> {
  const response = await apiClient.axios.post<TaskGenerationResponse | BatchResponse>('/plan/tasks/generate', {
    ...params,
    dry_run: true, // Always dry run mode
    async_mode: params.async_mode ?? false,
  });
  return response.data;
}

// Analyze story coverage
export async function analyzeStoryCoverage(params: {
  story_key: string;
  include_test_cases?: boolean;
  llm_provider?: string;
  llm_model?: string;
  additional_context?: string;
  async_mode?: boolean;
}): Promise<StoryCoverageResponse | BatchResponse> {
  const response = await apiClient.axios.post<StoryCoverageResponse | BatchResponse>('/analyze/story-coverage', {
    ...params,
    include_test_cases: params.include_test_cases ?? true,
    async_mode: params.async_mode ?? false,
  });
  return response.data;
}

// Update JIRA ticket
export async function updateJiraTicket(
  request: JiraUpdateRequest
): Promise<JiraUpdateResponse> {
  const response = await apiClient.axios.post<JiraUpdateResponse>('/jira/update-ticket', request);
  return response.data;
}

// Resubmit prompt for A/B testing
export async function resubmitPrompt(
  request: PromptResubmitRequest
): Promise<PromptResubmitResponse> {
  const response = await apiClient.axios.post<PromptResubmitResponse>(
    '/prompt/resubmit',
    request
  );
  return response.data;
}

// Create JIRA ticket (for tasks)
export async function createJiraTicket(
  request: JiraCreateTicketRequest
): Promise<JiraCreateTicketResponse> {
  const response = await apiClient.axios.post<JiraCreateTicketResponse>(
    '/jira/create-ticket',
    request
  );
  return response.data;
}

// Create JIRA story ticket
export async function createStoryTicket(
  request: CreateStoryTicketRequest
): Promise<JiraCreateTicketResponse> {
  const response = await apiClient.axios.post<JiraCreateTicketResponse>(
    '/jira/create-story-ticket',
    request
  );
  return response.data;
}

// Create task from story coverage suggestion
export async function createTaskFromSuggestion(
  request: CreateTaskRequest
): Promise<CreateTaskResponse> {
  const response = await apiClient.axios.post<CreateTaskResponse>(
    '/analyze/story-coverage/create-task',
    request
  );
  return response.data;
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  const response = await apiClient.axios.get('/health');
  return response.data;
}

// Job management endpoints
export async function getJobStatus(job_id: string): Promise<JobStatus> {
  const response = await apiClient.axios.get<JobStatus>(`/jobs/${job_id}`);
  return response.data;
}

export async function listJobs(params?: JobListParams): Promise<JobListResponse> {
  const response = await apiClient.axios.get<JobListResponse>('/jobs', { params });
  return response.data;
}

export async function cancelJob(job_id: string): Promise<void> {
  await apiClient.axios.delete(`/jobs/${job_id}`);
}

export async function getJobByTicket(ticket_key: string): Promise<JobStatus> {
  const response = await apiClient.axios.get<JobStatus>(`/jobs/ticket/${ticket_key}`);
  return response.data;
}

// Sync stories from PRD
export async function syncStoriesFromPRD(params: {
  epic_key?: string | null;
  prd_url?: string | null;
  dry_run?: boolean;
  async_mode?: boolean;
  existing_ticket_action?: 'skip' | 'update' | 'error';
}): Promise<PRDStorySyncResponse | BatchResponse> {
  const response = await apiClient.axios.post<PRDStorySyncResponse | BatchResponse>(
    '/plan/stories/sync-from-prd',
    {
      ...params,
      dry_run: params.dry_run ?? true, // Default to preview mode
      async_mode: params.async_mode ?? false,
      existing_ticket_action: params.existing_ticket_action ?? 'skip',
    }
  );
  return response.data;
}

// Plan epic tasks to sprints
export async function planEpicToSprints(
  params: SprintPlanningRequest
): Promise<SprintPlanningResponse | BatchResponse> {
  const response = await apiClient.axios.post<SprintPlanningResponse | BatchResponse>(
    '/sprint/plan/epic',
    {
      ...params,
      dry_run: params.dry_run ?? true, // Default to preview mode
      async_mode: params.async_mode ?? false,
      sprint_duration_days: params.sprint_duration_days ?? 14,
    }
  );
  return response.data;
}

// Create sprint timeline
export async function createSprintTimeline(
  params: TimelineRequest
): Promise<TimelineResponse | BatchResponse> {
  const response = await apiClient.axios.post<TimelineResponse | BatchResponse>(
    '/sprint/timeline',
    {
      ...params,
      dry_run: params.dry_run ?? true, // Default to preview mode
      async_mode: params.async_mode ?? false,
      sprint_duration_days: params.sprint_duration_days ?? 14,
    }
  );
  return response.data;
}

// Update a single story ticket
export async function updateStoryTicket(
  request: UpdateStoryTicketRequest
): Promise<JiraUpdateResponse> {
  const response = await apiClient.axios.post<JiraUpdateResponse>(
    '/jira/update-story-ticket',
    {
      ...request,
      update_jira: request.update_jira ?? false, // Default to preview mode
    }
  );
  return response.data;
}

// Bulk update multiple story tickets
export async function bulkUpdateStories(
  request: BulkUpdateStoriesRequest
): Promise<BulkUpdateStoriesResponse | BatchResponse> {
  const response = await apiClient.axios.post<BulkUpdateStoriesResponse | BatchResponse>(
    '/jira/bulk-update-stories',
    {
      ...request,
      dry_run: request.dry_run ?? true, // Default to preview mode
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}

// Epic bulk creation
export async function createEpicBulk(
  request: BulkTicketCreationRequest
): Promise<BulkCreationResponse | BatchResponse> {
  const response = await apiClient.axios.post<BulkCreationResponse | BatchResponse>(
    '/plan/epic/create',
    {
      ...request,
      create_tickets: request.create_tickets ?? false,
      operation_mode: request.operation_mode ?? 'hybrid',
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}

// Story bulk creation
export async function createStoriesBulk(
  request: StoryCreationRequest
): Promise<PRDStorySyncResponse | BatchResponse> {
  const response = await apiClient.axios.post<PRDStorySyncResponse | BatchResponse>(
    '/plan/stories/create',
    {
      ...request,
      create_tickets: request.create_tickets ?? false,
      story_count: request.story_count ?? 5,
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}

// Task bulk creation
export async function createTasksBulk(
  request: TaskCreationRequest
): Promise<TaskGenerationResponse | BatchResponse> {
  const response = await apiClient.axios.post<TaskGenerationResponse | BatchResponse>(
    '/plan/tasks/create',
    {
      ...request,
      create_tickets: request.create_tickets ?? false,
      tasks_per_story: request.tasks_per_story ?? 3,
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}

// Bulk create multiple task tickets
export async function bulkCreateTasks(
  request: BulkCreateTasksRequest
): Promise<BulkCreateTasksResponse | BatchResponse> {
  const response = await apiClient.axios.post<BulkCreateTasksResponse | BatchResponse>(
    '/jira/bulk-create-tasks',
    {
      ...request,
      create_tickets: request.create_tickets ?? false,
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}

// Bulk create multiple story tickets
export async function bulkCreateStories(
  request: BulkCreateStoriesRequest
): Promise<BulkCreateStoriesResponse | BatchResponse> {
  const response = await apiClient.axios.post<BulkCreateStoriesResponse | BatchResponse>(
    '/jira/bulk-create-stories',
    {
      ...request,
      create_tickets: request.create_tickets ?? false,
      async_mode: request.async_mode ?? false,
    }
  );
  return response.data;
}










