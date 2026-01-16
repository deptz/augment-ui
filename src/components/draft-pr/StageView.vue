<template>
  <div class="space-y-6">
    <!-- PLANNING Stage -->
    <div v-if="stage === 'PLANNING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Generating Plan...</h3>
      <p class="text-gray-500">This may take 30-60 seconds</p>
    </div>

    <!-- WAITING_FOR_APPROVAL Stage -->
    <div v-else-if="stage === 'WAITING_FOR_APPROVAL'">
      <PlanDisplay
        v-if="latestPlan"
        :plan="latestPlan"
        :show-actions="!isYoloMode"
        :show-compare="planVersions && planVersions.length > 1"
        @approve="handleApprove"
        @revise="showRevisionForm = true"
        @compare="handleCompare"
      />
      <PlanRevisionForm
        v-if="showRevisionForm"
        @submit="handleRevise"
        @cancel="showRevisionForm = false"
      />
    </div>

    <!-- REVISING Stage -->
    <div v-else-if="stage === 'REVISING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Generating Revised Plan...</h3>
      <p class="text-gray-500">Incorporating your feedback</p>
      <div v-if="previousPlan" class="mt-6">
        <p class="text-sm text-gray-500 mb-2">Previous plan:</p>
        <PlanDisplay :plan="previousPlan" :show-actions="false" :show-compare="false" />
      </div>
    </div>

    <!-- APPLYING Stage -->
    <div v-else-if="stage === 'APPLYING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Applying Code Changes...</h3>
      <p class="text-gray-500">Implementing the approved plan</p>
      <div v-if="approvedPlan" class="mt-6 text-left">
        <p class="text-sm font-medium text-gray-700 mb-2">Approved Plan Summary:</p>
        <p class="text-sm text-gray-600">{{ approvedPlan.plan_spec.summary }}</p>
      </div>
    </div>

    <!-- VERIFYING Stage -->
    <div v-else-if="stage === 'VERIFYING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Running Verification...</h3>
      <p class="text-gray-500">Running tests, lint, and build checks</p>
      <div v-if="verificationStatus" class="mt-6 text-left bg-gray-50 rounded-lg p-4">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ verificationStatus }}</pre>
      </div>
    </div>

    <!-- PACKAGING Stage -->
    <div v-else-if="stage === 'PACKAGING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Generating PR Diff and Metadata...</h3>
      <p class="text-gray-500">Preparing the pull request</p>
    </div>

    <!-- DRAFTING Stage -->
    <div v-else-if="stage === 'DRAFTING'" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Creating Draft PR...</h3>
      <p class="text-gray-500">Finalizing the pull request</p>
    </div>

    <!-- COMPLETED Stage -->
    <div v-else-if="stage === 'COMPLETED'" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Draft PR Created Successfully!</h3>
      <div v-if="prUrl" class="mt-6">
        <a
          :href="prUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Pull Request
          <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>

    <!-- FAILED Stage -->
    <div v-else-if="stage === 'FAILED'" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Pipeline Failed</h3>
      <p v-if="errorMessage" class="text-red-600 mb-4">{{ errorMessage }}</p>
      <p class="text-gray-500">Check artifacts for more details</p>
    </div>

    <!-- Default/CREATED Stage -->
    <div v-else class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Initializing...</h3>
      <p class="text-gray-500">Setting up the pipeline</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PipelineStage, PlanVersion } from '@/types/api';
import PlanDisplay from './PlanDisplay.vue';
import PlanRevisionForm from './PlanRevisionForm.vue';

interface Props {
  stage?: PipelineStage | null;
  planVersions?: PlanVersion[] | null;
  approvedPlanHash?: string | null;
  isYoloMode?: boolean;
  verificationStatus?: string | null;
  prUrl?: string | null;
  errorMessage?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  stage: null,
  planVersions: null,
  approvedPlanHash: null,
  isYoloMode: false,
  verificationStatus: null,
  prUrl: null,
  errorMessage: null,
});

const emit = defineEmits<{
  approve: [planHash: string];
  revise: [data: any];
  compare: [fromVersion: number, toVersion: number];
}>();

const showRevisionForm = ref(false);

const latestPlan = computed<PlanVersion | null>(() => {
  if (!props.planVersions || props.planVersions.length === 0) return null;
  return props.planVersions[props.planVersions.length - 1];
});

const previousPlan = computed<PlanVersion | null>(() => {
  if (!props.planVersions || props.planVersions.length < 2) return null;
  return props.planVersions[props.planVersions.length - 2];
});

const approvedPlan = computed<PlanVersion | null>(() => {
  if (!props.approvedPlanHash || !props.planVersions) return null;
  return props.planVersions.find(p => p.plan_hash === props.approvedPlanHash) || null;
});

function handleApprove() {
  if (latestPlan.value) {
    emit('approve', latestPlan.value.plan_hash);
  }
}

function handleRevise(data: any) {
  showRevisionForm.value = false;
  emit('revise', data);
}

function handleCompare() {
  if (props.planVersions && props.planVersions.length >= 2) {
    const fromVersion = props.planVersions[props.planVersions.length - 2].version;
    const toVersion = props.planVersions[props.planVersions.length - 1].version;
    emit('compare', fromVersion, toVersion);
  }
}
</script>
