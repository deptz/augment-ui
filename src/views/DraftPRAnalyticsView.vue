<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Draft PR Analytics</h1>
      <p class="mt-2 text-sm text-gray-600">
        Performance metrics and insights for Draft PR jobs
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">Filters</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            id="start-date"
            v-model="filters.start_date"
            type="datetime-local"
            class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            id="end-date"
            v-model="filters.end_date"
            type="datetime-local"
            class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
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
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>
      <div class="mt-4">
        <button
          @click="loadAnalytics"
          :disabled="loading"
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Refresh Analytics</span>
        </button>
      </div>
    </div>

    <!-- Overall Statistics -->
    <div v-if="stats" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Jobs</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total_jobs }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Success Rate</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.success_rate.toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Successful</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.successful_jobs }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Failed</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.failed_jobs }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Duration Metrics -->
    <div v-if="stats" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <p class="text-sm font-medium text-gray-500 mb-1">Avg Duration</p>
        <p class="text-2xl font-semibold text-gray-900">{{ formatDuration(stats.avg_duration_seconds) }}</p>
      </div>
      <div v-if="stats.avg_planning_duration" class="bg-white shadow-sm rounded-lg p-6">
        <p class="text-sm font-medium text-gray-500 mb-1">Avg Planning</p>
        <p class="text-2xl font-semibold text-gray-900">{{ formatDuration(stats.avg_planning_duration) }}</p>
      </div>
      <div v-if="stats.avg_applying_duration" class="bg-white shadow-sm rounded-lg p-6">
        <p class="text-sm font-medium text-gray-500 mb-1">Avg Applying</p>
        <p class="text-2xl font-semibold text-gray-900">{{ formatDuration(stats.avg_applying_duration) }}</p>
      </div>
      <div v-if="stats.avg_verifying_duration" class="bg-white shadow-sm rounded-lg p-6">
        <p class="text-sm font-medium text-gray-500 mb-1">Avg Verifying</p>
        <p class="text-2xl font-semibold text-gray-900">{{ formatDuration(stats.avg_verifying_duration) }}</p>
      </div>
    </div>

    <!-- Jobs by Stage -->
    <div v-if="stats && stats.jobs_by_stage" class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Jobs by Stage</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="(count, stage) in stats.jobs_by_stage"
          :key="stage"
          class="text-center p-4 bg-gray-50 rounded-lg"
        >
          <p class="text-2xl font-semibold text-gray-900">{{ count }}</p>
          <p class="text-sm text-gray-500 capitalize">{{ stage.replace(/_/g, ' ') }}</p>
        </div>
      </div>
    </div>

    <!-- Common Failure Reasons -->
    <div v-if="stats && stats.common_failure_reasons && stats.common_failure_reasons.length > 0" class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Common Failure Reasons</h3>
      <div class="space-y-2">
        <div
          v-for="(reason, index) in stats.common_failure_reasons"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ reason.reason || reason.error || 'Unknown' }}</p>
            <p v-if="reason.count" class="text-xs text-gray-500 mt-1">
              Occurred {{ reason.count }} time{{ reason.count !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Job-Level Analytics Table -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Job-Level Analytics</h3>
      </div>
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading analytics...</p>
      </div>
      <div v-else-if="jobAnalytics.length === 0" class="text-center py-8 text-gray-500">
        No job analytics available
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Story Key
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revisions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="job in jobAnalytics"
              :key="job.job_id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                <router-link
                  :to="`/draft-pr/jobs/${job.job_id}`"
                  class="text-indigo-600 hover:text-indigo-800"
                >
                  {{ job.job_id.substring(0, 8) }}...
                </router-link>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ job.story_key || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': job.status === 'completed',
                    'bg-red-100 text-red-800': job.status === 'failed',
                    'bg-yellow-100 text-yellow-800': job.status === 'processing' || job.status === 'started',
                  }"
                >
                  {{ job.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {{ job.stage ? job.stage.replace(/_/g, ' ') : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ job.duration_seconds ? formatDuration(job.duration_seconds) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ job.plan_revisions || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAnalyticsStats, getJobAnalytics } from '@/api/endpoints';
import type { AnalyticsStats, JobAnalytics } from '@/types/api';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const stats = ref<AnalyticsStats | null>(null);
const jobAnalytics = ref<JobAnalytics[]>([]);
const loading = ref(false);
const filters = ref<{
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}>({
  start_date: null,
  end_date: null,
  status: null,
});

onMounted(async () => {
  await loadAnalytics();
});

async function loadAnalytics() {
  loading.value = true;
  try {
    const params: {
      start_date?: string | null;
      end_date?: string | null;
      status?: string | null;
    } = {};

    if (filters.value.start_date) {
      params.start_date = new Date(filters.value.start_date).toISOString();
    }
    if (filters.value.end_date) {
      params.end_date = new Date(filters.value.end_date).toISOString();
    }
    if (filters.value.status) {
      params.status = filters.value.status;
    }

    const [statsResult, jobsResult] = await Promise.all([
      getAnalyticsStats(params),
      getJobAnalytics(params),
    ]);

    stats.value = statsResult;
    jobAnalytics.value = jobsResult;
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to load analytics');
  } finally {
    loading.value = false;
  }
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return '-';
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
</script>
