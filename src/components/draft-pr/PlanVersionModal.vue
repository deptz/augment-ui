<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="handleClose"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="handleClose"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-semibold text-gray-900">
                Plan Version {{ plan?.version || version || 'N/A' }}
              </h3>
              <span
                v-if="plan?.plan_hash"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-200 text-gray-700"
                :title="plan.plan_hash"
              >
                {{ shortenHash(plan.plan_hash) }}
              </span>
            </div>
            <button
              @click="handleClose"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close (Esc)"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Version Navigation -->
          <div v-if="planVersions && planVersions.length > 1" class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="navigateToPrevious"
                :disabled="!hasPrevious"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous version (←)"
              >
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <select
                v-model="selectedVersion"
                @change="handleVersionSelect"
                class="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option
                  v-for="pv in planVersions"
                  :key="pv.version"
                  :value="pv.version"
                >
                  Version {{ pv.version }}
                  <span v-if="pv.summary"> - {{ pv.summary.substring(0, 30) }}...</span>
                </option>
              </select>
              
              <button
                @click="navigateToNext"
                :disabled="!hasNext"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next version (→)"
              >
                Next
                <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                v-if="plan && latestVersion && plan.version !== latestVersion"
                @click="handleCompare"
                class="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                title="Compare with latest version"
              >
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Compare
              </button>
            </div>
          </div>
          
          <!-- Breadcrumb -->
          <div v-if="planVersions && planVersions.length > 1" class="mt-2 flex items-center space-x-1 text-xs text-gray-500">
            <span>Version history:</span>
            <button
              v-for="pv in planVersions"
              :key="pv.version"
              @click="navigateToVersion(pv.version)"
              :class="[
                'px-2 py-0.5 rounded',
                pv.version === (plan?.version || version)
                  ? 'bg-indigo-100 text-indigo-800 font-medium'
                  : 'hover:bg-gray-200 text-gray-600'
              ]"
            >
              v{{ pv.version }}
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading plan details...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
            <button
              @click="loadPlan"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>

          <PlanDisplay
            v-else-if="plan"
            :plan="plan"
            :show-actions="false"
            :show-compare="false"
          />
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-xs text-gray-500">
            <span v-if="plan?.created_at">Created: {{ formatDate(plan.created_at) }}</span>
            <span v-if="plan?.created_at && planVersions && planVersions.length > 1" class="mx-2">•</span>
            <span v-if="planVersions && planVersions.length > 1">
              {{ currentVersionIndex + 1 }} of {{ planVersions.length }} versions
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              v-if="plan"
              @click="handleDownload"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              title="Download plan as JSON"
            >
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              @click="handleClose"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { getPlanVersion } from '@/api/endpoints';
import type { PlanVersion, PlanVersionSummary } from '@/types/api';
import { formatDate } from '@/utils/dateFormat';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import PlanDisplay from './PlanDisplay.vue';

interface Props {
  show: boolean;
  jobId: string;
  version: number | null;
  planVersions?: PlanVersionSummary[] | null;
  latestVersion?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  planVersions: null,
  latestVersion: null,
});

const emit = defineEmits<{
  close: [];
  versionChange: [version: number];
  compare: [fromVersion: number, toVersion: number];
}>();

const plan = ref<PlanVersion | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedVersion = ref<number | null>(null);

// Computed properties
const sortedPlanVersions = computed(() => {
  if (!props.planVersions || props.planVersions.length === 0) {
    return [];
  }
  return [...props.planVersions].sort((a, b) => b.version - a.version);
});

const currentVersionIndex = computed(() => {
  if (!sortedPlanVersions.value.length || !props.version) return -1;
  return sortedPlanVersions.value.findIndex(pv => pv.version === props.version);
});

const hasPrevious = computed(() => {
  return currentVersionIndex.value > 0;
});

const hasNext = computed(() => {
  return currentVersionIndex.value >= 0 && currentVersionIndex.value < sortedPlanVersions.value.length - 1;
});

// Watch for version changes
watch(
  () => [props.show, props.jobId, props.version],
  ([newShow, newJobId, newVersion]) => {
    if (newShow && newJobId && newVersion) {
      selectedVersion.value = newVersion;
      loadPlan();
    } else if (!newShow) {
      // Reset when modal closes
      plan.value = null;
      error.value = null;
      selectedVersion.value = null;
    }
  },
  { immediate: true }
);

async function loadPlan() {
  if (!props.jobId || !props.version || props.version < 1) {
    error.value = 'Invalid job ID or version';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    plan.value = await getPlanVersion(props.jobId, props.version);
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load plan version';
    plan.value = null;
  } finally {
    loading.value = false;
  }
}

function navigateToPrevious() {
  if (!hasPrevious.value || !sortedPlanVersions.value.length) return;
  const prevIndex = currentVersionIndex.value - 1;
  const prevVersion = sortedPlanVersions.value[prevIndex];
  if (prevVersion) {
    emit('versionChange', prevVersion.version);
  }
}

function navigateToNext() {
  if (!hasNext.value || !sortedPlanVersions.value.length) return;
  const nextIndex = currentVersionIndex.value + 1;
  const nextVersion = sortedPlanVersions.value[nextIndex];
  if (nextVersion) {
    emit('versionChange', nextVersion.version);
  }
}

function navigateToVersion(version: number) {
  emit('versionChange', version);
}

function handleVersionSelect() {
  if (selectedVersion.value) {
    emit('versionChange', selectedVersion.value);
  }
}

function handleCompare() {
  if (!plan.value || !props.latestVersion) return;
  const fromVersion = plan.value.version;
  const toVersion = props.latestVersion;
  emit('compare', fromVersion, toVersion);
}

function handleDownload() {
  if (!plan.value) return;
  
  try {
    const dataStr = JSON.stringify(plan.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const hashPrefix = plan.value.plan_hash && plan.value.plan_hash.length > 8 
      ? plan.value.plan_hash.substring(0, 8) 
      : 'unknown';
    link.download = `plan-v${plan.value.version}-${hashPrefix}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download plan:', err);
  }
}

function handleClose() {
  emit('close');
}

function shortenHash(hash: string): string {
  if (!hash || typeof hash !== 'string') return '';
  return hash.length > 12 ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}` : hash;
}

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'ArrowLeft',
    handler: () => {
      if (props.show && hasPrevious.value) {
        navigateToPrevious();
      }
    },
    description: 'Previous version',
  },
  {
    key: 'ArrowRight',
    handler: () => {
      if (props.show && hasNext.value) {
        navigateToNext();
      }
    },
    description: 'Next version',
  },
  {
    key: 'Escape',
    handler: () => {
      if (props.show) {
        handleClose();
      }
    },
    description: 'Close modal',
  },
]);
</script>
