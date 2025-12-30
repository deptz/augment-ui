<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Sprint Planning & Capacity (WIP)</h1>
      <p class="mt-2 text-sm text-gray-600">
        Plan epic tasks across sprints based on capacity and dependencies
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div class="space-y-6">
        <!-- Epic Key Input -->
        <div>
          <label for="epic-key" class="block text-sm font-medium text-gray-700">
            Epic Key
          </label>
          <input
            id="epic-key"
            v-model="epicKey"
            type="text"
            placeholder="e.g., EPIC-123"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handlePlan"
          />
        </div>

        <!-- Board ID Input -->
        <div>
          <label for="board-id" class="block text-sm font-medium text-gray-700">
            Board ID
          </label>
          <input
            id="board-id"
            v-model.number="boardId"
            type="number"
            placeholder="e.g., 123"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handlePlan"
          />
          <p class="mt-1 text-xs text-gray-500">
            JIRA board ID where sprints will be created/used
          </p>
        </div>

        <!-- Sprint Capacity Days -->
        <div>
          <label for="sprint-capacity" class="block text-sm font-medium text-gray-700">
            Sprint Capacity (Days) - Optional
          </label>
          <input
            id="sprint-capacity"
            v-model.number="sprintCapacityDays"
            type="number"
            placeholder="e.g., 20"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handlePlan"
          />
          <p class="mt-1 text-xs text-gray-500">
            If not provided, uses team member data for capacity calculation
          </p>
        </div>

        <!-- Start Date -->
        <div>
          <label for="start-date" class="block text-sm font-medium text-gray-700">
            Start Date (Optional)
          </label>
          <input
            id="start-date"
            v-model="startDate"
            type="date"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">
            Start date for timeline (ISO format: YYYY-MM-DD)
          </p>
        </div>

        <!-- Sprint Duration Days -->
        <div>
          <label for="sprint-duration" class="block text-sm font-medium text-gray-700">
            Sprint Duration (Days)
          </label>
          <input
            id="sprint-duration"
            v-model.number="sprintDurationDays"
            type="number"
            placeholder="14"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">Default: 14 days</p>
        </div>

        <!-- Team ID -->
        <div>
          <label for="team-id" class="block text-sm font-medium text-gray-700">
            Team ID (Optional)
          </label>
          <input
            id="team-id"
            v-model.number="teamId"
            type="number"
            placeholder="e.g., 1"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">
            Team ID for capacity calculation (optional)
          </p>
        </div>

        <!-- LLM Selector -->
        <LLMSelector />

        <!-- Options -->
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              id="dry-run"
              v-model="dryRun"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="dry-run" class="ml-2 block text-sm text-gray-900">
              Preview mode (dry run) - No JIRA updates
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="async-mode"
              v-model="asyncMode"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="async-mode" class="ml-2 block text-sm text-gray-900">
              Run in background (for long-running operations)
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="auto-create-sprints"
              v-model="autoCreateSprints"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="auto-create-sprints" class="ml-2 block text-sm text-gray-900">
              Auto-create sprints if needed
            </label>
          </div>
        </div>

        <!-- Plan Button -->
        <div>
          <button
            @click="handlePlan"
            :disabled="!epicKey || !boardId || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Plan Epic to Sprints</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Job Status (when async mode) -->
    <div v-if="jobId && !response" class="mb-6">
      <JobStatusCard
        :job="jobStatus"
        :is-loading="isPolling"
        :is-cancelling="isCancelling"
        @cancel="handleCancelJob"
        @refresh="refreshJob"
        @view-results="handleViewJobResults"
      />
    </div>

    <!-- Results -->
    <div v-if="response" class="space-y-6">
      <!-- Summary Stats -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Planning Summary</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ response.total_tasks }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Tasks</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ response.total_sprints }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Sprints</div>
          </div>
          <div class="text-center" v-if="response.sprints_created && response.sprints_created.length > 0">
            <div class="text-2xl font-bold text-green-600">{{ response.sprints_created.length }}</div>
            <div class="text-xs text-gray-500 mt-1">Sprints Created</div>
          </div>
          <div class="text-center" v-if="response.capacity_utilization">
            <div class="text-2xl font-bold text-indigo-600">
              {{ Object.keys(response.capacity_utilization).length }}
            </div>
            <div class="text-xs text-gray-500 mt-1">Sprints Planned</div>
          </div>
        </div>
      </div>

      <!-- Capacity Utilization -->
      <div v-if="response.capacity_utilization && Object.keys(response.capacity_utilization).length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Capacity Utilization</h2>
        <div class="space-y-2">
          <div
            v-for="(utilization, sprintName) in response.capacity_utilization"
            :key="sprintName"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-gray-700">{{ sprintName }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :class="utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'"
                  :style="{ width: `${Math.min(utilization, 100)}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-16 text-right">
                {{ utilization.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sprint Assignments -->
      <div v-if="response.assignments && response.assignments.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Sprint Assignments</h2>
        <div class="space-y-4">
          <div
            v-for="(assignment, index) in response.assignments"
            :key="index"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-base font-medium text-gray-900">{{ assignment.task_key }}</h3>
                <p class="text-sm text-gray-600 mt-1">Team: {{ assignment.team }}</p>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ assignment.sprint_name }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ assignment.estimated_days }} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sprints Created -->
      <div v-if="response.sprints_created && response.sprints_created.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Sprints Created</h2>
        <div class="space-y-3">
          <div
            v-for="(sprint, index) in response.sprints_created"
            :key="index"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-base font-medium text-gray-900">{{ sprint.sprint_name }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  <span v-if="sprint.start_date">{{ formatDate(sprint.start_date) }}</span>
                  <span v-if="sprint.start_date && sprint.end_date"> - </span>
                  <span v-if="sprint.end_date">{{ formatDate(sprint.end_date) }}</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">State: {{ sprint.state }}</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ID: {{ sprint.sprint_id }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="response.errors && response.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-red-800 mb-2">Errors</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(error, index) in response.errors" :key="index" class="text-sm text-red-700">
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- Warnings -->
      <div v-if="response.warnings && response.warnings.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-800 mb-2">Warnings</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(warning, index) in response.warnings" :key="index" class="text-sm text-yellow-700">
            {{ warning }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { planEpicToSprints, getJobStatus } from '../api/endpoints';
import type { SprintPlanningResponse, BatchResponse } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import LLMSelector from '../components/LLMSelector.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import { useJobPolling } from '../composables/useJobPolling';
import { useJobUrl } from '../composables/useJobUrl';
import { error } from '../utils/logger';

const modelsStore = useModelsStore();
const uiStore = useUIStore();

const epicKey = ref('');
const boardId = ref<number | null>(null);
const sprintCapacityDays = ref<number | null>(null);
const startDate = ref('');
const sprintDurationDays = ref(14);
const teamId = ref<number | null>(null);
const dryRun = ref(true);
const asyncMode = ref(true);
const autoCreateSprints = ref(false);
const loading = ref(false);
const response = ref<SprintPlanningResponse | null>(null);

// Use useJobUrl for job ID management
const { jobId, setJobId: setJobIdInUrl, removeFromUrl: removeJobIdFromUrl } = useJobUrl('jobId');

// Job polling
const { job: jobStatus, isPolling, isCancelling, startPolling, cancelJob: cancelJobPolling } = useJobPolling(
  jobId,
  {
    onComplete: async (job) => {
      if (job.results) {
        response.value = job.results as SprintPlanningResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Planning complete: ${response.value.total_tasks} tasks across ${response.value.total_sprints} sprints`);
        }
        // Don't clear job ID from URL - keep it for reference
        // Only clear the local ref to hide status card
        // Note: Form fields (epicKey, boardId, etc.) are preserved and NOT cleared
        jobId.value = null;
      }
    },
    onError: (error) => {
      error('Job polling error:', error);
    },
  }
);

// Restore job from URL on mount
onMounted(async () => {
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      if (['started', 'processing'].includes(job.status)) {
        // Job is still active, start polling
        startPolling();
      } else if (job.status === 'completed' && job.results) {
        // Job is completed, restore results
        response.value = job.results as SprintPlanningResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Planning complete: ${response.value.total_tasks} tasks across ${response.value.total_sprints} sprints`);
        }
        // Clear local ref to hide status card, but keep in URL
        // Note: Form fields (epicKey, boardId, etc.) are preserved and NOT cleared
        jobId.value = null;
      } else if (job.status === 'failed') {
        uiStore.showError(`Job failed: ${job.error || 'Unknown error'}`);
        jobId.value = null;
      } else if (job.status === 'cancelled') {
        uiStore.showInfo('Job was cancelled');
        jobId.value = null;
      }
    } catch (err: any) {
      error('Error restoring job from URL:', err);
      uiStore.showError('Failed to restore job from URL');
      removeJobIdFromUrl();
    }
  }
});

