<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            Job Results
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            <span class="font-mono">{{ job?.job_id }}</span>
            <span v-if="job?.job_type" class="ml-2">• {{ getJobTypeLabel(job.job_type) }}</span>
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div v-if="!job?.results" class="text-center py-8 text-gray-500">
          No results available for this job
        </div>
        <div v-else class="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <pre class="text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">{{ formattedJson }}</pre>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { JobStatus } from '../types/api';
import { getJobTypeLabel } from '../utils/jobTypes';

const props = defineProps<{
  job: JobStatus | null;
}>();

defineEmits<{
  close: [];
}>();

const formattedJson = computed(() => {
  if (!props.job?.results) return '';
  try {
    return JSON.stringify(props.job.results, null, 2);
  } catch (error) {
    return String(props.job.results);
  }
});
</script>

