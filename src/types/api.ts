// API Response Types

export interface LLMModelsResponse {
  providers: string[];
  models: {
    [provider: string]: string[];
  };
  default_provider: string;
  current_config: {
    [provider: string]: string;
  };
}

export interface TicketResponse {
  ticket_key: string;
  summary: string;
  assignee_name?: string;
  parent_name?: string;
  generated_description: string;
  success: boolean;
  error?: string;
  skipped_reason?: string;
  updated_in_jira: boolean;
  system_prompt?: string;
  user_prompt?: string;
  llm_provider?: string;
  llm_model?: string;
}

export interface TaskDetail {
  task_id?: string | null; // Temporary task ID (UUID) for dependency resolution before JIRA creation
  summary: string;
  description: string;
  team: string;
  depends_on_tasks: string[];
  estimated_days: number | null;
  test_cases?: TestCase[];
  jira_key?: string | null;
  story_key?: string; // Optional story key for linking tasks to stories
}

export interface TestCase {
  title: string;
  type: string;
  description: string;
  expected_result: string;
}

export interface TaskGenerationResponse {
  epic_key: string;
  operation_mode: string;
  success: boolean;
  created_tickets?: {
    tasks: string[];
  };
  task_details: TaskDetail[];
  summary_stats: {
    total_stories: number;
    total_tasks: number;
    estimated_total_days: number;
    tasks_exceeding_limit: number;
    average_task_days: number;
  };
  errors: string[];
  warnings: string[];
  execution_time_seconds: number;
  system_prompt?: string;
  user_prompt?: string;
  llm_provider?: string;
  llm_model?: string;
}

export interface StoryCoverageGap {
  requirement: string;
  severity: string;
  suggestion: string;
}

export interface StoryCoverageTask {
  task_key: string;
  summary: string;
  description: string;
  test_cases?: string;
}

export interface UpdateSuggestion {
  task_key: string;
  current_description: string;
  current_test_cases?: string;
  suggested_description: string;
  suggested_test_cases?: string;
  ready_to_submit: {
    task_key: string;
    updated_description: string;
    updated_test_cases?: string;
    update_jira: boolean;
  };
}

export interface NewTaskSuggestion {
  summary: string;
  description: string;
  test_cases?: string;
  gap_addressed: string;
  ready_to_submit: {
    story_key: string;
    task_summary: string;
    task_description: string;
    test_cases?: string;
    create_ticket: boolean;
  };
}

export interface StoryCoverageResponse {
  success: boolean;
  story_key: string;
  story_description: string;
  tasks: StoryCoverageTask[];
  coverage_percentage: number;
  gaps: StoryCoverageGap[];
  overall_assessment: string;
  suggestions_for_updates: UpdateSuggestion[];
  suggestions_for_new_tasks: NewTaskSuggestion[];
  system_prompt?: string;
  user_prompt?: string;
  llm_provider?: string;
  llm_model?: string;
}

export interface JiraUpdateRequest {
  ticket_key: string;
  summary?: string;
  description?: string;
  test_cases?: string;
  links?: IssueLink[];
  update_jira: boolean;
}

export interface IssueLink {
  link_type: string;
  target_key: string;
  direction: 'inward' | 'outward';
}

export interface JiraUpdateResponse {
  success: boolean;
  ticket_key: string;
  updated_in_jira: boolean;
  updates_applied?: {
    [key: string]: boolean;
  };
  links_created?: Array<{
    link_type: string;
    target_key: string;
    direction: string;
    status: string;
  }>;
  preview?: any;
  message: string;
  error?: string;
}

export interface PromptResubmitRequest {
  operation_type: 'generate_single' | 'plan_tasks' | 'analyze_coverage';
  original_request: any;
  modified_system_prompt?: string;
  modified_user_prompt: string;
  llm_provider?: string;
  llm_model?: string;
}

export interface PromptResubmitResponse {
  success: boolean;
  operation_type: string;
  original_result?: any;
  new_result: any;
  prompts_used: {
    modified_system_prompt: string;
    modified_user_prompt: string;
    llm_provider: string;
    llm_model: string;
  };
  comparison_notes?: string;
  error?: string;
}

export interface JiraCreateTicketRequest {
  parent_key: string;
  summary: string;
  description: string;
  story_key: string;
  test_cases?: string;
  blocks?: string[];
  create_ticket: boolean;
}

export interface JiraCreateTicketResponse {
  success: boolean;
  ticket_key?: string | null;
  created_in_jira: boolean;
  links_created: Array<{
    link_type: string;
    target_key: string;
    direction: string;
    status: string;
  }>;
  preview?: any;
  message: string;
  error?: string;
}

