<template>
  <div class="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Bulk Operations</h3>
      <button
        v-if="selectedJobs.length > 0"
        @click="clearSelection"
        type="button"
        class="text-sm text-gray-600 hover:text-gray-800"
      >
        Clear Selection ({{ selectedJobs.length }})
      </button>
    </div>

    <div v-if="selectedJobs.length === 0" class="text-sm text-gray-500 text-center py-4">
      Select jobs from the list below to perform bulk operations
    </div>

    <div v-else class="space-y-4">
      <!-- Selected Jobs Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm font-medium text-gray-700 mb-2">
          {{ selectedJobs.length }} job{{ selectedJobs.length !== 1 ? 's' : '' }} selected
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="jobId in selectedJobs"
            :key="jobId"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            {{ jobId.substring(0, 8) }}...
            <button
              @click="removeJob(jobId)"
              type="button"
              class="ml-1 text-indigo-600 hover:text-indigo-800"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="space-y-3">
        <!-- Bulk Approve -->
        <div v-if="canBulkApprove" class="border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Bulk Approve Plans</h4>
          <p class="text-xs text-gray-500 mb-3">
            Approve plans for selected jobs that have a pending plan approval
          </p>
          <button
            @click="handleBulkApprove"
            :disabled="approving"
            type="button"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="approving">Approving...</span>
            <span v-else>Approve Plans ({{ approvableJobs.length }})</span>
          </button>
        </div>

        <!-- Bulk Cancel -->
        <div v-if="canBulkCancel" class="border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Bulk Cancel Jobs</h4>
          <p class="text-xs text-gray-500 mb-3">
            Cancel selected jobs that are currently running or queued
          </p>
          <button
            @click="handleBulkCancel"
            :disabled="cancelling"
            type="button"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="cancelling">Cancelling...</span>
            <span v-else>Cancel Jobs ({{ cancellableJobs.length }})</span>
          </button>
        </div>

        <!-- Bulk Create -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Bulk Create Jobs</h4>
          <p class="text-xs text-gray-500 mb-3">
            Create multiple draft PR jobs from a list of story keys
          </p>
          <button
            @click="showBulkCreateModal = true"
            type="button"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Open Bulk Create
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="lastResult" class="mt-4 p-4 rounded-lg" :class="lastResult.successful === lastResult.total ? 'bg-green-50' : 'bg-yellow-50'">
        <p class="text-sm font-medium" :class="lastResult.successful === lastResult.total ? 'text-green-800' : 'text-yellow-800'">
          {{ lastResult.successful }} of {{ lastResult.total }} operations succeeded
        </p>
        <p v-if="lastResult.failed > 0" class="text-xs text-yellow-700 mt-1">
          {{ lastResult.failed }} operation{{ lastResult.failed !== 1 ? 's' : '' }} failed
        </p>
      </div>
    </div>

    <!-- Bulk Create Modal -->
    <div
      v-if="showBulkCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showBulkCreateModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Bulk Create Draft PR Jobs</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Story Keys (one per line)
              </label>
              <textarea
                v-model="bulkCreateStoryKeys"
                rows="8"
                placeholder="STORY-123&#10;STORY-124&#10;STORY-125"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              />
              <p class="mt-1 text-xs text-gray-500">
                Enter one story key per line. All jobs will use the same repository and scope configuration.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Jobs
              </label>
              <input
                v-model.number="maxConcurrent"
                type="number"
                min="1"
                max="10"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">
                Maximum number of jobs to run concurrently (1-10)
              </p>
            </div>

            <div class="flex gap-2">
              <button
                @click="handleBulkCreate"
                :disabled="!canBulkCreate || creating"
                type="button"
                class="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span v-if="creating">Creating...</span>
                <span v-else>Create Jobs</span>
              </button>
              <button
                @click="showBulkCreateModal = false"
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { bulkApprovePlans, bulkCancelJobs, bulkCreateDraftPRs } from '@/api/endpoints';
import type { BulkResponse, JobStatus, CreateDraftPRRequest } from '@/types/api';
import { useUIStore } from '@/stores/ui';

interface Props {
  selectedJobs: string[];
  jobs: JobStatus[];
  defaultRepos?: Array<{ url: string; branch?: string }>;
  defaultScope?: {
    files?: string[];
    include_paths?: string[];
    exclude_paths?: string[];
  } | null;
  defaultAdditionalContext?: string;
}