async function handlePlan() {
  if (!epicKey.value || !boardId.value) {
    uiStore.showError('Please provide both Epic Key and Board ID');
    return;
  }

  // Clear job ID from URL before starting new planning
  removeJobIdFromUrl();

  loading.value = true;
  response.value = null;

  try {
    const result = await planEpicToSprints({
      epic_key: epicKey.value,
      board_id: boardId.value,
      sprint_capacity_days: sprintCapacityDays.value || null,
      start_date: startDate.value || null,
      sprint_duration_days: sprintDurationDays.value,
      dry_run: dryRun.value,
      async_mode: asyncMode.value,
      auto_create_sprints: autoCreateSprints.value,
      team_id: teamId.value || null,
      llm_provider: modelsStore.selectedProvider || undefined,
      llm_model: modelsStore.selectedModel || undefined,
    });

    // Check if it's a BatchResponse (async mode)
    if ('job_id' in result) {
      const batchResponse = result as BatchResponse;
      setJobIdInUrl(batchResponse.job_id);
      uiStore.showInfo(`Job started: ${batchResponse.job_id}`);
      startPolling();
    } else if (result.success) {
      // Synchronous response
      response.value = result as SprintPlanningResponse;
      uiStore.showSuccess(`Planning complete: ${result.total_tasks} tasks across ${result.total_sprints} sprints`);
    } else {
      uiStore.showError('Failed to plan epic to sprints');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to plan epic to sprints');
    error('Error planning epic:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

async function handleCancelJob() {
  if (!jobId.value) {
    return;
  }
  
  try {
    await cancelJobPolling();
    // Only remove from URL if cancel was successful
    // The cancelJobPolling function handles the API call, status checks, and status updates
    removeJobIdFromUrl();
  } catch (err: any) {
    // Error is already handled in cancelJobPolling, but we don't remove from URL on error
    error('Error cancelling job:', err);
  }
}

async function refreshJob() {
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      if (job.status === 'completed' && job.results) {
        response.value = job.results as SprintPlanningResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Planning complete: ${response.value.total_tasks} tasks across ${response.value.total_sprints} sprints`);
        }
        jobId.value = null;
      }
    } catch (error: any) {
      uiStore.showError('Failed to refresh job status');
    }
  }
}

function handleViewJobResults() {
  if (jobStatus.value?.results) {
    response.value = jobStatus.value.results as SprintPlanningResponse;
    if (response.value.success) {
      uiStore.showSuccess(`Planning complete: ${response.value.total_tasks} tasks across ${response.value.total_sprints} sprints`);
    }
    jobId.value = null;
  }
}
</script>

