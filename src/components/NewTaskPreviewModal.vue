<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            Preview New Task
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Review task details before creating in JIRA
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
        <div class="space-y-4">
          <!-- Summary -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Task Summary</p>
            <p class="text-base font-medium text-gray-900">{{ suggestion.summary }}</p>
          </div>

          <!-- Description -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Description</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border">{{ suggestion.description }}</p>
          </div>

          <!-- Gap Addressed -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Addresses Gap</p>
            <p class="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200">{{ suggestion.gap_addressed }}</p>
          </div>

          <!-- Test Cases -->
          <div v-if="suggestion.test_cases">
            <p class="text-xs font-medium text-gray-500 mb-1">Test Cases</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border">{{ suggestion.test_cases }}</p>
          </div>

          <!-- Ready to Submit Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p class="text-xs font-medium text-blue-900 mb-2">Ready to Submit</p>
            <div class="space-y-2 text-sm">
              <p><span class="font-medium text-gray-700">Story Key:</span> <span class="text-gray-600">{{ suggestion.ready_to_submit.story_key }}</span></p>
              <p><span class="font-medium text-gray-700">Task Summary:</span> <span class="text-gray-600">{{ suggestion.ready_to_submit.task_summary }}</span></p>
              <p><span class="font-medium text-gray-700">Task Description:</span></p>
              <p class="text-gray-600 whitespace-pre-wrap bg-white p-2 rounded border border-blue-200 ml-4">{{ suggestion.ready_to_submit.task_description }}</p>
              <p v-if="suggestion.ready_to_submit.test_cases" class="mt-2">
                <span class="font-medium text-gray-700">Test Cases:</span>
              </p>
              <p v-if="suggestion.ready_to_submit.test_cases" class="text-gray-600 whitespace-pre-wrap bg-white p-2 rounded border border-blue-200 ml-4">{{ suggestion.ready_to_submit.test_cases }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          This task will be created under story <span class="font-medium">{{ suggestion.ready_to_submit.story_key }}</span>
        </div>
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <button
            @click="$emit('create')"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create in JIRA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewTaskSuggestion } from '../types/api';

defineProps<{
  suggestion: NewTaskSuggestion;
}>();

defineEmits<{
  close: [];
  create: [];
}>();
</script>


