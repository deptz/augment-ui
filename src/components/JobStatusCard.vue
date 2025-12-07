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
          <span v-if="job?.job_type" class="ml-2">• {{ job.job_type }}</span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="canCancel"
          @click="$emit('cancel')"
          class="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
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
    <div v-if="job && (job.total_tickets || job.processed_tickets > 0)" class="grid grid-cols-3 gap-4 mb-4">
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
        {{ formatDate(job.started_at) }}
      </div>
      <div v-if="job?.completed_at">
        <span class="font-medium">Completed:</span>
        {{ formatDate(job.completed_at) }}
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

    <!-- Results Link -->
    <div v-if="job?.status === 'completed' && job?.results" class="mt-4">
      <button
        @click="$emit('view-results')"
        class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        View Results →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { JobStatus } from '../types/api';

const props = defineProps<{
  job: JobStatus | null;
  isLoading?: boolean;
}>();

defineEmits<{
  cancel: [];
  refresh: [];
  'view-results': [];
}>();

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

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

function formatDuration(start: string, end: string): string {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
      return `${diffMins}m ${diffSecs % 60}s`;
    } else {
      return `${diffSecs}s`;
    }
  } catch {
    return 'N/A';
  }
}
</script>


