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
  RepoInput,
  CreateDraftPRRequest,
  DraftPRJobStatus,
  PlanVersion,
  PlanVersionSummary,
  RevisePlanRequest,
  PlanComparison,
  PipelineStage,
  RetryJobRequest,
  ProgressResponse,
  StoryValidationResponse,
  RepoValidationRequest,
  RepoValidationResponse,
  ArtifactMetadata,
  TemplateSummary,
  TemplateResponse,
  TemplateCreateRequest,
  TemplateUpdateRequest,
  BulkCreateRequest,
  BulkApproveRequest,
  BulkResponse,
  AnalyticsStats,
  JobAnalytics,
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
  repos?: RepoInput[];
}): Promise<TicketResponse | BatchResponse> {
  // Force async_mode when repos are provided
  const hasRepos = params.repos && params.repos.length > 0;
  const response = await apiClient.axios.post<TicketResponse | BatchResponse>('/generate/single', {
    ...params,
    update_jira: false, // Always preview mode
    async_mode: hasRepos ? true : (params.async_mode ?? false),
    repos: params.repos,
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
  generate_test_cases?: boolean;
  repos?: RepoInput[];
}): Promise<TaskGenerationResponse | BatchResponse> {
  // Force async_mode when repos are provided
  const hasRepos = params.repos && params.repos.length > 0;
  const response = await apiClient.axios.post<TaskGenerationResponse | BatchResponse>('/plan/tasks/generate', {
    ...params,
    dry_run: true, // Always dry run mode
    async_mode: hasRepos ? true : (params.async_mode ?? false),
    generate_test_cases: params.generate_test_cases ?? false,
    repos: params.repos,
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
  repos?: RepoInput[];
}): Promise<StoryCoverageResponse | BatchResponse> {
  // Force async_mode when repos are provided
  const hasRepos = params.repos && params.repos.length > 0;
  const response = await apiClient.axios.post<StoryCoverageResponse | BatchResponse>('/analyze/story-coverage', {
    ...params,
    include_test_cases: params.include_test_cases ?? true,
    async_mode: hasRepos ? true : (params.async_mode ?? false),
    repos: params.repos,
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

// Draft PR Orchestrator endpoints
export async function createDraftPR(
  request: CreateDraftPRRequest
): Promise<BatchResponse> {
  const response = await apiClient.axios.post<BatchResponse>(
    '/draft-pr/create',
    request
  );
  return response.data;
}

export async function getDraftPRJob(job_id: string): Promise<DraftPRJobStatus> {
  const response = await apiClient.axios.get<DraftPRJobStatus>(
    `/draft-pr/jobs/${job_id}`
  );
  return response.data;
}

export async function getLatestPlan(job_id: string): Promise<PlanVersion> {
  const response = await apiClient.axios.get<PlanVersion>(
    `/draft-pr/jobs/${job_id}/plan`
  );
  return response.data;
}

export async function listPlanVersions(job_id: string): Promise<{ job_id: string; plans: PlanVersionSummary[] }> {
  const response = await apiClient.axios.get<{ job_id: string; plans: PlanVersionSummary[] }>(
    `/draft-pr/jobs/${job_id}/plans`
  );
  return response.data;
}

export async function getPlanVersion(
  job_id: string,
  version: number
): Promise<PlanVersion> {
  const response = await apiClient.axios.get<PlanVersion>(
    `/draft-pr/jobs/${job_id}/plans/${version}`
  );
  return response.data;
}

export async function revisePlan(
  job_id: string,
  request: RevisePlanRequest
): Promise<{ plan_version: number; plan_hash: string; changes_summary: string }> {
  const response = await apiClient.axios.post(
    `/draft-pr/jobs/${job_id}/revise-plan`,
    request
  );
  return response.data;
}

export async function comparePlans(
  job_id: string,
  from_version: number,
  to_version: number,
  format?: 'summary' | 'structured' | 'unified'
): Promise<PlanComparison> {
  const response = await apiClient.axios.get<PlanComparison>(
    `/draft-pr/jobs/${job_id}/plans/compare`,
    { params: { from_version, to_version, format: format || 'summary' } }
  );
  return response.data;
}

export async function approvePlan(
  job_id: string,
  plan_hash: string
): Promise<{ approved: boolean; plan_hash: string; stage: PipelineStage }> {
  const response = await apiClient.axios.post(
    `/draft-pr/jobs/${job_id}/approve`,
    { plan_hash }
  );
  return response.data;
}

export async function listArtifacts(job_id: string): Promise<{ artifacts: string[] }> {
  const response = await apiClient.axios.get(`/draft-pr/jobs/${job_id}/artifacts`);
  return response.data;
}

export async function getArtifact(
  job_id: string,
  artifact_type: string
): Promise<any> {
  const response = await apiClient.axios.get(
    `/draft-pr/jobs/${job_id}/artifacts/${artifact_type}`
  );
  return response.data;
}

export async function getArtifactMetadata(
  job_id: string,
  artifact_type: string
): Promise<ArtifactMetadata> {
  const response = await apiClient.axios.get<ArtifactMetadata>(
    `/draft-pr/jobs/${job_id}/artifacts/${artifact_type}/metadata`
  );
  return response.data;
}

// Retry failed draft PR job
export async function retryDraftPRJob(
  job_id: string,
  request: RetryJobRequest
): Promise<{ job_id: string; message: string }> {
  const response = await apiClient.axios.post(
    `/draft-pr/jobs/${job_id}/retry`,
    request
  );
  return response.data;
}

// Get job progress
export async function getJobProgress(job_id: string): Promise<ProgressResponse> {
  const response = await apiClient.axios.get<ProgressResponse>(
    `/draft-pr/jobs/${job_id}/progress`
  );
  return response.data;
}

// Validate story
export async function validateStory(key: string): Promise<StoryValidationResponse> {
  const response = await apiClient.axios.get<StoryValidationResponse>(
    `/validate/story/${key}`
  );
  return response.data;
}

// Validate repository
export async function validateRepo(
  request: RepoValidationRequest
): Promise<RepoValidationResponse> {
  const response = await apiClient.axios.post<RepoValidationResponse>(
    '/validate/repo',
    request
  );
  return response.data;
}

// Template endpoints
export async function listTemplates(): Promise<TemplateSummary[]> {
  const response = await apiClient.axios.get<TemplateSummary[]>(
    '/draft-pr/templates'
  );
  return response.data;
}

export async function getTemplate(template_id: string): Promise<TemplateResponse> {
  const response = await apiClient.axios.get<TemplateResponse>(
    `/draft-pr/templates/${template_id}`
  );
  return response.data;
}

export async function createTemplate(
  request: TemplateCreateRequest
): Promise<TemplateResponse> {
  const response = await apiClient.axios.post<TemplateResponse>(
    '/draft-pr/templates',
    request
  );
  return response.data;
}

export async function updateTemplate(
  template_id: string,
  request: TemplateUpdateRequest
): Promise<TemplateResponse> {
  const response = await apiClient.axios.put<TemplateResponse>(
    `/draft-pr/templates/${template_id}`,
    request
  );
  return response.data;
}

export async function deleteTemplate(template_id: string): Promise<void> {
  await apiClient.axios.delete(`/draft-pr/templates/${template_id}`);
}

// Bulk operation endpoints
export async function bulkCreateDraftPRs(
  request: BulkCreateRequest
): Promise<BulkResponse> {
  const response = await apiClient.axios.post<BulkResponse>(
    '/draft-pr/bulk/create',
    request
  );
  return response.data;
}

export async function bulkApprovePlans(
  request: BulkApproveRequest
): Promise<BulkResponse> {
  const response = await apiClient.axios.post<BulkResponse>(
    '/draft-pr/jobs/bulk/approve',
    request
  );
  return response.data;
}

export async function bulkCancelJobs(job_ids: string[]): Promise<BulkResponse> {
  // Validate input
  if (!job_ids || job_ids.length === 0) {
    throw new Error('job_ids array cannot be empty');
  }

  // Use paramsSerializer to ensure arrays are serialized as ?job_ids=id1&job_ids=id2
  // This matches FastAPI's expected format for array query parameters
  const response = await apiClient.axios.post<BulkResponse>(
    '/draft-pr/jobs/bulk/cancel',
    null,
    {
      params: { job_ids },
      paramsSerializer: (params) => {
        // Custom serializer for FastAPI array query parameters
        // FastAPI expects: ?job_ids=id1&job_ids=id2 (repeated parameter, not brackets)
        const parts: string[] = [];
        for (const [key, value] of Object.entries(params)) {
          if (Array.isArray(value)) {
            // For arrays, repeat the parameter for each value
            value.forEach((item) => {
              if (item !== null && item !== undefined && item !== '') {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
              }
            });
          } else if (value !== null && value !== undefined) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
          }
        }
        return parts.join('&');
      },
    }
  );
  return response.data;
}

// Analytics endpoints
export async function getAnalyticsStats(
  params?: {
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
  }
): Promise<AnalyticsStats> {
  const response = await apiClient.axios.get<AnalyticsStats>(
    '/draft-pr/analytics/stats',
    { params }
  );
  return response.data;
}

export async function getJobAnalytics(
  params?: {
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
  }
): Promise<JobAnalytics[]> {
  const response = await apiClient.axios.get<JobAnalytics[]>(
    '/draft-pr/analytics/jobs',
    { params }
  );
  return response.data;
}






