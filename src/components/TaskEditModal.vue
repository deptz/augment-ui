<template>
  <div
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isNewTask ? 'Add New Task' : 'Edit Task' }}
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
              v-model="editedTask.summary"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Task summary"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="edit-description" class="block text-sm font-medium text-gray-700">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              v-model="editedTask.description"
              rows="5"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Task description"
            />
            <p class="mt-1 text-xs text-gray-500">Task description with detailed information.</p>
          </div>

          <!-- Story Key -->
          <div>
            <label for="edit-story-key" class="block text-sm font-medium text-gray-700">
              Story Key <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-story-key"
              v-model="editedTask.story_key"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., STORY-123"
            />
            <p class="mt-1 text-xs text-gray-500">The story this task will be linked to</p>
          </div>

          <!-- Team and Estimated Days -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="edit-team" class="block text-sm font-medium text-gray-700">
                Team <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-team"
                v-model="editedTask.team"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Team name"
              />
            </div>
            <div>
              <label for="edit-estimated-days" class="block text-sm font-medium text-gray-700">
                Estimated Days <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-estimated-days"
                v-model.number="editedTask.estimated_days"
                type="number"
                min="0"
                step="0.5"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Dependencies -->
          <div>
            <label for="edit-dependencies" class="block text-sm font-medium text-gray-700">
              Dependencies
            </label>
            <select
              id="edit-dependencies"
              v-model="selectedDependencies"
              multiple
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              size="5"
            >
              <option
                v-for="taskOption in availableDependencyOptions"
                :key="taskOption.value"
                :value="taskOption.value"
              >
                {{ taskOption.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Select tasks this task depends on (hold Ctrl/Cmd to select multiple)
            </p>
          </div>

          <!-- Test Cases Section -->
          <div v-if="editedTask.test_cases && editedTask.test_cases.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Test Cases
            </label>
            <div class="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div
                v-for="(testCase, index) in editedTask.test_cases"
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
import type { TaskDetail, TestCase } from '../types/api';

const props = defineProps<{
  task?: TaskDetail;
  taskIndex?: number;
  parentKey?: string;
  defaultStoryKey?: string;
  allTasks?: TaskDetail[];
}>();

const emit = defineEmits<{
  close: [];
  save: [task: TaskDetail, index?: number];
}>();

const isNewTask = computed(() => props.task === undefined || props.taskIndex === undefined);

// Create a deep copy of the task for editing, or create a new task
const editedTask = ref<TaskDetail>(props.task ? {
  task_id: props.task.task_id,
  summary: props.task.summary,
  description: props.task.description || '',
  team: props.task.team,
  depends_on_tasks: [...props.task.depends_on_tasks],
  estimated_days: props.task.estimated_days,
  test_cases: props.task.test_cases ? props.task.test_cases.map(tc => ({ ...tc })) : [],
  story_key: props.task.story_key,
} : {
  summary: '',
  description: '',
  team: '',
  depends_on_tasks: [],
  estimated_days: 1,
  test_cases: [],
  story_key: props.defaultStoryKey || '',
});

// Computed property for available dependency options (excluding current task)
const availableDependencyOptions = computed(() => {
  if (!props.allTasks || props.allTasks.length === 0) {
    return [];
  }
  
  return props.allTasks
    .filter((task, index) => {
      // Exclude current task being edited (if editing existing task)
      if (props.taskIndex !== undefined && props.taskIndex !== null) {
        return index !== props.taskIndex;
      }
      // If creating new task, include all tasks
      return true;
    })
    .map(task => ({
      value: task.task_id || task.summary, // Use task_id if available, fallback to summary
      label: task.summary,
    }));
});

// Computed property for selected dependencies (multi-select)
const selectedDependencies = computed({
  get: () => {
    // Map depends_on_tasks to their corresponding values (task_id or summary)
    return editedTask.value.depends_on_tasks.map(dep => {
      // If dep is already a task_id or summary that matches, return it
      // Otherwise, try to find matching task
      if (props.allTasks) {
        const matchingTask = props.allTasks.find(t => 
          t.task_id === dep || t.summary === dep
        );
        return matchingTask ? (matchingTask.task_id || matchingTask.summary) : dep;
      }
      return dep;
    });
  },
  set: (values: string[]) => {
    // Store the selected values (task_id preferred, summary as fallback)
    editedTask.value.depends_on_tasks = values;
  },
});

function addTestCase() {
  if (!editedTask.value.test_cases) {
    editedTask.value.test_cases = [];
  }
  editedTask.value.test_cases.push({
    title: '',
    type: '',
    description: '',
    expected_result: '',
  });
}

function removeTestCase(index: number) {
  if (editedTask.value.test_cases) {
    editedTask.value.test_cases.splice(index, 1);
  }
}

function handleSave() {
  // Validate required fields
  if (!editedTask.value.summary?.trim()) {
    alert('Summary is required');
    return;
  }
  if (!editedTask.value.description?.trim()) {
    alert('Description is required');
    return;
  }
  if (!editedTask.value.story_key?.trim()) {
    alert('Story key is required');
    return;
  }
  if (!editedTask.value.team?.trim()) {
    alert('Team is required');
    return;
  }
  if (!editedTask.value.estimated_days || editedTask.value.estimated_days <= 0) {
    alert('Estimated days must be greater than 0');
    return;
  }

  emit('save', { ...editedTask.value }, props.taskIndex);
}

// Watch for prop changes and update edited task
watch(() => props.task, (newTask) => {
  if (newTask) {
    editedTask.value = {
      task_id: newTask.task_id,
      summary: newTask.summary,
      description: newTask.description || '',
      team: newTask.team,
      depends_on_tasks: [...newTask.depends_on_tasks],
      estimated_days: newTask.estimated_days,
      test_cases: newTask.test_cases ? newTask.test_cases.map(tc => ({ ...tc })) : [],
      story_key: newTask.story_key,
    };
  }
}, { deep: true });
</script>

