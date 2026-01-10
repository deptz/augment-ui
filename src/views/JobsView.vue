<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Background Jobs</h1>
      <p class="mt-2 text-sm text-gray-600">
        Monitor and manage background processing jobs
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <!-- Basic Filters -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Basic Filters</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              v-model="filters.status"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option :value="null">All</option>
              <option value="started">Started</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label for="job-type-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              id="job-type-filter"
              v-model="filters.job_type"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option :value="null">All</option>
              <option v-for="jobType in jobTypes" :key="jobType.value" :value="jobType.value">
                {{ jobType.label }} - {{ jobType.description }}
              </option>
            </select>
          </div>
          <div>
            <label for="job-id-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Job ID
            </label>
            <input
              id="job-id-filter"
              v-model="filters.job_id"
              type="text"
              placeholder="e.g., abc123"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="ticket-key-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Ticket Key
            </label>
            <input
              id="ticket-key-filter"
              v-model="filters.ticket_key"
              type="text"
              placeholder="e.g., PROJ-123"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="story-key-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Story Key
            </label>
            <input
              id="story-key-filter"
              v-model="filters.story_key"
              type="text"
              placeholder="e.g., STORY-123"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Sorting Controls -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Sorting</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="sort-by-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by-filter"
              v-model="filters.sort_by"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="started_at">Started At</option>
              <option value="completed_at">Completed At</option>
              <option value="status">Status</option>
              <option value="job_type">Job Type</option>
              <option value="job_id">Job ID</option>
              <option value="processed_tickets">Processed Tickets</option>
              <option value="successful_tickets">Successful Tickets</option>
              <option value="failed_tickets">Failed Tickets</option>
            </select>
          </div>
          <div>
            <label for="sort-order-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              id="sort-order-filter"
              v-model="filters.sort_order"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Pagination</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="limit-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <input
              id="limit-filter"
              v-model.number="filters.limit"
              type="number"
              min="1"
              max="200"
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div class="flex items-end">
            <div class="text-sm text-gray-600">
              Showing {{ Math.min((filters.offset || 0) + 1, responseTotal) }}-{{ Math.min((filters.offset || 0) + (filters.limit || 50), responseTotal) }} of {{ responseTotal }} jobs
            </div>
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="goToPreviousPage"
              :disabled="!hasPreviousPage || loading"
              class="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="goToNextPage"
              :disabled="!hasMore || loading"
              class="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          @click="loadJobs"
          :disabled="loading"
          class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
          <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button
          @click="clearFilters"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Jobs List -->
    <div v-if="loading && jobs.length === 0" class="text-center py-12">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-sm text-gray-500">Loading jobs...</p>
    </div>

    <div v-else-if="jobs.length === 0" class="bg-white shadow-sm rounded-lg p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or start a new job.</p>
    </div>

    <div v-else class="space-y-4">
      <JobStatusCard
        v-for="job in jobs"
        :key="job.job_id"
        :job="job"
        :is-loading="loading"
        :is-cancelling="cancellingJobIds.has(job.job_id)"
        :show-view-details="true"
        @cancel="handleCancel(job.job_id)"
        @refresh="loadJobs"
        @view-results="handleViewResults(job)"
      />
    </div>

    <!-- Job Results Modal -->
    <JobResultsModal
      v-if="showResultsModal"
      :job="selectedJob"
      @close="showResultsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../stores/ui';
import { listJobs, cancelJob } from '../api/endpoints';
import type { JobStatus, JobListParams } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import JobResultsModal from '../components/JobResultsModal.vue';
import { error } from '../utils/logger';
import { getAllJobTypes } from '../utils/jobTypes';

const router = useRouter();
const uiStore = useUIStore();
const jobs = ref<JobStatus[]>([]);
const loading = ref(false);
const selectedJob = ref<JobStatus | null>(null);
const showResultsModal = ref(false);
const cancellingJobIds = ref<Set<string>>(new Set());
const filters = ref<JobListParams>({
  status: null,
  job_type: null,
  job_id: null,
  ticket_key: null,
  story_key: null,
  sort_by: 'started_at',
  sort_order: 'desc',
  offset: 0,
  limit: 50,
});

const jobTypes = getAllJobTypes();
const responseTotal = ref(0);
const currentPage = computed(() => Math.floor((filters.value.offset || 0) / (filters.value.limit || 50)) + 1);
const totalPages = computed(() => {
  const total = responseTotal.value;
  const limit = filters.value.limit || 50;
  return Math.ceil(total / limit);
});
const hasMore = computed(() => {
  const offset = filters.value.offset || 0;
  const limit = filters.value.limit || 50;
  return offset + limit < responseTotal.value;
});
const hasPreviousPage = computed(() => (filters.value.offset || 0) > 0);

/**
 * Determine the route path based on job type or results structure
 */
