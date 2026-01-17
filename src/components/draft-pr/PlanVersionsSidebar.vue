<template>
  <div class="bg-white shadow-sm rounded-lg p-4">
    <h3 class="text-sm font-medium text-gray-900 mb-3">Plan Versions</h3>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-xs text-gray-500">Loading...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-xs text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="planVersions.length === 0" class="text-center py-8">
      <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No plan versions available</h3>
      <p class="mt-1 text-xs text-gray-500">
        Plan versions will appear once the planning stage completes.
      </p>
      <p class="mt-1 text-xs text-gray-400">
        Each revision creates a new plan version that you can compare.
      </p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="plan in planVersions"
        :key="plan.version"
        :class="[
          'p-3 border rounded-lg cursor-pointer transition-colors',
          isCurrentVersion(plan.version)
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 hover:bg-gray-50'
        ]"
        @click="handleVersionClick(plan.version)"
      >
        <div class="flex items-start justify-between mb-1">
          <span class="text-sm font-medium text-gray-900">
            Version {{ plan.version }}
          </span>
          <span
            v-if="isCurrentVersion(plan.version)"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            Current
          </span>
        </div>
        <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ plan.summary || 'No summary available' }}</p>
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs text-gray-500" :title="plan.plan_hash || ''">
            {{ shortenHash(plan.plan_hash || '') }}
          </span>
          <button
            v-if="planVersions.length > 1 && !isLatestVersion(plan.version)"
            @click.stop="handleCompareClick(plan.version)"
            class="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PlanVersionSummary } from '@/types/api';
import { listPlanVersions } from '@/api/endpoints';

interface Props {
  jobId: string;
  currentVersion?: number | null;
  latestVersion?: number | null;
  initialPlanVersions?: PlanVersionSummary[] | null; // Allow passing plan versions from job status
}

const props = withDefaults(defineProps<Props>(), {
  currentVersion: null,
  latestVersion: null,
  initialPlanVersions: null,
});

const emit = defineEmits<{
  versionClick: [version: number];
  compareClick: [version: number];
}>();

const planVersions = ref<PlanVersionSummary[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  // If initial plan versions are provided, use them first, then refresh from API
  if (props.initialPlanVersions && props.initialPlanVersions.length > 0) {
    planVersions.value = [...props.initialPlanVersions].sort((a, b) => b.version - a.version);
    loading.value = false;
    // Still load from API in background to ensure we have the latest
    loadPlanVersions();
  } else {
    await loadPlanVersions();
  }
});

async function loadPlanVersions() {
  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const response = await listPlanVersions(props.jobId);
    if (response && response.plans && Array.isArray(response.plans)) {
      // Filter and validate plan versions
      planVersions.value = response.plans
        .filter(p => p && typeof p.version === 'number' && p.version >= 1 && p.plan_hash && typeof p.plan_hash === 'string')
        .sort((a, b) => b.version - a.version); // Sort descending
    } else {
      planVersions.value = [];
    }
  } catch (err: any) {
    // Only set error if we don't have initial data
    if (planVersions.value.length === 0) {
      error.value = err.response?.data?.detail || err.message || 'Failed to load plan versions';
    }
    // Log error but don't show it if we have cached data
    console.error('Failed to load plan versions:', err);
  } finally {
    loading.value = false;
  }
}

function shortenHash(hash: string): string {
  if (!hash || typeof hash !== 'string') return '';
  return hash.length > 12 ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}` : hash;
}

function isCurrentVersion(version: number): boolean {
  return props.currentVersion !== null && version === props.currentVersion;
}

function isLatestVersion(version: number): boolean {
  return props.latestVersion !== null && version === props.latestVersion;
}

function handleVersionClick(version: number) {
  if (typeof version !== 'number' || version < 1) {
    return;
  }
  emit('versionClick', version);
}

function handleCompareClick(version: number) {
  if (typeof version !== 'number' || version < 1) {
    return;
  }
  emit('compareClick', version);
}
</script>
