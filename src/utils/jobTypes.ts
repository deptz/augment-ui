export interface JobTypeDefinition {
  value: string;
  label: string;
  description: string;
}

export const JOB_TYPES: Record<string, JobTypeDefinition> = {
  batch: {
    value: 'batch',
    label: 'Batch Processing',
    description: 'Batch ticket processing'
  },
  single: {
    value: 'single',
    label: 'Single Ticket',
    description: 'Single ticket description generation'
  },
  story_coverage: {
    value: 'story_coverage',
    label: 'Story Coverage',
    description: 'Story coverage analysis'
  },
  task_generation: {
    value: 'task_generation',
    label: 'Task Generation',
    description: 'Task generation for stories'
  },
  prd_story_sync: {
    value: 'prd_story_sync',
    label: 'PRD Story Sync',
    description: 'PRD story sync operations'
  },
  sprint_planning: {
    value: 'sprint_planning',
    label: 'Sprint Planning',
    description: 'Sprint planning for epic tasks'
  },
  timeline_planning: {
    value: 'timeline_planning',
    label: 'Timeline Planning',
    description: 'Timeline schedule creation'
  },
  bulk_story_update: {
    value: 'bulk_story_update',
    label: 'Bulk Story Update',
    description: 'Bulk story update operations'
  },
  bulk_task_creation: {
    value: 'bulk_task_creation',
    label: 'Bulk Task Creation',
    description: 'Bulk task creation operations'
  },
  task_creation: {
    value: 'task_creation',
    label: 'Task Creation',
    description: 'Task creation'
  },
  story_generation: {
    value: 'story_generation',
    label: 'Story Generation',
    description: 'Story generation for epics'
  },
  test_generation: {
    value: 'test_generation',
    label: 'Test Generation',
    description: 'Test case generation'
  },
  epic_creation: {
    value: 'epic_creation',
    label: 'Epic Creation',
    description: 'Epic creation operations'
  },
  story_creation: {
    value: 'story_creation',
    label: 'Story Creation',
    description: 'Story creation operations'
  }
};

export function getJobTypeLabel(jobType: string | null | undefined): string {
  if (!jobType) return 'Unknown';
  return JOB_TYPES[jobType]?.label || jobType;
}

export function getJobTypeDescription(jobType: string | null | undefined): string {
  if (!jobType) return '';
  return JOB_TYPES[jobType]?.description || '';
}

export function getAllJobTypes(): JobTypeDefinition[] {
  return Object.values(JOB_TYPES);
}

