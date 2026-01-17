<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <!-- Plan Header -->
    <div class="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.plan_spec?.summary || 'No summary available' }}</h2>
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <span>Version {{ plan.version || 'N/A' }}</span>
          <div class="flex items-center space-x-1">
            <span class="font-mono text-xs">{{ shortenHash(plan.plan_hash) }}</span>
            <button
              @click="copyPlanHash"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              :title="copiedPlanHash ? 'Copied!' : 'Copy plan hash'"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  v-if="copiedPlanHash"
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
          <span>{{ formatDate(plan.created_at) }}</span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="showCompare && plan.version > 1"
          @click="$emit('compare')"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          title="Compare this plan with the previous version"
        >
          Compare
        </button>
        <button
          @click="downloadPlan"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          title="Download plan as JSON file"
        >
          Download
        </button>
      </div>
    </div>

    <!-- Scope -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Scope</h3>
      <FileTreeView 
        :files="plan.plan_spec?.scope?.files || []" 
      />
    </div>

    <!-- Happy Paths -->
    <div class="mb-6" v-if="plan.plan_spec?.happy_paths && plan.plan_spec.happy_paths.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Happy Paths</h3>
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li v-for="(path, index) in plan.plan_spec.happy_paths" :key="index">
          {{ path || 'N/A' }}
        </li>
      </ul>
    </div>

    <!-- Edge Cases -->
    <div class="mb-6" v-if="plan.plan_spec?.edge_cases && plan.plan_spec.edge_cases.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Edge Cases</h3>
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li v-for="(edgeCase, index) in plan.plan_spec.edge_cases" :key="index">
          {{ edgeCase || 'N/A' }}
        </li>
      </ul>
    </div>

    <!-- Failure Modes -->
    <div class="mb-6" v-if="plan.plan_spec?.failure_modes && plan.plan_spec.failure_modes.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Failure Modes</h3>
      <div class="space-y-3">
        <div
          v-for="(mode, index) in plan.plan_spec.failure_modes"
          :key="index"
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div class="font-medium text-gray-900 mb-1">Trigger: {{ mode?.trigger || 'N/A' }}</div>
          <div class="text-sm text-gray-700 mb-2">Impact: {{ mode?.impact || 'N/A' }}</div>
          <div class="text-sm text-gray-700">Mitigation: {{ mode?.mitigation || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Assumptions -->
    <div class="mb-6" v-if="plan.plan_spec?.assumptions && plan.plan_spec.assumptions.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Assumptions</h3>
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li v-for="(assumption, index) in plan.plan_spec.assumptions" :key="index">
          {{ assumption || 'N/A' }}
        </li>
      </ul>
    </div>

    <!-- Unknowns -->
    <div class="mb-6" v-if="plan.plan_spec?.unknowns && plan.plan_spec.unknowns.length > 0">
      <h3 class="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        Unknowns
      </h3>
      <ul class="list-disc list-inside space-y-1 text-yellow-800 bg-yellow-50 rounded-lg p-4">
        <li v-for="(unknown, index) in plan.plan_spec.unknowns" :key="index">
          {{ unknown || 'N/A' }}
        </li>
      </ul>
    </div>

    <!-- Tests -->
    <div class="mb-6" v-if="plan.plan_spec?.tests && plan.plan_spec.tests.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Tests</h3>
      <div class="space-y-2">
        <div
          v-for="(test, index) in plan.plan_spec.tests"
          :key="index"
          class="flex items-center space-x-2"
        >
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
              getTestTypeClass(test?.type || '')
            ]"
          >
            {{ test?.type || 'unknown' }}
          </span>
          <span class="text-sm text-gray-700">{{ test?.target || 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Rollback -->
    <div class="mb-6" v-if="plan.plan_spec?.rollback && plan.plan_spec.rollback.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Rollback Plan</h3>
      <ol class="list-decimal list-inside space-y-1 text-gray-700">
        <li v-for="(step, index) in plan.plan_spec.rollback" :key="index">
          {{ step || 'N/A' }}
        </li>
      </ol>
    </div>

    <!-- Cross-Repo Impacts -->
    <div class="mb-6" v-if="plan.plan_spec?.cross_repo_impacts && plan.plan_spec.cross_repo_impacts.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Cross-Repo Impacts</h3>
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li v-for="(impact, index) in plan.plan_spec.cross_repo_impacts" :key="index">
          {{ impact && typeof impact === 'object' ? JSON.stringify(impact) : (impact || 'N/A') }}
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        @click="$emit('revise')"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        title="Revise Plan (Ctrl+R)"
      >
        Revise Plan
      </button>
      <button
        @click="handleApproveClick"
        :disabled="!plan.plan_hash"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Approve Plan (Ctrl+K)"
      >
        Approve Plan
      </button>
    </div>

    <!-- Approval Confirmation Modal -->
    <ApprovalConfirmationModal
      :show="showApprovalModal"
      :plan-hash="plan.plan_hash || ''"
      :plan-summary="plan.plan_spec?.summary"
      :is-approving="isApproving"
      @confirm="handleApproveConfirm"
      @close="showApprovalModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PlanVersion } from '@/types/api';
import { formatDate } from '@/utils/dateFormat';
import { copyToClipboard } from '@/utils/clipboard';
import { useUIStore } from '@/stores/ui';
import ApprovalConfirmationModal from './ApprovalConfirmationModal.vue';
import FileTreeView from './FileTreeView.vue';

interface Props {
  plan: PlanVersion;
  showActions?: boolean;
  showCompare?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showCompare: true,
});

const emit = defineEmits<{
  approve: [];
  revise: [];
  compare: [];
}>();

const showApprovalModal = ref(false);
const isApproving = ref(false);
const copiedPlanHash = ref(false);
const uiStore = useUIStore();

function handleApproveClick() {
  if (!props.plan.plan_hash) {
    console.error('Cannot approve: plan hash is missing');
    return;
  }
  showApprovalModal.value = true;
}

function handleApproveConfirm() {
  // Prevent double-clicking
  if (isApproving.value) {
    return;
  }
  
  // Validate plan hash exists
  if (!props.plan.plan_hash) {
    console.error('Cannot approve: plan hash is missing');
    return;
  }
  
  isApproving.value = true;
  showApprovalModal.value = false;
  emit('approve');
  // Reset after a delay to allow parent to handle the approval
  // Parent should manage isApproving state, but we reset here as fallback
  setTimeout(() => {
    isApproving.value = false;
  }, 2000);
}

function shortenHash(hash: string): string {
  if (!hash || typeof hash !== 'string') return '';
  return hash.length > 12 ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}` : hash;
}

function getChangeTypeClass(change: string): string {
  const changeLower = change.toLowerCase();
  if (changeLower.includes('add')) return 'bg-green-100 text-green-800';
  if (changeLower.includes('modify') || changeLower.includes('update')) return 'bg-blue-100 text-blue-800';
  if (changeLower.includes('delete') || changeLower.includes('remove')) return 'bg-red-100 text-red-800';
  if (changeLower.includes('rename')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

function getTestTypeClass(type: string): string {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('unit')) return 'bg-blue-100 text-blue-800';
  if (typeLower.includes('integration')) return 'bg-purple-100 text-purple-800';
  if (typeLower.includes('e2e') || typeLower.includes('end-to-end')) return 'bg-indigo-100 text-indigo-800';
  return 'bg-gray-100 text-gray-800';
}

async function copyPlanHash() {
  if (!props.plan.plan_hash) return;
  
  const success = await copyToClipboard(props.plan.plan_hash);
  if (success) {
    copiedPlanHash.value = true;
    uiStore.showSuccess('Plan hash copied to clipboard');
    setTimeout(() => {
      copiedPlanHash.value = false;
    }, 2000);
  } else {
    uiStore.showError('Failed to copy plan hash');
  }
}

function downloadPlan() {
  try {
    const dataStr = JSON.stringify(props.plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const hashPrefix = props.plan.plan_hash && props.plan.plan_hash.length > 8 
      ? props.plan.plan_hash.substring(0, 8) 
      : 'unknown';
    link.download = `plan-v${props.plan.version}-${hashPrefix}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download plan:', err);
  }
}
</script>
