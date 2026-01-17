<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click.self="$emit('close')"
  >
    <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Confirm Plan Approval</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-800">
                <strong>Warning:</strong> This will apply code changes to the repository. Make sure you have reviewed the plan carefully.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan Hash</label>
            <div class="font-mono text-xs bg-gray-50 p-2 rounded border border-gray-200 break-all" :title="planHash">
              {{ planHash || 'N/A' }}
            </div>
          </div>

          <div v-if="planSummary">
            <label class="block text-sm font-medium text-gray-700 mb-1">Plan Summary</label>
            <p class="text-sm text-gray-600">{{ planSummary }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="isApproving"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isApproving">Approving...</span>
          <span v-else>Approve Plan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  show: boolean;
  planHash: string;
  planSummary?: string;
  isApproving?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  planHash: '',
  planSummary: undefined,
  isApproving: false,
});

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

function handleConfirm() {
  emit('confirm');
}
</script>
