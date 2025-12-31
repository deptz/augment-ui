<template>
  <div class="bg-white shadow-sm rounded-lg p-6 border-l-4" :class="borderColorClass">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-3">
          <h3 class="text-lg font-medium text-gray-900">Job Status</h3>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div class="mt-1 text-sm text-gray-500">
          <span class="font-mono">{{ job?.job_id }}</span>
          <span v-if="job?.job_type" class="ml-2">• {{ getJobTypeLabel(job.job_type) }}</span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="canCancel"
          @click="$emit('cancel')"
          :disabled="isCancelling"
          class="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ isCancelling ? 'Cancelling...' : 'Cancel' }}
        </button>
        <button
          @click="$emit('refresh')"
          class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Ticket/Story Keys -->
    <div v-if="hasKeys" class="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
      <!-- Single Ticket Key -->
      <div v-if="job?.ticket_key" class="flex items-center gap-2">
        <span class="text-xs font-medium text-gray-500 min-w-[70px]">Ticket:</span>
        <span class="text-sm font-mono text-gray-900">{{ job.ticket_key }}</span>
      </div>
      
      <!-- Multiple Ticket Keys -->
      <div v-if="job?.ticket_keys && job.ticket_keys.length > 0" class="flex items-center gap-2">
        <span class="text-xs font-medium text-gray-500 min-w-[70px]">Tickets:</span>
        <div class="flex-1 text-sm font-mono text-gray-900">
          <template v-if="!expandedTicketKeys && job.ticket_keys.length > 3">
            {{ job.ticket_keys.slice(0, 3).join(', ') }}
            <button
              @click="expandedTicketKeys = true"
              class="ml-1 text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              +{{ job.ticket_keys.length - 3 }} more
            </button>
          </template>
          <template v-else>
            {{ job.ticket_keys.join(', ') }}
            <button
              v-if="job.ticket_keys.length > 3 && expandedTicketKeys"
              @click="expandedTicketKeys = false"
              class="ml-1 text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              show less
            </button>
          </template>
        </div>
      </div>
      
      <!-- Single Story Key -->
      <div v-if="job?.story_key" class="flex items-center gap-2">
        <span class="text-xs font-medium text-gray-500 min-w-[70px]">Story:</span>
        <span class="text-sm font-mono text-gray-900">{{ job.story_key }}</span>
      </div>
      
      <!-- Multiple Story Keys -->
      <div v-if="job?.story_keys && job.story_keys.length > 0" class="flex items-center gap-2">
        <span class="text-xs font-medium text-gray-500 min-w-[70px]">Stories:</span>
        <div class="flex-1 text-sm font-mono text-gray-900">
          <template v-if="!expandedStoryKeys && job.story_keys.length > 3">
            {{ job.story_keys.slice(0, 3).join(', ') }}
            <button
              @click="expandedStoryKeys = true"
              class="ml-1 text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              +{{ job.story_keys.length - 3 }} more
            </button>
          </template>
          <template v-else>
            {{ job.story_keys.join(', ') }}
            <button
              v-if="job.story_keys.length > 3 && expandedStoryKeys"
              @click="expandedStoryKeys = false"
              class="ml-1 text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              show less
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Progress Bar (for batch jobs) -->
    <div v-if="showProgress" class="mb-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{{ progressText }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarClass"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Statistics -->
    <div v-if="job && (job.total_tickets || job.processed_tickets > 0)" class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 mb-4">
      <div>
        <dt class="text-xs font-medium text-gray-500">Total</dt>
        <dd class="mt-1 text-lg font-semibold text-gray-900">{{ job.total_tickets ?? job.processed_tickets }}</dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500">Success</dt>
        <dd class="mt-1 text-lg font-semibold text-green-600">{{ job.successful_tickets }}</dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500">Failed</dt>
        <dd class="mt-1 text-lg font-semibold text-red-600">{{ job.failed_tickets }}</dd>
      </div>
    </div>

    <!-- Timestamps -->
    <div class="text-xs text-gray-500 space-y-1">
      <div v-if="job?.started_at">
        <span class="font-medium">Started:</span>
        {{ formatDateTime(job.started_at) }}
      </div>
      <div v-if="job?.completed_at">
        <span class="font-medium">Completed:</span>
        {{ formatDateTime(job.completed_at) }}
      </div>
      <div v-if="job?.started_at && job?.completed_at">
        <span class="font-medium">Duration:</span>
        {{ formatDuration(job.started_at, job.completed_at) }}
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="job?.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-800">
        <span class="font-medium">Error:</span> {{ job.error }}
      </p>
    </div>

    <!-- Auto-refresh info for feature pages -->
    <div v-if="props.showAutoRefreshInfo" class="mt-4 pt-3 border-t border-gray-200">
      <div class="flex items-center text-sm text-gray-500">
        <svg class="h-4 w-4 mr-2 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Auto-refreshing... No manual refresh needed</span>
      </div>
    </div>

    <!-- View Details Link (only on /jobs page) -->
    <div v-if="showViewDetails && canViewDetails" class="mt-4">
      <button
        @click="$emit('view-results')"
        class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        View Details →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { JobStatus } from '../types/api';
import { getJobTypeLabel } from '../utils/jobTypes';
import { formatDateTime, formatDuration } from '../utils/dateFormat';

