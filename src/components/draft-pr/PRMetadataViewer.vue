<template>
  <div class="max-h-96 overflow-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading metadata...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="metadata" class="space-y-4">
      <!-- PR Info -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">Pull Request Information</h4>
        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div v-if="metadata.pr_id">
            <dt class="text-xs font-medium text-gray-500">PR ID</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono">{{ metadata.pr_id }}</dd>
          </div>
          <div v-if="metadata.branch_name">
            <dt class="text-xs font-medium text-gray-500">Branch Name</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono">{{ metadata.branch_name }}</dd>
          </div>
          <div v-if="metadata.pr_url" class="sm:col-span-2">
            <dt class="text-xs font-medium text-gray-500">PR URL</dt>
            <dd class="mt-1">
              <a
                :href="metadata.pr_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-indigo-600 hover:text-indigo-800 break-all"
              >
                {{ metadata.pr_url }}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Repository Info -->
      <div v-if="metadata.repository" class="bg-white border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">Repository</h4>
        <dl class="grid grid-cols-1 gap-3">
          <div v-if="metadata.repository.url">
            <dt class="text-xs font-medium text-gray-500">URL</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono break-all">{{ metadata.repository.url }}</dd>
          </div>
          <div v-if="metadata.repository.branch">
            <dt class="text-xs font-medium text-gray-500">Branch</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono">{{ metadata.repository.branch }}</dd>
          </div>
        </dl>
      </div>

      <!-- Timestamps -->
      <div v-if="metadata.created_at || metadata.updated_at" class="bg-white border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">Timestamps</h4>
        <dl class="grid grid-cols-1 gap-3">
          <div v-if="metadata.created_at">
            <dt class="text-xs font-medium text-gray-500">Created At</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(metadata.created_at) }}</dd>
          </div>
          <div v-if="metadata.updated_at">
            <dt class="text-xs font-medium text-gray-500">Updated At</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(metadata.updated_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Raw JSON (collapsible) -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <button
          @click="showRawJson = !showRawJson"
          class="flex items-center justify-between w-full text-left"
        >
          <span class="text-sm font-medium text-gray-700">Raw JSON</span>
          <svg
            :class="['w-5 h-5 text-gray-500 transition-transform', showRawJson ? 'transform rotate-180' : '']"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="showRawJson" class="mt-3">
          <pre class="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">{{ JSON.stringify(metadata, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      No PR metadata available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getArtifact } from '@/api/endpoints';
import { formatDate } from '@/utils/dateFormat';

interface Props {
  jobId: string;
}

const props = defineProps<Props>();

const metadata = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showRawJson = ref(false);

onMounted(async () => {
  await loadMetadata();
});

async function loadMetadata() {
  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const content = await getArtifact(props.jobId, 'pr_metadata');
    
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      metadata.value = content;
    } else if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          metadata.value = parsed;
        } else {
          metadata.value = { content: parsed };
        }
      } catch {
        // If JSON parsing fails, treat as plain text
        metadata.value = { content };
      }
    } else if (Array.isArray(content)) {
      // If it's an array, wrap it
      metadata.value = { items: content };
    } else {
      metadata.value = null;
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load PR metadata';
    metadata.value = null;
  } finally {
    loading.value = false;
  }
}
</script>