interface Emits {
  (e: 'update:selectedJobs', jobs: string[]): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const uiStore = useUIStore();
const approving = ref(false);
const cancelling = ref(false);
const creating = ref(false);
const lastResult = ref<BulkResponse | null>(null);
const showBulkCreateModal = ref(false);
const bulkCreateStoryKeys = ref('');
const maxConcurrent = ref(5);

const approvableJobs = computed(() => {
  return props.selectedJobs.filter(jobId => {
    const job = props.jobs.find(j => j.job_id === jobId);
    if (!job || job.job_type !== 'draft_pr') return false;
    const draftJob = job as any;
    return draftJob.stage === 'planning_complete' && draftJob.approved_plan_hash === null;
  });
});

const cancellableJobs = computed(() => {
  return props.selectedJobs.filter(jobId => {
    const job = props.jobs.find(j => j.job_id === jobId);
    return job && (job.status === 'started' || job.status === 'processing');
  });
});

const canBulkApprove = computed(() => approvableJobs.value.length > 0);
const canBulkCancel = computed(() => cancellableJobs.value.length > 0);

const canBulkCreate = computed(() => {
  const keys = bulkCreateStoryKeys.value.trim().split('\n').filter(k => k.trim().length > 0);
  return keys.length > 0 && props.defaultRepos && props.defaultRepos.length > 0;
});

function removeJob(jobId: string) {
  emit('update:selectedJobs', props.selectedJobs.filter(id => id !== jobId));
}

function clearSelection() {
  emit('update:selectedJobs', []);
}

async function handleBulkApprove() {
  if (approvableJobs.value.length === 0) return;

  approving.value = true;
  lastResult.value = null;

  try {
    // Get plan hashes for each job
    const approvals = approvableJobs.value.map(jobId => {
      const job = props.jobs.find(j => j.job_id === jobId) as any;
      const latestPlan = job.plan_versions?.[job.plan_versions.length - 1];
      return {
        job_id: jobId,
        plan_hash: latestPlan?.plan_hash || '',
      };
    }).filter(a => a.plan_hash);

    if (approvals.length === 0) {
      uiStore.showError('No valid plans found to approve');
      return;
    }

    const result = await bulkApprovePlans({ approvals });
    lastResult.value = result;
    
    if (result.successful === result.total) {
      uiStore.showSuccess(`Successfully approved ${result.successful} plan${result.successful !== 1 ? 's' : ''}`);
    } else {
      uiStore.showWarning(`Approved ${result.successful} of ${result.total} plans`);
    }

    emit('refresh');
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to approve plans');
  } finally {
    approving.value = false;
  }
}

async function handleBulkCancel() {
  if (cancellableJobs.value.length === 0) return;

  if (!confirm(`Are you sure you want to cancel ${cancellableJobs.value.length} job(s)?`)) {
    return;
  }

  cancelling.value = true;
  lastResult.value = null;

  try {
    const result = await bulkCancelJobs(cancellableJobs.value);
    lastResult.value = result;
    
    if (result.successful === result.total) {
      uiStore.showSuccess(`Successfully cancelled ${result.successful} job${result.successful !== 1 ? 's' : ''}`);
    } else {
      uiStore.showWarning(`Cancelled ${result.successful} of ${result.total} jobs`);
    }

    emit('refresh');
    clearSelection();
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to cancel jobs');
  } finally {
    cancelling.value = false;
  }
}

async function handleBulkCreate() {
  if (!canBulkCreate.value) return;

  const storyKeys = bulkCreateStoryKeys.value
    .trim()
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (storyKeys.length === 0 || !props.defaultRepos || props.defaultRepos.length === 0) {
    uiStore.showError('Please provide story keys and ensure repositories are configured');
    return;
  }

  creating.value = true;
  lastResult.value = null;

  try {
    const jobs: CreateDraftPRRequest[] = storyKeys.map(story_key => ({
      story_key,
      repos: props.defaultRepos!,
      scope: props.defaultScope || undefined,
      additional_context: props.defaultAdditionalContext || undefined,
      mode: 'normal',
    }));

    const result = await bulkCreateDraftPRs({
      jobs,
      max_concurrent: maxConcurrent.value,
    });

    lastResult.value = result;
    showBulkCreateModal.value = false;
    bulkCreateStoryKeys.value = '';

    if (result.successful === result.total) {
      uiStore.showSuccess(`Successfully created ${result.successful} job${result.successful !== 1 ? 's' : ''}`);
    } else {
      uiStore.showWarning(`Created ${result.successful} of ${result.total} jobs`);
    }

    emit('refresh');
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to create jobs');
  } finally {
    creating.value = false;
  }
}
</script>
