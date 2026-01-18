<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Artifacts</h3>
      <div v-if="metadataSummary.totalCount > 0" class="text-sm text-gray-500">
        {{ sortedArtifacts.length }} of {{ metadataSummary.totalCount }}
      </div>
    </div>
    
    <!-- Metadata Summary -->
    <div v-if="!loading && !error && metadataSummary.totalCount > 0" class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-4">
          <div>
            <span class="text-gray-500">Total Size:</span>
            <span class="ml-1 font-medium text-gray-900">{{ formatArtifactSize(metadataSummary.totalSize) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Categories:</span>
            <span class="ml-1 font-medium text-gray-900">{{ metadataSummary.categories.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls: Sort and Filter -->
    <div v-if="!loading && !error && artifacts.length > 0" class="mb-4 flex items-center justify-between gap-4">
      <div class="flex items-center space-x-2 flex-1">
        <!-- Sort By -->
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Sort:</label>
          <select
            v-model="sortBy"
            class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="p-1 text-gray-500 hover:text-gray-700"
            :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'"
          >
            <svg
              v-if="sortOrder === 'asc'"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Filter by Type -->
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Filter:</label>
          <select
            v-model="filterType"
            @change="handleFilterChange"
            class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="plan">Plan</option>
            <option value="diff">Diff</option>
            <option value="log">Log</option>
            <option value="metadata">Metadata</option>
          </select>
        </div>
      </div>

        <button
        v-if="filterType"
        @click="clearAllFilters"
        class="text-sm text-indigo-600 hover:text-indigo-800"
      >
        Clear Filters
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-500">Loading artifacts...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="artifacts.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No artifacts available</h3>
      <p class="mt-1 text-sm text-gray-500">
        Artifacts will appear as the job progresses through different stages.
      </p>
      <p class="mt-1 text-xs text-gray-400">
        Common artifacts include: plan versions, git diffs, validation logs, and PR metadata.
      </p>
    </div>

    <div v-else-if="sortedArtifacts.length === 0" class="text-center py-8">
      <p class="text-gray-500">No artifacts match the current filters.</p>
      <button
        @click="clearAllFilters"
        class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
      >
        Clear Filters
      </button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="artifact in sortedArtifacts"
        :key="artifact"
        class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div :class="['p-2 rounded flex-shrink-0', getArtifactIconClass(artifact)]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="artifact.includes('plan')"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <path
                v-else-if="artifact.includes('diff') || artifact.includes('git')"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
              <path
                v-else-if="artifact.includes('log')"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <div class="font-medium text-gray-900 truncate">{{ formatArtifactName(artifact) }}</div>
              <span
                v-if="artifactMetadata[artifact]"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                :title="`Size: ${formatArtifactSize(artifactMetadata[artifact].size_bytes)}`"
              >
                {{ formatArtifactSize(artifactMetadata[artifact].size_bytes) }}
              </span>
            </div>
            <div class="text-sm text-gray-500">{{ getArtifactDescription(artifact) }}</div>
            <!-- Enhanced Metadata display -->
            <div v-if="artifactMetadata[artifact]" class="mt-1 flex items-center flex-wrap gap-2 text-xs">
              <span v-if="artifactMetadata[artifact].content_type" class="inline-flex items-center px-2 py-0.5 rounded font-mono bg-gray-100 text-gray-700">
                {{ artifactMetadata[artifact].content_type }}
              </span>
              <span v-if="artifactMetadata[artifact].created_at" class="text-gray-500">
                {{ formatArtifactDate(artifactMetadata[artifact].created_at) }}
              </span>
              <span v-if="artifactMetadata[artifact].checksum" class="text-gray-400 font-mono" :title="artifactMetadata[artifact].checksum">
                {{ artifactMetadata[artifact].checksum?.substring(0, 8) }}...
              </span>
            </div>
            <div v-else-if="metadataLoading[artifact]" class="mt-1 text-xs text-gray-400 flex items-center">
              <div class="inline-block animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
              Loading metadata...
            </div>
          </div>
        </div>
        <div class="flex space-x-2 flex-shrink-0">
          <button
            @click="viewArtifact(artifact)"
            :disabled="metadataLoading[artifact]"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View
          </button>
          <button
            @click="downloadArtifact(artifact)"
            :disabled="metadataLoading[artifact]"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- Artifact Modal -->
    <div
      v-if="selectedArtifact"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ formatArtifactName(selectedArtifact) }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Specialized viewers -->
        <GitDiffViewer
          v-if="selectedArtifact === 'git_diff'"
          :job-id="jobId"
        />
        <ValidationLogsViewer
          v-else-if="selectedArtifact === 'validation_logs'"
          :job-id="jobId"
        />
        <PRMetadataViewer
          v-else-if="selectedArtifact === 'pr_metadata'"
          :job-id="jobId"
        />
        
        <!-- Generic viewer for other artifacts -->
        <div v-else>
          <div v-if="artifactLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          
          <div v-else-if="artifactError" class="text-center py-8">
            <p class="text-red-600">{{ artifactError }}</p>
          </div>
          
          <div v-else-if="artifactContent" class="max-h-96 overflow-auto">
            <pre
              v-if="isJsonArtifact(selectedArtifact)"
              class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"
            ><code>{{ formatJson(artifactContent) }}</code></pre>
            <pre
              v-else
              class="bg-gray-50 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap"
            ><code>{{ artifactContent }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getArtifact } from '@/api/endpoints';
import { useArtifacts } from '@/composables/useArtifacts';
import {
  formatArtifactSize,
  formatArtifactDate,
  formatArtifactName,
  getArtifactDescription,
  getArtifactIconClass,
} from '@/utils/artifactHelpers';
import GitDiffViewer from './GitDiffViewer.vue';
import ValidationLogsViewer from './ValidationLogsViewer.vue';
import PRMetadataViewer from './PRMetadataViewer.vue';

interface Props {
  jobId: string;
}

const props = defineProps<Props>();

// Use the artifacts composable
const {
  artifacts,
  artifactMetadata,
  metadataLoading,
  loading,
  error,
  sortedArtifacts,
  metadataSummary,
  sortBy,
  sortOrder,
  filters,
  loadArtifacts,
  setSort,
  setFilters,
  clearFilters,
} = useArtifacts(props.jobId);

const selectedArtifact = ref<string | null>(null);
const artifactContent = ref<any>(null);
const artifactLoading = ref(false);
const artifactError = ref<string | null>(null);

// Local state for UI controls
const filterType = ref<string>('');

onMounted(async () => {
  await loadArtifacts();
});

// No watch needed - v-model updates sortBy directly, and sortedArtifacts computed
// will automatically react to the change. The toggle button uses setSort which
// handles the toggle logic properly.

function toggleSortOrder() {
  setSort(sortBy.value, sortOrder.value === 'asc' ? 'desc' : 'asc');
}

function handleFilterChange() {
  if (filterType.value) {
    setFilters({ type: filterType.value });
  } else {
    clearFilters();
  }
}

function clearAllFilters() {
  filterType.value = '';
  clearFilters();
}

async function viewArtifact(artifact: string) {
  if (!artifact || typeof artifact !== 'string' || artifact.trim().length === 0) {
    return;
  }

  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    return;
  }

  // Check metadata to optimize loading
  const metadata = artifactMetadata.value[artifact];
  if (metadata && metadata.size_bytes && metadata.size_bytes > 10 * 1024 * 1024) {
    // Warn user if artifact is large (>10MB)
    if (!confirm(`This artifact is ${formatArtifactSize(metadata.size_bytes)}. It may take a while to load. Continue?`)) {
      return;
    }
  }

  selectedArtifact.value = artifact;
  artifactContent.value = null;
  artifactError.value = null;
  
  // Only show loading for non-specialized artifacts
  if (!['git_diff', 'validation_logs', 'pr_metadata'].includes(artifact)) {
    artifactLoading.value = true;
    try {
      const content = await getArtifact(props.jobId, artifact);
      artifactContent.value = content;
    } catch (err: any) {
      artifactError.value = err.response?.data?.detail || err.message || 'Failed to load artifact';
    } finally {
      artifactLoading.value = false;
    }
  }
}

function closeModal() {
  selectedArtifact.value = null;
  artifactContent.value = null;
  artifactError.value = null;
}

async function downloadArtifact(artifact: string) {
  if (!artifact || typeof artifact !== 'string' || artifact.trim().length === 0) {
    error.value = 'Invalid artifact name';
    return;
  }

  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    return;
  }

  try {
    const content = await getArtifact(props.jobId, artifact);
    if (content === null || content === undefined) {
      error.value = 'Artifact content is empty';
      return;
    }
    
    const dataStr = typeof content === 'string' 
      ? content 
      : JSON.stringify(content, null, 2);
    
    if (!dataStr || dataStr.length === 0) {
      error.value = 'Artifact content is empty';
      return;
    }
    
    const dataBlob = new Blob([dataStr], {
      type: isJsonArtifact(artifact) ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    // Sanitize artifact name for filename
    const sanitizedName = artifact.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.download = `${sanitizedName}.${isJsonArtifact(artifact) ? 'json' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to download artifact';
  }
}

// Helper functions are now imported from artifactHelpers

function isJsonArtifact(artifact: string): boolean {
  return artifact.includes('plan') || artifact.includes('metadata') || artifact.includes('fingerprint') || artifact.includes('approval');
}

function formatJson(obj: any): string {
  return JSON.stringify(obj, null, 2);
}
</script>