const props = withDefaults(defineProps<{
  job: JobStatus | null;
  isLoading?: boolean;
  isCancelling?: boolean;
  showViewDetails?: boolean;
  showAutoRefreshInfo?: boolean;
}>(), {
  showViewDetails: false,
  showAutoRefreshInfo: false,
});

defineEmits<{
  cancel: [];
  refresh: [];
  'view-results': [];
}>();

// Expandable state for multiple keys
const expandedTicketKeys = ref(false);
const expandedStoryKeys = ref(false);

// Reset expanded state when job changes
watch(() => props.job?.job_id, () => {
  expandedTicketKeys.value = false;
  expandedStoryKeys.value = false;
});

const hasKeys = computed(() => {
  if (!props.job) return false;
  return !!(
    props.job.ticket_key ||
    (props.job.ticket_keys && props.job.ticket_keys.length > 0) ||
    props.job.story_key ||
    (props.job.story_keys && props.job.story_keys.length > 0)
  );
});

const statusLabel = computed(() => {
  if (!props.job) return 'Unknown';
  return props.job.status.charAt(0).toUpperCase() + props.job.status.slice(1);
});

const statusBadgeClass = computed(() => {
  if (!props.job) return 'bg-gray-100 text-gray-800';
  
  switch (props.job.status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'started':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const borderColorClass = computed(() => {
  if (!props.job) return 'border-gray-300';
  
  switch (props.job.status) {
    case 'completed':
      return 'border-green-500';
    case 'processing':
      return 'border-blue-500';
    case 'started':
      return 'border-yellow-500';
    case 'failed':
      return 'border-red-500';
    case 'cancelled':
      return 'border-gray-400';
    default:
      return 'border-gray-300';
  }
});

const canCancel = computed(() => {
  return props.job && ['started', 'processing'].includes(props.job.status);
});

const canViewDetails = computed(() => {
  if (!props.job) return false;
  
  // Determine if we can find a route for this job
  // Use same priority logic as getRouteForJob in JobsView
  const job = props.job;
  
  // First, try to determine from job_type (check specific patterns first)
  if (job.job_type) {
    const jobType = job.job_type.toLowerCase();
    
    // Check for story_coverage first (before generic "story" check)
    if (jobType === 'story_coverage' || jobType.includes('coverage') || jobType.includes('analyze')) {
      return true;
    }
    
    // Check for task_generation or task breakdown
    if (jobType === 'task_generation' || jobType.includes('task') || jobType.includes('breakdown')) {
      return true;
    }
    
    // Check for prd_story_sync specifically
    if (jobType === 'prd_story_sync' || (jobType.includes('prd') && jobType.includes('sync'))) {
      return true;
    }
    
    // Check for story_generation
    if (jobType === 'story_generation') {
      return true;
    }
    
    // Check for sprint_planning (be specific to avoid matching timeline_planning)
    if (jobType === 'sprint_planning' || jobType.includes('sprint')) {
      return true;
    }
    
    // Check for single ticket
    if (jobType === 'single' || jobType.includes('ticket')) {
      return true;
    }
    
    // Generic story check (must come after story_coverage check)
    if (jobType.includes('story')) {
      return true;
    }
  }

  // If job_type doesn't help, try to infer from results structure
  // Check more specific patterns first
  if (job.results && typeof job.results === 'object') {
    const results = job.results as any;
    
    // Story Coverage: has coverage_percentage (check this first)
    if (typeof results.coverage_percentage === 'number') {
      return true;
    }
    
    // Task breakdown: has task_details array
    if (results.task_details && Array.isArray(results.task_details)) {
      return true;
    }
    
    // PRD Sync: has story_details array AND epic_key
    if (results.story_details && Array.isArray(results.story_details) && results.epic_key) {
      return true;
    }
    
    // Sprint Planning: has sprints or total_sprints
    if (results.sprints || typeof results.total_sprints === 'number') {
      return true;
    }
    
    // Single Ticket: has ticket_key and generated_description
    if (results.ticket_key && results.generated_description) {
      return true;
    }
  }
  
  // Also check if we have keys that suggest a route
  if (job.ticket_key || (job.ticket_keys && job.ticket_keys.length > 0)) {
    return true; // Could be single ticket
  }
  if (job.story_key || (job.story_keys && job.story_keys.length > 0)) {
    return true; // Could be story coverage or task breakdown
  }

  return false;
});

const showProgress = computed(() => {
  return props.job && (props.job.total_tickets !== null && props.job.total_tickets !== undefined);
});

const progressPercentage = computed(() => {
  if (!props.job || !props.job.total_tickets) return 0;
  return Math.min((props.job.processed_tickets / props.job.total_tickets) * 100, 100);
});

const progressText = computed(() => {
  if (!props.job) return '0 / 0';
  const total = props.job.total_tickets ?? props.job.processed_tickets;
  return `${props.job.processed_tickets} / ${total}`;
});

const progressBarClass = computed(() => {
  if (!props.job) return 'bg-gray-400';
  
  switch (props.job.status) {
    case 'completed':
      return 'bg-green-500';
    case 'processing':
    case 'started':
      return 'bg-blue-500';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
});

</script>