export interface CreateStoryTicketRequest {
  parent_key: string;
  summary: string;
  description: string;
  test_cases?: string | null;
  create_ticket: boolean;
}

export interface CreateTaskRequest {
  story_key: string;
  task_summary: string;
  task_description: string;
  test_cases?: string | null;
  create_ticket: boolean;
}

export interface CreateTaskResponse {
  success: boolean;
  story_key: string;
  task_key?: string | null;
  created_in_jira: boolean;
  preview_summary?: string | null;
  message: string;
  error?: string;
}

// Job-related types for async/background processing
export interface BatchResponse {
  job_id: string;
  status: string;
  message: string;
  status_url: string;
  jql?: string;
  max_results?: number;
  update_jira?: boolean;
  safety_note?: string;
}

export type JobStatusType = 'started' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobStatus {
  job_id: string;
  job_type: string;
  status: JobStatusType;
  progress: Record<string, any>;
  results?: Record<string, any> | null;
  started_at: string;
  completed_at?: string | null;
  total_tickets?: number | null;
  processed_tickets: number;
  successful_tickets: number;
  failed_tickets: number;
  error?: string | null;
  ticket_key?: string | null;
  ticket_keys?: string[] | null;
}

export interface JobListResponse {
  jobs: JobStatus[];
  total: number;
}

export interface JobListParams {
  status?: JobStatusType | null;
  job_type?: string | null;
  limit?: number;
}

// PRD Story Sync types
export interface PRDStorySyncRequest {
  epic_key?: string | null;
  prd_url?: string | null;
  dry_run?: boolean;
  async_mode?: boolean;
  existing_ticket_action?: 'skip' | 'update' | 'error';
  llm_provider?: string | null;
  llm_model?: string | null;
}

export interface StoryDetail {
  summary: string;
  description: string;
  acceptance_criteria?: string[];
  test_cases?: TestCase[];
  tasks?: TaskDetail[];
  jira_key?: string | null;
}

export interface PRDStorySyncResponse {
  epic_key: string;
  operation_mode: string;
  success: boolean;
  created_tickets: {
    [key: string]: string[];
  };
  story_details: StoryDetail[];
  task_details?: TaskDetail[];
  summary_stats?: Record<string, any> | null;
  errors: string[];
  warnings: string[];
  execution_time_seconds: number;
  system_prompt?: string | null;
  user_prompt?: string | null;
  llm_provider?: string | null;
  llm_model?: string | null;
}

// Sprint Planning types
export interface SprintInfo {
  sprint_id: number;
  sprint_name: string;
  state: string;
  start_date?: string | null;
  end_date?: string | null;
  goal?: string | null;
  complete_date?: string | null;
}

export interface SprintAssignment {
  task_key: string;
  sprint_id: number;
  sprint_name: string;
  estimated_days: number;
  team: string;
}

export interface SprintPlanningRequest {
  epic_key: string;
  board_id: number;
  sprint_capacity_days?: number | null;
  start_date?: string | null;
  sprint_duration_days?: number;
  dry_run?: boolean;
  async_mode?: boolean;
  auto_create_sprints?: boolean;
  team_id?: number | null;
  llm_provider?: string | null;
  llm_model?: string | null;
}

export interface SprintPlanningResponse {
  epic_key: string;
  board_id: number;
  success: boolean;
  assignments: SprintAssignment[];
  sprints_created?: SprintInfo[];
  total_tasks: number;
  total_sprints: number;
  capacity_utilization?: Record<string, number>;
  errors: string[];
  warnings: string[];
  system_prompt?: string | null;
  user_prompt?: string | null;
  llm_provider?: string | null;
  llm_model?: string | null;
}

export interface SprintTimelineItem {
  sprint_id?: number | null;
  sprint_name: string;
  start_date: string;
  end_date: string;
  tasks: SprintAssignment[];
  total_estimated_days: number;
  capacity_days?: number | null;
  utilization_percent?: number | null;
}

export interface TimelineRequest {
  epic_key: string;
  board_id: number;
  sprint_capacity_days?: number | null;
  start_date?: string | null;
  sprint_duration_days?: number;
  dry_run?: boolean;
  async_mode?: boolean;
  team_id?: number | null;
  llm_provider?: string | null;
  llm_model?: string | null;
}

export interface TimelineResponse {
  epic_key: string;
  board_id: number;
  success: boolean;
  sprints: SprintTimelineItem[];
  total_sprints: number;
  errors: string[];
  warnings: string[];
  system_prompt?: string | null;
  user_prompt?: string | null;
  llm_provider?: string | null;
  llm_model?: string | null;
}










