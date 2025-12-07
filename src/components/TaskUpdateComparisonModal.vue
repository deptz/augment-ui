<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">
          Task Update Comparison: {{ suggestion.task_key }}
        </h2>
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
        <div class="grid grid-cols-2 gap-6">
          <!-- Current Description -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm mr-2">
                1
              </span>
              Current Description
            </h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ suggestion.current_description }}</div>
            </div>
            
            <!-- Current Test Cases if available -->
            <div v-if="suggestion.current_test_cases" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Current Test Cases</h4>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap text-sm">
                  {{ suggestion.current_test_cases }}
                </div>
              </div>
            </div>
          </div>

          <!-- Suggested Description -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm mr-2">
                2
              </span>
              Suggested Description
            </h3>
            <div class="bg-green-50 border border-green-300 rounded-lg p-4">
              <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ suggestion.suggested_description }}</div>
            </div>

            <!-- Suggested Test Cases if available -->
            <div v-if="suggestion.suggested_test_cases" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Suggested Test Cases</h4>
              <div class="bg-green-50 border border-green-300 rounded-lg p-4">
                <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm">{{ suggestion.suggested_test_cases }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
        <button
          @click="$emit('preview', suggestion)"
          class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Preview Update
        </button>
        <button
          @click="$emit('apply', suggestion)"
          class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Apply Update
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpdateSuggestion } from '../types/api';

defineProps<{
  suggestion: UpdateSuggestion;
}>();

defineEmits<{
  close: [];
  preview: [suggestion: UpdateSuggestion];
  apply: [suggestion: UpdateSuggestion];
}>();
</script>

