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
            Preview Tasks for Creation
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Review {{ tasks.length }} task(s) that will be created in JIRA
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
          <div
            v-for="(task, index) in tasks"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium">
                    {{ index + 1 }}
                  </span>
                  <h3 class="text-base font-medium text-gray-900">{{ task.summary }}</h3>
                </div>
                <div class="ml-8 text-sm text-gray-600 space-y-1">
                  <p><span class="font-medium">Team:</span> {{ task.team }}</p>
                  <p><span class="font-medium">Estimated:</span> {{ task.estimated_days }} day(s)</p>
                  <p v-if="task.story_key || storyKeys" class="text-xs">
                    <span class="font-medium">Story:</span> 
                    <span class="text-blue-600">{{ task.story_key || (storyKeys && storyKeys[0]) || 'N/A' }}</span>
                  </p>
                  <p v-if="epicKey" class="text-xs">
                    <span class="font-medium">Epic:</span> 
                    <span class="text-purple-600">{{ epicKey }}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div class="ml-8 space-y-2">
              <div v-if="task.description">
                <p class="text-xs font-medium text-gray-500 mb-1">Description</p>
                <p class="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">{{ task.description }}</p>
              </div>
              
              <div v-if="task.depends_on_tasks && task.depends_on_tasks.length > 0">
                <p class="text-xs font-medium text-gray-500 mb-1">Dependencies</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(dep, depIndex) in task.depends_on_tasks"
                    :key="depIndex"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    {{ dep }}
                  </span>
                </div>
              </div>
              
              <div v-if="task.test_cases && task.test_cases.length > 0">
                <p class="text-xs font-medium text-gray-500 mb-1">Test Cases</p>
                <div class="space-y-2">
                  <div
                    v-for="(testCase, tcIndex) in task.test_cases"
                    :key="tcIndex"
                    class="bg-white p-3 rounded border text-xs"
                  >
                    <p class="font-medium text-gray-900">{{ testCase.title }}</p>
                    <p class="text-gray-600 mt-1"><span class="font-medium">Type:</span> {{ testCase.type }}</p>
                    <p class="text-gray-600 mt-1">{{ testCase.description }}</p>
                    <p class="text-gray-600 mt-1"><span class="font-medium">Expected:</span> {{ testCase.expected_result }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="tasks.length === 0" class="text-center py-8 text-gray-500">
          No tasks to preview
        </div>
      </div>

      <!-- Footer with Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <span class="font-medium">{{ tasks.length }}</span> task(s) will be created
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
            :disabled="tasks.length === 0"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create All in JIRA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskDetail } from '../types/api';

defineProps<{
  tasks: TaskDetail[];
  epicKey?: string;
  storyKeys?: string[];
}>();

defineEmits<{
  close: [];
  create: [];
}>();

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600 font-medium';
  if (confidence >= 0.6) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
}
</script>