function getRouteForJob(job: JobStatus): string | null {
  // First, try to determine from job_type
  // IMPORTANT: Check more specific patterns first to avoid false matches
  if (job.job_type) {
    const jobType = job.job_type.toLowerCase();
    
    // Check for story_coverage first (before generic "story" check)
    if (jobType === 'story_coverage' || jobType.includes('coverage') || jobType.includes('analyze')) {
      return '/story-coverage';
    }
    
    // Check for task_generation or task breakdown
    if (jobType === 'task_generation' || jobType.includes('task') || jobType.includes('breakdown')) {
      return '/task-breakdown';
    }
    
    // Check for prd_story_sync specifically
    if (jobType === 'prd_story_sync' || (jobType.includes('prd') && jobType.includes('sync'))) {
      return '/prd-sync';
    }
    
    // Check for story_generation (different from story_coverage)
    if (jobType === 'story_generation') {
      return '/prd-sync';
    }
    
    // Check for sprint_planning (be specific to avoid matching timeline_planning)
    if (jobType === 'sprint_planning' || jobType.includes('sprint')) {
      return '/sprint-planning';
    }
    
    // Check for single ticket
    if (jobType === 'single' || jobType.includes('ticket')) {
      return '/single-ticket';
    }
    
    // Generic story check (must come after story_coverage check)
    if (jobType.includes('story')) {
      return '/prd-sync';
    }
  }

  // If job_type doesn't help, try to infer from results structure
  // IMPORTANT: Check more specific patterns first
  if (job.results && typeof job.results === 'object') {
    const results = job.results as any;
    
    // Story Coverage: has coverage_percentage (check this first as it's most specific)
    if (typeof results.coverage_percentage === 'number') {
      return '/story-coverage';
    }
    
    // Task breakdown: has task_details array
    if (results.task_details && Array.isArray(results.task_details)) {
      return '/task-breakdown';
    }
    
    // PRD Sync: has story_details array AND epic_key (more specific check)
    if (results.story_details && Array.isArray(results.story_details) && results.epic_key) {
      return '/prd-sync';
    }
    
    // Sprint Planning: has sprints or total_sprints
    if (results.sprints || typeof results.total_sprints === 'number') {
      return '/sprint-planning';
    }
    
    // Single Ticket: has ticket_key and generated_description
    if (results.ticket_key && results.generated_description) {
      return '/single-ticket';
    }
  }

  // Default: show modal if we can't determine the route
  return null;
}

async function loadJobs() {
  loading.value = true;
  try {
    const response = await listJobs(filters.value);
    jobs.value = response.jobs || [];
    responseTotal.value = response.total || 0;
    
    // Reset cancelling state for jobs that are no longer cancellable
    jobs.value.forEach(job => {
      if (!['started', 'processing'].includes(job.status)) {
        cancellingJobIds.value.delete(job.job_id);
      }
    });
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to load jobs');
    error('Error loading jobs:', error);
  } finally {
    loading.value = false;
  }
}

function goToPreviousPage() {
  const limit = filters.value.limit || 50;
  const currentOffset = filters.value.offset || 0;
  filters.value.offset = Math.max(0, currentOffset - limit);
  loadJobs();
}

function goToNextPage() {
  const limit = filters.value.limit || 50;
  const currentOffset = filters.value.offset || 0;
  filters.value.offset = currentOffset + limit;
  loadJobs();
}

function clearFilters() {
  filters.value = {
    status: null,
    job_type: null,
    job_id: null,
    ticket_key: null,
    story_key: null,
    sort_by: 'started_at',
    sort_order: 'desc',
    offset: 0,
    limit: 50,
  };
  loadJobs();
}

// Reset offset when limit changes
watch(() => filters.value.limit, () => {
  filters.value.offset = 0;
});

async function handleCancel(jobId: string) {
  if (!confirm('Cancel this job?')) return;

  // Mark as cancelling and disable button
  cancellingJobIds.value.add(jobId);

  try {
    await cancelJob(jobId);
    uiStore.showInfo('Cancellation request sent');
    // Refresh the list
    await loadJobs();
  } catch (error: any) {
    // Remove from cancelling set on error so user can try again
    cancellingJobIds.value.delete(jobId);
    uiStore.showError(error.response?.data?.detail || 'Failed to cancel job');
  }
}

function handleViewResults(job: JobStatus) {
  // Try to navigate to the appropriate page
  const route = getRouteForJob(job);
  
  if (route) {
    // Extract form data from job to prefill forms
    const queryParams: Record<string, string> = { jobId: job.job_id };
    
    // Extract form data based on route
    if (route === '/single-ticket') {
      // Single ticket: use ticket_key from job
      if (job.ticket_key) {
        queryParams.ticketKey = job.ticket_key;
      } else if (job.results && typeof job.results === 'object') {
        const results = job.results as any;
        if (results.ticket_key) {
          queryParams.ticketKey = results.ticket_key;
        }
      }
    } else if (route === '/task-breakdown') {
      // Task breakdown: use story_key and epic_key
      if (job.story_key) {
        queryParams.storyKey = job.story_key;
      } else if (job.story_keys && job.story_keys.length > 0) {
        queryParams.storyKey = job.story_keys[0];
      }
      if (job.results && typeof job.results === 'object') {
        const results = job.results as any;
        if (results.epic_key) {
          queryParams.epicKey = results.epic_key;
        }
      }
    } else if (route === '/story-coverage') {
      // Story coverage: use story_key
      if (job.story_key) {
        queryParams.storyKey = job.story_key;
      }
    } else if (route === '/prd-sync') {
      // PRD sync: use epic_key and prd_url
      if (job.results && typeof job.results === 'object') {
        const results = job.results as any;
        if (results.epic_key) {
          queryParams.epicKey = results.epic_key;
        }
      }
      // Include PRD URL if available
      if (job.prd_url) {
        queryParams.prdUrl = job.prd_url;
      }
    } else if (route === '/sprint-planning') {
      // Sprint planning: use epic_key and board_id
      if (job.results && typeof job.results === 'object') {
        const results = job.results as any;
        if (results.epic_key) {
          queryParams.epicKey = results.epic_key;
        }
        if (results.board_id) {
          queryParams.boardId = String(results.board_id);
        }
      }
    }
    
    // Navigate to the page with job ID and form data in URL
    router.push({
      path: route,
      query: queryParams,
    });
  } else {
    // Fallback: show modal if we can't determine the route
    selectedJob.value = job;
    showResultsModal.value = true;
  }
}

onMounted(() => {
  loadJobs();
});
</script>

