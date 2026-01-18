<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Draft PR Job</h1>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div class="flex items-center space-x-1">
              <span class="font-mono">{{ jobId }}</span>
              <button
                @click="copyJobId"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                :title="copiedJobId ? 'Copied!' : 'Copy job ID'"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    v-if="copiedJobId"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <span v-if="job?.story_key" class="flex items-center">
              Story: <span class="font-mono ml-1">{{ job.story_key }}</span>
            </span>
            <span v-if="progress?.current_step" class="text-gray-600">
              {{ progress.current_step }}
            </span>
            <span v-if="progress?.estimated_time_remaining" class="text-gray-500">
              ETA: {{ formatETA(progress.estimated_time_remaining) }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="handleRefresh"
            :disabled="isLoading"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
            title="Refresh job status"
          >
            <svg
              :class="['w-4 h-4', isLoading ? 'animate-spin' : '']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
              getStatusBadgeClass(job?.status)
            ]"
          >
            {{ getStatusLabel(job?.status) }}
          </span>
          <span
            v-if="currentStage"
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
              getStageBadgeClass(currentStage)
            ]"
          >
            {{ getStageLabel(currentStage) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Pipeline Progress -->
    <div class="mb-6" v-if="currentStage">
      <PipelineProgress
        :current-stage="currentStage"
        :stage-timestamps="stageTimestamps"
        :failed-stage="job?.status === 'failed' ? currentStage : null"
        :progress-data="progress"
      />
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content Area -->
      <div class="lg:col-span-2">
        <div v-if="isLoading && !job" class="py-12">
          <LoadingSkeleton type="card" :lines="5" />
        </div>

        <div v-else-if="error && !job" class="text-center py-12">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <div v-else-if="job">
          <!-- Stage View -->
          <StageView
            :stage="currentStage"
            :plan-versions="planVersions"
            :approved-plan-hash="approvedPlanHash"
            :is-yolo-mode="isYoloMode"
            :verification-status="verificationStatus"
            :pr-url="prUrl"
            :error-message="errorMessage"
            :progress-message="progressMessage"
            :branch-name="branchName"
            :is-retrying="isRetrying"
            @approve="handleApprove"
            @revise="handleRevise"
            @compare="handleCompare"
            @retry="handleRetry"
          />

          <!-- Plan Comparison Modal -->
          <div
            v-if="showComparison && comparisonFromVersion && comparisonToVersion"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            @click.self="showComparison = false"
          >
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Plan Comparison</h3>
                <button
                  @click="showComparison = false"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PlanComparisonView
                :job-id="jobId"
                :from-version="comparisonFromVersion"
                :to-version="comparisonToVersion"
                :show-actions="true"
                @view-old="handleViewOldPlan"
                @view-new="handleViewNewPlan"
                @approve-new="handleApproveNewPlan"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Plan Version Modal -->
      <PlanVersionModal
        :show="showPlanVersionModal"
        :job-id="jobId || ''"
        :version="viewingPlanVersion"
        :plan-versions="planVersionsSummary"
        :latest-version="latestPlan?.version || null"
        @close="handleClosePlanVersionModal"
        @version-change="handleVersionChange"
        @compare="handleCompareFromModal"
      />

      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="space-y-6">
          <!-- Plan Versions -->
          <PlanVersionsSidebar
            v-if="job"
            :job-id="jobId"
            :current-version="latestPlan?.version || null"
            :latest-version="latestPlan?.version || null"
            :initial-plan-versions="planVersionsSummary"
            @version-click="handleVersionClick"
            @compare-click="handleVersionCompareClick"
            @view-version="handleViewVersion"
          />

          <!-- Job Status Card -->
          <div v-if="job" class="bg-white shadow-sm rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Job Information</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Status:</span>
                <span :class="getStatusTextClass(job.status)">
                  {{ getStatusLabel(job.status) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Started:</span>
                <span class="text-gray-900">{{ formatDate(job.started_at) }}</span>
              </div>
              <div v-if="job.completed_at" class="flex justify-between">
                <span class="text-gray-500">Completed:</span>
                <span class="text-gray-900">{{ formatDate(job.completed_at) }}</span>
              </div>
            </div>
            <div v-if="canRetry" class="mt-4">
              <button
                @click="handleRetry"
                :disabled="isRetrying"
                class="w-full inline-flex justify-center items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                title="Retry the failed job from the current stage"
              >
                <span v-if="isRetrying">Retrying...</span>
                <span v-else>Retry Job</span>
              </button>
            </div>
            <div v-if="canCancel" class="mt-4">
              <button
                @click="handleCancel"
                :disabled="isCancelling"
                class="w-full inline-flex justify-center items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                title="Cancel the running job"
              >
                <span v-if="isCancelling">Cancelling...</span>
                <span v-else>Cancel Job</span>
              </button>
            </div>
          </div>

          <!-- Artifacts -->
          <ArtifactsViewer :job-id="jobId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PipelineStage, PlanVersion } from '@/types/api';
import { useDraftPRJob } from '@/composables/useDraftPRJob';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import PipelineProgress from '@/components/draft-pr/PipelineProgress.vue';
import StageView from '@/components/draft-pr/StageView.vue';
import PlanComparisonView from '@/components/draft-pr/PlanComparisonView.vue';
import PlanVersionsSidebar from '@/components/draft-pr/PlanVersionsSidebar.vue';
import PlanVersionModal from '@/components/draft-pr/PlanVersionModal.vue';
import ArtifactsViewer from '@/components/draft-pr/ArtifactsViewer.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import { formatDate } from '@/utils/dateFormat';
import { getJobTypeLabel } from '@/utils/jobTypes';
import { copyToClipboard } from '@/utils/clipboard';
import { useUIStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();

const jobId = computed(() => {
  const id = route.params.id;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return null;
  }
  return id as string;
});

const {
  job,
  currentStage,
  planVersions,
  latestPlan,
  approvedPlanHash,
  isYoloMode,
  prUrl,
  errorMessage,
  isLoading,
  error,
  isPolling,
  isCancelling,
  isRetrying,
  progress,
  startPolling,
  stopPolling,
  cancelJob,
  refresh,
  approvePlan,
  revisePlan,
  retryJob,
} = useDraftPRJob(jobId);

const showComparison = ref(false);
const comparisonFromVersion = ref<number | null>(null);
const comparisonToVersion = ref<number | null>(null);
const copiedJobId = ref(false);
const showPlanVersionModal = ref(false);
const viewingPlanVersion = ref<number | null>(null);

const canCancel = computed(() => {
  return job.value && ['started', 'processing'].includes(job.value.status);
});

const canRetry = computed(() => {
  return job.value && job.value.status === 'failed' && currentStage.value === 'FAILED';
});

const verificationStatus = computed(() => {
  // Extract verification status from job progress or results
  return job.value?.progress?.verification_status || null;
});

const progressMessage = computed(() => {
  return job.value?.progress?.message || null;
});

const branchName = computed(() => {
  const results = job.value?.results;
  if (results && typeof results === 'object') {
    const prResults = (results as any).pr_results;
    return prResults?.branch_name || null;
  }
  return null;
});

// Convert plan versions to summary format for sidebar
const planVersionsSummary = computed(() => {
  if (!planVersions.value || planVersions.value.length === 0) {
    return null;
  }
  return planVersions.value
    .filter(pv => pv && pv.version && pv.plan_hash && pv.plan_spec) // Filter invalid entries
    .map(pv => ({
      version: pv.version,
      plan_hash: pv.plan_hash,
      previous_version_hash: null, // Not available in full plan version
      generated_by: 'opencode',
      summary: pv.plan_spec?.summary || 'No summary available',
    }));
});

const stageTimestamps = computed(() => {
  // Build timestamps from plan versions and job timestamps
  const timestamps: Record<PipelineStage, string | null> = {
    CREATED: job.value?.started_at || null,
    PLANNING: null,
    WAITING_FOR_APPROVAL: null,
    REVISING: null,
    APPLYING: null,
    VERIFYING: null,
    PACKAGING: null,
    DRAFTING: null,
    COMPLETED: job.value?.completed_at || null,
    FAILED: job.value?.completed_at || null,
  };

  // Add plan version timestamps
  planVersions.value.forEach(plan => {
    if (plan.version === 1) {
      timestamps.PLANNING = plan.created_at;
      timestamps.WAITING_FOR_APPROVAL = plan.created_at;
    }
  });

  return timestamps;
});

function getStatusLabel(status?: string): string {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'processing':
    case 'started':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusTextClass(status?: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 font-medium';
    case 'failed':
      return 'text-red-600 font-medium';
    case 'processing':
    case 'started':
      return 'text-blue-600 font-medium';
    default:
      return 'text-gray-900';
  }
}

function getStageLabel(stage: PipelineStage): string {
  const labels: Record<PipelineStage, string> = {
    CREATED: 'Created',
    PLANNING: 'Planning',
    WAITING_FOR_APPROVAL: 'Waiting for Approval',
    REVISING: 'Revising',
    APPLYING: 'Applying',
    VERIFYING: 'Verifying',
    PACKAGING: 'Packaging',
    DRAFTING: 'Drafting',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[stage] || stage;
}

function getStageBadgeClass(stage: PipelineStage): string {
  switch (stage) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'WAITING_FOR_APPROVAL':
    case 'REVISING':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function formatETA(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

async function copyJobId() {
  if (!jobId.value) return;
  
  const success = await copyToClipboard(jobId.value);
  if (success) {
    copiedJobId.value = true;
    uiStore.showSuccess('Job ID copied to clipboard');
    setTimeout(() => {
      copiedJobId.value = false;
    }, 2000);
  } else {
    uiStore.showError('Failed to copy job ID');
  }
}

async function handleApprove(planHash: string) {
  if (!planHash || typeof planHash !== 'string' || planHash.trim().length === 0) {
    uiStore.showError('Invalid plan hash');
    return;
  }

  try {
    await approvePlan(planHash);
  } catch (err) {
    // Error already handled in composable
  }
}

async function handleRevise(data: any) {
  try {
    await revisePlan(data);
    // On success, the revision form will be hidden automatically when stage changes
    // The composable handles the state updates
  } catch (err) {
    // Error already handled in composable
    // Form remains open so user can retry or cancel
  }
}

function handleCompare(fromVersion: number, toVersion: number) {
  // Validate version numbers
  if (typeof fromVersion !== 'number' || typeof toVersion !== 'number' ||
      fromVersion < 1 || toVersion < 1 || fromVersion === toVersion) {
    uiStore.showError('Invalid version numbers for comparison');
    return;
  }

  comparisonFromVersion.value = fromVersion;
  comparisonToVersion.value = toVersion;
  showComparison.value = true;
}

function handleVersionClick(version: number) {
  // Validate version number
  if (typeof version !== 'number' || version < 1) {
    return;
  }

  // Could navigate to view specific version, for now just show comparison if there's a previous version
  const versions = planVersions.value;
  if (versions && versions.length > 1) {
    const currentIndex = versions.findIndex(p => p && p.version === version);
    if (currentIndex > 0 && versions[currentIndex - 1] && versions[currentIndex - 1].version) {
      handleCompare(versions[currentIndex - 1].version, version);
    } else if (currentIndex === 0 && versions.length > 1 && versions[1] && versions[1].version) {
      // If clicking on first version, compare with next version
      handleCompare(version, versions[1].version);
    }
  }
}

function handleVersionCompareClick(version: number) {
  // Validate version number
  if (typeof version !== 'number' || version < 1) {
    return;
  }

  if (latestPlan.value && latestPlan.value.version && latestPlan.value.version !== version) {
    // Compare selected version with latest
    const fromVersion = version < latestPlan.value.version ? version : latestPlan.value.version;
    const toVersion = version > latestPlan.value.version ? version : latestPlan.value.version;
    handleCompare(fromVersion, toVersion);
  }
}

function handleViewVersion(version: number) {
  // Validate version number
  if (typeof version !== 'number' || version < 1) {
    return;
  }

  viewingPlanVersion.value = version;
  showPlanVersionModal.value = true;
}

function handleVersionChange(version: number) {
  // Validate version number
  if (typeof version !== 'number' || version < 1) {
    return;
  }

  // Update the viewing version without closing the modal
  viewingPlanVersion.value = version;
}

function handleCompareFromModal(fromVersion: number, toVersion: number) {
  // Close the modal and show comparison
  showPlanVersionModal.value = false;
  handleCompare(fromVersion, toVersion);
}

function handleClosePlanVersionModal() {
  showPlanVersionModal.value = false;
  viewingPlanVersion.value = null;
}

function handleViewOldPlan() {
  showComparison.value = false;
  // Navigate to view old plan version
  if (comparisonFromVersion.value) {
    handleViewVersion(comparisonFromVersion.value);
  }
}

function handleViewNewPlan() {
  showComparison.value = false;
  // Navigate to view new plan version
  if (comparisonToVersion.value) {
    handleViewVersion(comparisonToVersion.value);
  }
}

async function handleApproveNewPlan() {
  if (latestPlan.value && latestPlan.value.plan_hash) {
    showComparison.value = false;
    await handleApprove(latestPlan.value.plan_hash);
  } else {
    uiStore.showError('Cannot approve: plan hash is missing');
  }
}

async function handleRefresh() {
  try {
    await refresh();
    uiStore.showSuccess('Job status refreshed');
  } catch (err) {
    // Error already handled in composable
  }
}

async function handleRetry() {
  try {
    await retryJob({ stage: currentStage.value || undefined });
  } catch (err) {
    // Error already handled in composable
  }
}

async function handleCancel() {
  try {
    await cancelJob();
  } catch (err) {
    // Error already handled in composable
  }
}

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'k',
    ctrl: true,
    handler: () => {
      if (latestPlan.value && latestPlan.value.plan_hash && currentStage.value === 'WAITING_FOR_APPROVAL' && !isYoloMode.value) {
        handleApprove(latestPlan.value.plan_hash);
      }
    },
    description: 'Approve plan (Ctrl+K)',
  },
  {
    key: 'r',
    ctrl: true,
    handler: () => {
      if (currentStage.value === 'WAITING_FOR_APPROVAL' && !isYoloMode.value) {
        // Trigger revise - this would need to be handled by StageView
        // For now, we'll just show a message
        uiStore.showInfo('Press the "Revise Plan" button to revise');
      }
    },
    description: 'Revise plan (Ctrl+R)',
  },
  {
    key: 'Escape',
    handler: () => {
      if (showComparison.value) {
        showComparison.value = false;
      }
    },
    description: 'Close modal (Esc)',
  },
]);

onMounted(() => {
  if (jobId.value) {
    startPolling();
  } else {
    error.value = 'Invalid job ID';
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>
