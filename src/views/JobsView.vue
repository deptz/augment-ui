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
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <option value="batch">Batch</option>
            <option value="single">Single</option>
            <option value="story_generation">Story Generation</option>
            <option value="task_generation">Task Generation</option>
            <option value="test_generation">Test Generation</option>
          </select>
        </div>
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
          <button
            @click="loadJobs"
            :disabled="loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
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
import { ref, onMounted } from 'vue';
import { useUIStore } from '../stores/ui';
import { listJobs, cancelJob } from '../api/endpoints';
import type { JobStatus, JobListParams } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import JobResultsModal from '../components/JobResultsModal.vue';
import { error } from '../utils/logger';

const uiStore = useUIStore();
const jobs = ref<JobStatus[]>([]);
const loading = ref(false);
const selectedJob = ref<JobStatus | null>(null);
const showResultsModal = ref(false);
const filters = ref<JobListParams>({
  status: null,
  job_type: null,
  limit: 50,
});

async function loadJobs() {
  loading.value = true;
  try {
    const response = await listJobs(filters.value);
    jobs.value = response.jobs || [];
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to load jobs');
    error('Error loading jobs:', error);
  } finally {
    loading.value = false;
  }
}

async function handleCancel(jobId: string) {
  if (!confirm('Cancel this job?')) return;

  try {
    await cancelJob(jobId);
    uiStore.showSuccess('Job cancellation requested');
    // Refresh the list
    await loadJobs();
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to cancel job');
  }
}

function handleViewResults(job: JobStatus) {
  selectedJob.value = job;
  showResultsModal.value = true;
}

onMounted(() => {
  loadJobs();
});
</script>

