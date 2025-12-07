<template>
  <div v-if="hasPrompts" class="mt-6 border border-gray-200 rounded-lg overflow-hidden">
    <!-- Header / Toggle Button -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span class="text-sm font-medium text-gray-700">View Prompts</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Available
        </span>
      </div>
      <svg
        class="h-5 w-5 text-gray-500 transition-transform"
        :class="{ 'transform rotate-180': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="p-4 space-y-4 bg-white">
      <!-- LLM Info -->
      <div class="flex items-center space-x-4 text-sm text-gray-600">
        <div>
          <span class="font-medium">Provider:</span> {{ llmProvider || 'default' }}
        </div>
        <div>
          <span class="font-medium">Model:</span> {{ llmModel || 'default' }}
        </div>
      </div>

      <!-- System Prompt -->
      <div v-if="systemPrompt">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">System Prompt</label>
          <button
            @click="copyToClipboard(systemPrompt, 'system')"
            class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <textarea
          :value="systemPrompt"
          readonly
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-sm font-mono text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows="6"
        ></textarea>
      </div>

      <!-- User Prompt -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">User Prompt</label>
          <button
            @click="copyToClipboard(userPrompt, 'user')"
            class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <textarea
          :value="userPrompt"
          readonly
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-sm font-mono text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows="10"
        ></textarea>
      </div>

      <!-- Test Different Prompt Button -->
      <div class="pt-2">
        <button
          @click="$emit('test-prompt')"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Test Different Prompt (A/B Testing)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUIStore } from '../stores/ui';

interface Props {
  systemPrompt?: string;
  userPrompt?: string;
  llmProvider?: string;
  llmModel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'test-prompt'): void;
}>();

const uiStore = useUIStore();
const isExpanded = ref(false);

const hasPrompts = computed(() => {
  return !!(props.userPrompt || props.systemPrompt);
});

async function copyToClipboard(text: string, type: string) {
  try {
    await navigator.clipboard.writeText(text);
    uiStore.showSuccess(`${type === 'system' ? 'System' : 'User'} prompt copied to clipboard`);
  } catch (err) {
    uiStore.showError('Failed to copy to clipboard');
  }
}
</script>










