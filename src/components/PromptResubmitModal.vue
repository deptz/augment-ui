<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 flex-1 overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              A/B Testing - Compare Prompts
            </h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Model Selection & Generate Button Section (Top) -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1">
                <span class="text-sm font-medium text-gray-700">Test with different model:</span>
                <div class="flex space-x-2 flex-1 max-w-md">
                  <select
                    v-model="newProvider"
                    class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="">Default Provider</option>
                    <option v-for="provider in modelsStore.providers" :key="provider" :value="provider">
                      {{ provider }}
                    </option>
                  </select>
                  <select
                    v-model="newModel"
                    class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="">Default Model</option>
                    <option v-for="model in availableModels" :key="model" :value="model">
                      {{ model }}
                    </option>
                  </select>
                </div>
              </div>
              <button
                @click="handleResubmit"
                :disabled="loading"
                class="ml-4 inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
                <span v-else>Generate</span>
              </button>
            </div>
          </div>

          <!-- Prompts Section -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Left Panel: Original -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2 flex items-center">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs mr-2">A</span>
                Original
              </h4>
              
              <!-- Original System Prompt -->
              <div v-if="originalSystemPrompt">
                <label class="block text-xs font-medium text-gray-500">System Prompt</label>
                <textarea
                  :value="originalSystemPrompt"
                  readonly
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-xs font-mono"
                  rows="4"
                ></textarea>
              </div>

              <!-- Original User Prompt -->
              <div>
                <label class="block text-xs font-medium text-gray-500">User Prompt</label>
                <textarea
                  :value="originalUserPrompt"
                  readonly
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-xs font-mono"
                  rows="6"
                ></textarea>
              </div>
            </div>

            <!-- Right Panel: New Test -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2 flex items-center">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs mr-2">B</span>
                New Test (Editable)
              </h4>
              
              <!-- Modified System Prompt -->
              <div v-if="originalSystemPrompt">
                <label class="block text-xs font-medium text-gray-500">System Prompt (editable)</label>
                <textarea
                  v-model="modifiedSystemPrompt"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-xs font-mono focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                ></textarea>
              </div>

              <!-- Modified User Prompt -->
              <div>
                <label class="block text-xs font-medium text-gray-500">User Prompt (editable)</label>
                <textarea
                  v-model="modifiedUserPrompt"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-xs font-mono focus:ring-indigo-500 focus:border-indigo-500"
                  rows="6"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Results Section - Side by Side -->
          <div v-if="originalResult || newResult" class="border-t pt-6">
            <h3 class="text-base font-medium text-gray-900 mb-4">Results Comparison</h3>
            <div class="grid grid-cols-2 gap-6">
              <!-- Original Result -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-medium text-gray-700">Original Result (A)</label>
                  <button
                    v-if="originalResult"
                    @click="copyToClipboard(originalResult, 'Original')"
                    class="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Copy JSON
                  </button>
                </div>
                <div v-if="originalResult" class="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-[500px] overflow-y-auto">
                  <div v-html="formatJSON(originalResult)" class="json-content"></div>
                </div>
                <div v-else class="border border-gray-300 rounded-md p-3 bg-gray-50 text-center text-gray-400 text-sm">
                  No original result available
                </div>
              </div>

              <!-- New Result -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-medium text-gray-700">New Result (B)</label>
                  <button
                    v-if="newResult"
                    @click="copyToClipboard(newResult, 'New')"
                    class="text-xs text-green-600 hover:text-green-800"
                  >
                    Copy JSON
                  </button>
                </div>
                <div v-if="newResult" class="border border-green-300 rounded-md p-3 bg-green-50 max-h-[500px] overflow-y-auto">
                  <div v-html="formatJSON(newResult)" class="json-content"></div>
                </div>
                <div v-else class="border border-gray-300 rounded-md p-3 bg-gray-100 text-center text-gray-400 text-sm">
                  Generate a new result to compare
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          @click="$emit('close')"
          type="button"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { resubmitPrompt } from '../api/endpoints';
import LoadingSpinner from './LoadingSpinner.vue';
import { error } from '../utils/logger';

interface Props {
  operationType: 'generate_single' | 'plan_tasks' | 'analyze_coverage';
  originalRequest: any;
  originalSystemPrompt?: string;
  originalUserPrompt: string;
  originalResult?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'result', result: any): void;
}>();

const modelsStore = useModelsStore();
const uiStore = useUIStore();

const modifiedSystemPrompt = ref(props.originalSystemPrompt || '');
const modifiedUserPrompt = ref(props.originalUserPrompt);
const newProvider = ref('');
const newModel = ref('');
const loading = ref(false);
const newResult = ref<any>(null);

const availableModels = computed(() => {
  if (!newProvider.value) return [];
  return modelsStore.getModelsForProvider(newProvider.value);
});

watch(() => newProvider.value, () => {
  newModel.value = '';
});

async function handleResubmit() {
  if (!modifiedUserPrompt.value) {
    uiStore.showError('User prompt is required');
    return;
  }

  loading.value = true;
  newResult.value = null;

  try {
    const response = await resubmitPrompt({
      operation_type: props.operationType,
      original_request: props.originalRequest,
      modified_system_prompt: modifiedSystemPrompt.value || undefined,
      modified_user_prompt: modifiedUserPrompt.value,
      llm_provider: newProvider.value || undefined,
      llm_model: newModel.value || undefined,
    });

    if (response.success) {
      newResult.value = response.new_result;
      emit('result', response.new_result);
      uiStore.showSuccess('New result generated successfully');
    } else {
      uiStore.showError(response.error || 'Failed to resubmit prompt');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to resubmit prompt');
    error('Error resubmitting prompt:', error);
  } finally {
    loading.value = false;
  }
}

function formatJSON(obj: any): string {
  const json = JSON.stringify(obj, null, 2);
  
  // Syntax highlighting with HTML
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
}

async function copyToClipboard(obj: any, label: string) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    uiStore.showSuccess(`${label} result copied to clipboard`);
  } catch (error) {
    uiStore.showError('Failed to copy to clipboard');
  }
}
</script>

<style scoped>
.json-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-content :deep(.json-key) {
  color: #0066cc;
  font-weight: 500;
}

.json-content :deep(.json-string) {
  color: #22863a;
}

.json-content :deep(.json-number) {
  color: #005cc5;
}

.json-content :deep(.json-boolean) {
  color: #d73a49;
  font-weight: 600;
}

.json-content :deep(.json-null) {
  color: #6f42c1;
  font-weight: 600;
}
</style>








