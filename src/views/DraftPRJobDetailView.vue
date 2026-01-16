<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Draft PR Job</h1>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span class="font-mono">{{ jobId }}</span>
            <span v-if="job?.story_key" class="flex items-center">
              Story: <span class="font-mono ml-1">{{ job.story_key }}</span>
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-3">
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
      />
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content Area -->
      <div class="lg:col-span-2">
        <div v-if="isLoading && !job" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-500">Loading job details...</p>
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
            @approve="handleApprove"
            @revise="handleRevise"
            @compare="handleCompare"
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

      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="space-y-6">
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
            <div v-if="canCancel" class="mt-4">
              <button
                @click="handleCancel"
                :disabled="isCancelling"
                class="w-full inline-flex justify-center items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
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
import PipelineProgress from '@/components/draft-pr/PipelineProgress.vue';
import StageView from '@/components/draft-pr/StageView.vue';
import PlanComparisonView from '@/components/draft-pr/PlanComparisonView.vue';
import ArtifactsViewer from '@/components/draft-pr/ArtifactsViewer.vue';
import { formatDate } from '@/utils/dateFormat';
import { getJobTypeLabel } from '@/utils/jobTypes';

const route = useRoute();
const router = useRouter();

const jobId = computed(() => route.params.id as string);

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
  startPolling,
  stopPolling,
  cancelJob,
  refresh,
  approvePlan,
  revisePlan,
} = useDraftPRJob(jobId);

const showComparison = ref(false);
const comparisonFromVersion = ref<number | null>(null);
const comparisonToVersion = ref<number | null>(null);

const canCancel = computed(() => {
  return job.value && ['started', 'processing'].includes(job.value.status);
});

const verificationStatus = computed(() => {
  // Extract verification status from job progress or results
  return job.value?.progress?.verification_status || null;
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

async function handleApprove(planHash: string) {
  try {
    await approvePlan(planHash);
  } catch (err) {
    // Error already handled in composable
  }
}

async function handleRevise(data: any) {
  try {
    await revisePlan(data);
  } catch (err) {
    // Error already handled in composable
  }
}

function handleCompare(fromVersion: number, toVersion: number) {
  comparisonFromVersion.value = fromVersion;
  comparisonToVersion.value = toVersion;
  showComparison.value = true;
}

function handleViewOldPlan() {
  showComparison.value = false;
  // Could navigate to view old plan version
}

function handleViewNewPlan() {
  showComparison.value = false;
  // Could navigate to view new plan version
}

async function handleApproveNewPlan() {
  if (latestPlan.value) {
    showComparison.value = false;
    await handleApprove(latestPlan.value.plan_hash);
  }
}

async function handleCancel() {
  try {
    await cancelJob();
  } catch (err) {
    // Error already handled in composable
  }
}

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>
