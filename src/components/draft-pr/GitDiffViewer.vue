<template>
  <div class="max-h-96 overflow-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading diff...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="diffContent" class="font-mono text-xs">
      <pre class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">{{ diffContent }}</pre>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      No diff content available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getArtifact } from '@/api/endpoints';

interface Props {
  jobId: string;
}

const props = defineProps<Props>();

const diffContent = ref<string | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  await loadDiff();
});

async function loadDiff() {
  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const content = await getArtifact(props.jobId, 'git_diff');
    
    // Handle both string and object responses
    if (typeof content === 'string') {
      diffContent.value = content.trim().length > 0 ? content : null;
    } else if (content && typeof content === 'object') {
      // If it's an object, try to extract diff text
      if (content.diff && typeof content.diff === 'string') {
        diffContent.value = content.diff.trim().length > 0 ? content.diff : null;
      } else if (content.content && typeof content.content === 'string') {
        diffContent.value = content.content.trim().length > 0 ? content.content : null;
      } else if (content.patch && typeof content.patch === 'string') {
        diffContent.value = content.patch.trim().length > 0 ? content.patch : null;
      } else {
        // Fallback to JSON representation
        diffContent.value = JSON.stringify(content, null, 2);
      }
    } else if (content === null || content === undefined) {
      diffContent.value = null;
    } else {
      diffContent.value = String(content);
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load git diff';
    diffContent.value = null;
  } finally {
    loading.value = false;
  }
}
</script>
