<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isNewStory ? 'Add New Story' : 'Edit Story' }}
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
        <div class="space-y-4">
          <!-- Summary -->
          <div>
            <label for="edit-summary" class="block text-sm font-medium text-gray-700">
              Summary <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-summary"
              v-model="editedStory.summary"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Story summary"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="edit-description" class="block text-sm font-medium text-gray-700">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              v-model="editedStory.description"
              rows="12"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Story description (include acceptance criteria in the description)"
            />
            <p class="mt-1 text-xs text-gray-500">Include acceptance criteria and all story details in the description</p>
          </div>

          <!-- Test Cases Section -->
          <div v-if="editedStory.test_cases && editedStory.test_cases.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Test Cases
            </label>
            <div class="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div
                v-for="(testCase, index) in editedStory.test_cases"
                :key="index"
                class="bg-white rounded border p-3"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-medium text-gray-500">Test Case {{ index + 1 }}</span>
                  <button
                    @click="removeTestCase(index)"
                    class="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <input
                  v-model="testCase.title"
                  type="text"
                  placeholder="Test case title"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                />
                <input
                  v-model="testCase.type"
                  type="text"
                  placeholder="Test type (e.g., Manual, Automated)"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                />
                <textarea
                  v-model="testCase.description"
                  rows="2"
                  placeholder="Test description"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                />
                <textarea
                  v-model="testCase.expected_result"
                  rows="2"
                  placeholder="Expected result"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                @click="addTestCase"
                class="w-full text-sm text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 rounded-md py-2 hover:bg-indigo-50"
              >
                + Add Test Case
              </button>
            </div>
          </div>
          <div v-else>
            <button
              @click="addTestCase"
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Test Cases
            </button>
          </div>
        </div>
      </div>

      <!-- Footer with Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { StoryDetail, TestCase } from '../types/api';

const props = defineProps<{
  story?: StoryDetail;
  storyIndex?: number;
  defaultEpicKey?: string;
}>();

const emit = defineEmits<{
  close: [];
  save: [story: StoryDetail, index?: number];
}>();

const isNewStory = computed(() => props.story === undefined || props.storyIndex === undefined);

// Create a deep copy of the story for editing, or create a new story
// Note: acceptance_criteria is deprecated per API spec - should be included in description
const editedStory = ref<StoryDetail>(props.story ? {
  summary: props.story.summary,
  description: props.story.description,
  acceptance_criteria: props.story.acceptance_criteria ? [...props.story.acceptance_criteria] : [],
  test_cases: props.story.test_cases ? props.story.test_cases.map(tc => ({ ...tc })) : [],
  tasks: props.story.tasks ? props.story.tasks.map(t => ({ ...t })) : [],
  jira_key: props.story.jira_key,
  prd_row_uuid: props.story.prd_row_uuid,
} : {
  summary: '',
  description: '',
  acceptance_criteria: [],
  test_cases: [],
  tasks: [],
  jira_key: null,
  prd_row_uuid: null,
});

function addTestCase() {
  if (!editedStory.value.test_cases) {
    editedStory.value.test_cases = [];
  }
  editedStory.value.test_cases.push({
    title: '',
    type: '',
    description: '',
    expected_result: '',
  });
}

function removeTestCase(index: number) {
  if (editedStory.value.test_cases) {
    editedStory.value.test_cases.splice(index, 1);
  }
}

function handleSave() {
  // Validate required fields
  if (!editedStory.value.summary?.trim()) {
    alert('Summary is required');
    return;
  }
  if (!editedStory.value.description?.trim()) {
    alert('Description is required');
    return;
  }

  emit('save', { ...editedStory.value }, props.storyIndex);
}

// Watch for prop changes and update edited story
// Note: acceptance_criteria is deprecated per API spec - should be included in description
watch(() => props.story, (newStory) => {
  if (newStory) {
    editedStory.value = {
      summary: newStory.summary,
      description: newStory.description,
      acceptance_criteria: newStory.acceptance_criteria ? [...newStory.acceptance_criteria] : [],
      test_cases: newStory.test_cases ? newStory.test_cases.map(tc => ({ ...tc })) : [],
      tasks: newStory.tasks ? newStory.tasks.map(t => ({ ...t })) : [],
      jira_key: newStory.jira_key,
      prd_row_uuid: newStory.prd_row_uuid,
    };
  }
}, { deep: true });
</script>

