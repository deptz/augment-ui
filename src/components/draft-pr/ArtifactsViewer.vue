<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Artifacts</h3>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-500">Loading artifacts...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="artifacts.length === 0" class="text-center py-8 text-gray-500">
      No artifacts available
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="artifact in artifacts"
        :key="artifact"
        class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div class="flex items-center space-x-3">
          <div :class="['p-2 rounded', getArtifactIconClass(artifact)]">
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
          <div>
            <div class="font-medium text-gray-900">{{ formatArtifactName(artifact) }}</div>
            <div class="text-sm text-gray-500">{{ getArtifactDescription(artifact) }}</div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            @click="viewArtifact(artifact)"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View
          </button>
          <button
            @click="downloadArtifact(artifact)"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listArtifacts, getArtifact } from '@/api/endpoints';

interface Props {
  jobId: string;
}

const props = defineProps<Props>();

const artifacts = ref<string[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedArtifact = ref<string | null>(null);
const artifactContent = ref<any>(null);
const artifactLoading = ref(false);
const artifactError = ref<string | null>(null);

onMounted(async () => {
  await loadArtifacts();
});

async function loadArtifacts() {
  try {
    loading.value = true;
    error.value = null;
    const response = await listArtifacts(props.jobId);
    artifacts.value = response.artifacts;
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load artifacts';
  } finally {
    loading.value = false;
  }
}

async function viewArtifact(artifact: string) {
  selectedArtifact.value = artifact;
  artifactContent.value = null;
  artifactError.value = null;
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

function closeModal() {
  selectedArtifact.value = null;
  artifactContent.value = null;
  artifactError.value = null;
}

async function downloadArtifact(artifact: string) {
  try {
    const content = await getArtifact(props.jobId, artifact);
    const dataStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: isJsonArtifact(artifact) ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact}.${isJsonArtifact(artifact) ? 'json' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to download artifact';
  }
}

function formatArtifactName(artifact: string): string {
  return artifact
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getArtifactDescription(artifact: string): string {
  const descriptions: Record<string, string> = {
    input_spec: 'Input specification for the job',
    workspace_fingerprint: 'Workspace fingerprint information',
    plan_v1: 'Plan version 1',
    plan_v2: 'Plan version 2',
    approval: 'Plan approval record',
    git_diff: 'Git diff of changes',
    validation_logs: 'Validation and test logs',
    pr_metadata: 'Pull request metadata',
  };
  return descriptions[artifact] || 'Artifact data';
}


function getArtifactIconClass(artifact: string): string {
  if (artifact.includes('plan')) {
    return 'bg-blue-100 text-blue-600';
  }
  if (artifact.includes('diff') || artifact.includes('git')) {
    return 'bg-green-100 text-green-600';
  }
  if (artifact.includes('log')) {
    return 'bg-yellow-100 text-yellow-600';
  }
  return 'bg-gray-100 text-gray-600';
}

function isJsonArtifact(artifact: string): boolean {
  return artifact.includes('plan') || artifact.includes('metadata') || artifact.includes('fingerprint') || artifact.includes('approval');
}

function formatJson(obj: any): string {
  return JSON.stringify(obj, null, 2);
}
</script>
