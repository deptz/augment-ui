<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Task Breakdown from Story</h1>
      <p class="mt-2 text-sm text-gray-600">
        Break down stories into tasks with AI. Review, edit, and manage before creating in JIRA.
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div class="space-y-6">
        <!-- Story Keys Input -->
        <div>
          <label for="story-keys" class="block text-sm font-medium text-gray-700">
            Story Key(s)
          </label>
          <input
            id="story-keys"
            name="story-keys"
            v-model="storyKeys"
            type="text"
            autocomplete="on"
            placeholder="e.g., STORY-123 or STORY-123,STORY-124"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">Separate multiple keys with commas</p>
        </div>

        <!-- Epic Key Input -->
        <div>
          <label for="epic-key" class="block text-sm font-medium text-gray-700">
            Epic Key
          </label>
          <input
            id="epic-key"
            name="epic-key"
            v-model="epicKey"
            type="text"
            autocomplete="on"
            placeholder="e.g., EPIC-100"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Additional Context Input -->
        <div>
          <label for="additional-context" class="block text-sm font-medium text-gray-700">
            Additional Context (Optional)
          </label>
          <textarea
            id="additional-context"
            name="additional-context"
            v-model="additionalContext"
            autocomplete="on"
            placeholder="Provide any additional context or instructions for task breakdown..."
            rows="4"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">Optional: Add any extra context or specific requirements for the task breakdown</p>
        </div>

        <!-- Async Mode Option -->
        <div class="flex items-center">
          <input
            id="async-mode"
            v-model="asyncMode"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="async-mode" class="ml-2 block text-sm text-gray-900">
            Run in background (for long-running operations)
          </label>
        </div>

        <!-- Generate Button -->
        <div>
          <button
            @click="handleGenerate"
            :disabled="!storyKeys || !epicKey || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Generate Tasks</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Job Status (when async mode) -->
    <div v-if="jobId && !response" class="mb-6">
      <JobStatusCard
        :job="jobStatus"
        :is-loading="isPolling"
        @cancel="handleCancelJob"
        @refresh="refreshJob"
        @view-results="handleViewJobResults"
      />
    </div>

    <!-- Results -->
    <div v-if="response" class="space-y-6">
      <!-- Summary Stats -->
      <div v-if="tasks.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt class="text-sm font-medium text-gray-500">Total Tasks</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ totalTasks }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Estimated Days</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ estimatedDays.toFixed(1) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Avg per Task</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">
              {{ averageTaskDays != null ? averageTaskDays.toFixed(1) : 'N/A' }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Tasks List -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Generated Tasks</h2>
          <button
            @click="handleAddTask"
            class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(task, index) in tasks"
            :key="task.task_id || index"
            :data-task-index="index"
            class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ task.summary }}</h3>
                <p class="text-xs text-gray-500 mt-1">Team: {{ task.team }} | Est: {{ task.estimated_days }} days</p>
              </div>
              <div class="flex space-x-2 ml-4">
                <button
                  @click="handleEditTask(index)"
                  class="text-indigo-600 hover:text-indigo-800"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="handleRemoveTask(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="task.description" class="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{{ task.description }}</p>
            <div v-if="task.depends_on_tasks.length > 0" class="mt-2 text-xs text-gray-500">
              Dependencies: 
              <span v-for="(depId, depIndex) in task.depends_on_tasks" :key="depId">
                <a
                  href="#"
                  class="text-indigo-600 hover:text-indigo-800 hover:underline"
                  @click.prevent="scrollToTask(depId)"
                >{{ getTaskSummaryById(depId) }}</a><span v-if="depIndex < task.depends_on_tasks.length - 1">, </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Create All Options -->
        <div class="mt-4 flex items-center">
          <input
            id="create-all-async-mode"
            v-model="createAllAsyncMode"
            type="checkbox"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label for="create-all-async-mode" class="ml-2 block text-sm text-gray-900">
            Create in background (recommended for many tasks)
          </label>
        </div>

        <!-- Create All Job Status -->
        <div v-if="createAllJobId" class="mt-4">
          <JobStatusCard
            :job="createAllJobStatus"
            :is-loading="isCreateAllPolling"
            @cancel="handleCancelCreateAllJob"
            @refresh="handleRefreshCreateAllJob"
            @view-results="handleViewCreateAllJobResults"
          />
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex space-x-3">
          <button
            @click="handlePreviewAll"
            :disabled="tasks.length === 0 || loading || creatingAll"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview All
          </button>
          <button
            @click="handleCreateAll"
            :disabled="tasks.length === 0 || loading || creatingAll"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="creatingAll" size="sm" color="white" class="mr-2" />
            <span v-else>Create All in JIRA</span>
          </button>
        </div>
      </div>

      <!-- Prompt Viewer -->
      <PromptViewer
        :system-prompt="response.system_prompt"
        :user-prompt="response.user_prompt"
        :llm-provider="response.llm_provider"
        :llm-model="response.llm_model"
        @test-prompt="handleTestPrompt"
      />
    </div>

    <!-- A/B Testing Modal -->
    <PromptResubmitModal
      v-if="showABTestModal"
      operation-type="plan_tasks"
      :original-request="{
        story_keys: storyKeys ? storyKeys.split(',').map(s => s.trim()).filter(s => s) : [],
        epic_key: epicKey,
        additional_context: additionalContext || undefined
      }"
      :original-system-prompt="response?.system_prompt"
      :original-user-prompt="response?.user_prompt || ''"
      :original-result="response"
      @close="showABTestModal = false"
      @result="handleABTestResult"
    />

    <!-- Task Preview Modal -->
    <TaskPreviewModal
      v-if="showPreviewModal"
      :tasks="tasks"
      :epic-key="epicKey"
      :story-keys="storyKeys ? storyKeys.split(',').map(s => s.trim()).filter(s => s) : []"
      @close="handleClosePreview"
      @create="handleCreateFromPreview"
    />

    <!-- Task Edit Modal -->
    <TaskEditModal
      v-if="showEditModal"
      :task="editingTaskIndex !== null ? tasks[editingTaskIndex] : undefined"
      :task-index="editingTaskIndex ?? undefined"
      :parent-key="epicKey"
      :default-story-key="getFirstStoryKey()"
      :all-tasks="tasks"
      @close="handleCloseEdit"
      @save="handleSaveTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { generateTasks, bulkCreateTasks, getJobStatus } from '../api/endpoints';
import type { TaskGenerationResponse, TaskDetail, BatchResponse, BulkCreateTasksResponse } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PromptViewer from '../components/PromptViewer.vue';
import PromptResubmitModal from '../components/PromptResubmitModal.vue';
import TaskPreviewModal from '../components/TaskPreviewModal.vue';
import TaskEditModal from '../components/TaskEditModal.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import { useJobPolling } from '../composables/useJobPolling';
import { error, sanitizeError } from '../utils/logger';
import { isAsyncResponse, handleDuplicateJob } from '../utils/jobHelpers';

const modelsStore = useModelsStore();
const uiStore = useUIStore();

const storyKeys = ref('');
const epicKey = ref('');
const additionalContext = ref('');
const asyncMode = ref(true);
const loading = ref(false);
const response = ref<TaskGenerationResponse | null>(null);
const tasks = ref<TaskDetail[]>([]);
const showABTestModal = ref(false);
const showPreviewModal = ref(false);
const showEditModal = ref(false);
const editingTaskIndex = ref<number | null>(null);
const jobId = ref<string | null>(null);

// Create All state
const createAllAsyncMode = ref(true);
const creatingAll = ref(false);
const createAllJobId = ref<string | null>(null);

// Computed properties for summary stats calculated from tasks array
const totalTasks = computed(() => tasks.value.length);

const estimatedDays = computed(() => {
  return tasks.value.reduce((sum, task) => {
    return sum + (task.estimated_days ?? 0);
  }, 0);
});

const averageTaskDays = computed(() => {
  const tasksWithEstimate = tasks.value.filter(task => task.estimated_days != null && task.estimated_days > 0);
  if (tasksWithEstimate.length === 0) {
    return null;
  }
  const total = tasksWithEstimate.reduce((sum, task) => sum + (task.estimated_days ?? 0), 0);
  return total / tasksWithEstimate.length;
});

// Job polling for task generation
const { job: jobStatus, isPolling, startPolling, cancelJob: cancelJobPolling } = useJobPolling(
  jobId,
  {
    onComplete: async (job) => {
      // When job completes, fetch the results
      if (job.results) {
        // The results should contain the TaskGenerationResponse
        response.value = job.results as TaskGenerationResponse;
        if (response.value.success) {
          const keys = storyKeys.value.split(',').map(k => k.trim()).filter(k => k);
          const firstStory = keys.length > 0 ? keys[0] : '';
          tasks.value = (response.value.task_details || []).map(task => ({
            ...task,
            story_key: task.story_key || firstStory,
          }));
          uiStore.showSuccess(`Generated ${tasks.value.length} tasks`);
        }
        jobId.value = null; // Clear job ID to hide status card
      }
    },
    onError: (err) => {
      error('Job polling error:', err);
    },
  }
);

// Job polling for Create All operation
const {
  job: createAllJobStatus,
  isPolling: isCreateAllPolling,
  startPolling: startCreateAllPolling,
  cancelJob: cancelCreateAllJob,
} = useJobPolling(createAllJobId, {
  onComplete: async (job) => {
    creatingAll.value = false;
    if (job.results) {
      const result = job.results as BulkCreateTasksResponse;
      if (result.created_tickets && result.created_tickets.length > 0) {
        uiStore.showSuccess(`Successfully created ${result.successful} task(s): ${result.created_tickets.join(', ')}`);
        updateTasksWithCreatedKeys(result);
      } else if (result.failed > 0) {
        uiStore.showError(`Failed to create ${result.failed} task(s)`);
      }
    }
    createAllJobId.value = null;
  },
  onError: (err) => {
    creatingAll.value = false;
    error('Create All job error:', err);
    uiStore.showError('Failed to create tasks');
  },
});

async function handleGenerate() {
  if (!storyKeys.value || !epicKey.value) {
    uiStore.showError('Please enter both story key(s) and epic key');
    return;
  }

  loading.value = true;
  response.value = null;
  tasks.value = [];

  try {
    const keys = storyKeys.value.split(',').map(k => k.trim()).filter(k => k);
    const result = await generateTasks({
      story_keys: keys,
      epic_key: epicKey.value,
      llm_provider: modelsStore.selectedProvider || undefined,
      llm_model: modelsStore.selectedModel || undefined,
      additional_context: additionalContext.value || undefined,
      async_mode: asyncMode.value,
    });

    // Check if it's a BatchResponse (async mode)
    if ('job_id' in result) {
      const batchResponse = result as BatchResponse;
      jobId.value = batchResponse.job_id;
      uiStore.showInfo(`Job started: ${batchResponse.job_id}`);
      startPolling();
    } else if (result.success) {
      // Synchronous response
      response.value = result as TaskGenerationResponse;
      // Set story_key for all generated tasks (use first story)
      const firstStory = keys.length > 0 ? keys[0] : '';
      tasks.value = (result.task_details || []).map(task => ({
        ...task,
        story_key: task.story_key || firstStory,
      }));
      
      uiStore.showSuccess(`Generated ${tasks.value.length} tasks`);
    } else {
      error('API returned unsuccessful result:', result);
      uiStore.showError('Failed to generate tasks');
    }
  } catch (err: any) {
    const sanitized = sanitizeError(err);
    error('API Error:', sanitized);
    uiStore.showError(err.response?.data?.detail || 'Failed to generate tasks');
  } finally {
    loading.value = false;
  }
}

function handleAddTask() {
  if (!epicKey.value || !storyKeys.value) {
    uiStore.showError('Please enter epic key and story keys before adding tasks');
    return;
  }
  editingTaskIndex.value = null;
  showEditModal.value = true;
}

function handleEditTask(index: number) {
  editingTaskIndex.value = index;
  showEditModal.value = true;
}

function handleCloseEdit() {
  showEditModal.value = false;
  editingTaskIndex.value = null;
}

function handleSaveTask(updatedTask: TaskDetail, index?: number) {
  if (index !== undefined && index !== null) {
    // Update existing task
    tasks.value[index] = updatedTask;
    uiStore.showSuccess('Task updated successfully');
  } else {
    // Add new task
    tasks.value.push(updatedTask);
    uiStore.showSuccess('Task added successfully');
  }
  handleCloseEdit();
}

function getFirstStoryKey(): string {
  if (!storyKeys.value) return '';
  const keys = storyKeys.value.split(',').map(k => k.trim()).filter(k => k);
  return keys.length > 0 ? keys[0] : '';
}

// Helper to get task summary by task_id or fallback to the ID itself
function getTaskSummaryById(taskId: string): string {
  const task = tasks.value.find(t => t.task_id === taskId || t.summary === taskId);
  return task ? task.summary : taskId;
}

// Scroll to a task card by its task_id
function scrollToTask(taskId: string): void {
  const taskIndex = tasks.value.findIndex(t => t.task_id === taskId || t.summary === taskId);
  if (taskIndex !== -1) {
    // Highlight the task briefly
    const taskElements = document.querySelectorAll('[data-task-index]');
    const targetElement = taskElements[taskIndex] as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-indigo-500');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-indigo-500');
      }, 2000);
    }
  }
}

function handleRemoveTask(index: number) {
  if (confirm('Remove this task?')) {
    tasks.value.splice(index, 1);
    uiStore.showSuccess('Task removed');
  }
}

function handlePreviewAll() {
  if (tasks.value.length === 0) {
    uiStore.showError('No tasks to preview');
    return;
  }
  showPreviewModal.value = true;
}

function handleClosePreview() {
  showPreviewModal.value = false;
}

function handleCreateFromPreview() {
  showPreviewModal.value = false;
  handleCreateAll();
}

async function handleCreateAll() {
  if (tasks.value.length === 0) {
    uiStore.showError('No tasks to create');
    return;
  }

  if (!epicKey.value) {
    uiStore.showError('Epic key is required');
    return;
  }

  const firstStoryKey = getFirstStoryKey();
  if (!firstStoryKey) {
    uiStore.showError('At least one story key is required');
    return;
  }

  creatingAll.value = true;

  try {
    // Build bulk request
    const bulkTasks = tasks.value.map(task => {
      // Format test cases if present
      let testCasesText: string | null = null;
      if (task.test_cases && task.test_cases.length > 0) {
        testCasesText = task.test_cases.map((tc, idx) => {
          return `${idx + 1}. ${tc.title}\n   Type: ${tc.type}\n   Description: ${tc.description}\n   Expected: ${tc.expected_result}`;
        }).join('\n\n');
      }

      return {
        task_id: task.task_id || null, // Include for dependency resolution in backend
        parent_key: epicKey.value,
        summary: task.summary,
        description: task.description || '',
        story_key: task.story_key || firstStoryKey,
        test_cases: testCasesText,
        mandays: task.estimated_days,
        blocks: task.depends_on_tasks.length > 0 ? task.depends_on_tasks : null,
      };
    });

    const result = await bulkCreateTasks({
      tasks: bulkTasks,
      create_tickets: true,
      async_mode: createAllAsyncMode.value,
    });

    // Check if it's an async response
    if (isAsyncResponse(result)) {
      const batchResponse = result as BatchResponse;
      createAllJobId.value = batchResponse.job_id;
      uiStore.showInfo(`Bulk creation job started: ${batchResponse.job_id}`);
      startCreateAllPolling();
    } else {
      // Synchronous response
      const syncResult = result as BulkCreateTasksResponse;
      creatingAll.value = false;

      if (syncResult.successful > 0) {
        uiStore.showSuccess(`Successfully created ${syncResult.successful} task(s): ${syncResult.created_tickets.join(', ')}`);
        updateTasksWithCreatedKeys(syncResult);
      }
      if (syncResult.failed > 0) {
        uiStore.showError(`Failed to create ${syncResult.failed} task(s)`);
        // Log errors from individual results
        syncResult.results.filter(r => !r.success).forEach(r => {
          error(`Task ${r.index} failed:`, r.error);
        });
      }
    }
  } catch (err: any) {
    creatingAll.value = false;
    // Check for duplicate job (409 Conflict)
    if (err.response?.status === 409) {
      const existingJobId = handleDuplicateJob(err);
      if (existingJobId) {
        createAllJobId.value = existingJobId;
        uiStore.showInfo(`A job is already running. Tracking job: ${existingJobId}`);
        startCreateAllPolling();
      } else {
        uiStore.showError('A duplicate job is already running');
      }
    } else {
      const sanitized = sanitizeError(err);
      error('Bulk create error:', sanitized);
      uiStore.showError(err.response?.data?.detail || 'Failed to create tasks');
    }
  }
}

function updateTasksWithCreatedKeys(result: BulkCreateTasksResponse) {
  // Update tasks with their created ticket keys
  result.results.forEach((r, idx) => {
    if (r.success && r.ticket_key && tasks.value[idx]) {
      tasks.value[idx].jira_key = r.ticket_key;
    }
  });
}

function handleTestPrompt() {
  showABTestModal.value = true;
}

function handleABTestResult(result: any) {
  uiStore.showInfo('A/B test completed');
}

async function handleCancelJob() {
  if (jobId.value) {
    await cancelJobPolling();
    jobId.value = null;
  }
}

async function refreshJob() {
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      if (job.status === 'completed' && job.results) {
        response.value = job.results as TaskGenerationResponse;
        if (response.value.success) {
          const keys = storyKeys.value.split(',').map(k => k.trim()).filter(k => k);
          const firstStory = keys.length > 0 ? keys[0] : '';
          tasks.value = (response.value.task_details || []).map(task => ({
            ...task,
            story_key: task.story_key || firstStory,
          }));
        }
        jobId.value = null;
      }
    } catch (error: any) {
      uiStore.showError('Failed to refresh job status');
    }
  }
}

function handleViewJobResults() {
  if (jobStatus.value?.results) {
    response.value = jobStatus.value.results as TaskGenerationResponse;
    if (response.value.success) {
      const keys = storyKeys.value.split(',').map(k => k.trim()).filter(k => k);
      const firstStory = keys.length > 0 ? keys[0] : '';
      tasks.value = (response.value.task_details || []).map(task => ({
        ...task,
        story_key: task.story_key || firstStory,
      }));
    }
    jobId.value = null;
  }
}

// Create All job handlers
async function handleCancelCreateAllJob() {
  if (createAllJobId.value) {
    await cancelCreateAllJob();
    createAllJobId.value = null;
    creatingAll.value = false;
  }
}

async function handleRefreshCreateAllJob() {
  if (createAllJobId.value) {
    try {
      const job = await getJobStatus(createAllJobId.value);
      if (job.status === 'completed' && job.results) {
        const result = job.results as BulkCreateTasksResponse;
        if (result.created_tickets && result.created_tickets.length > 0) {
          uiStore.showSuccess(`Successfully created ${result.successful} task(s): ${result.created_tickets.join(', ')}`);
          updateTasksWithCreatedKeys(result);
        }
        createAllJobId.value = null;
        creatingAll.value = false;
      }
    } catch (err: any) {
      uiStore.showError('Failed to refresh job status');
    }
  }
}

function handleViewCreateAllJobResults() {
  if (createAllJobStatus.value?.results) {
    const result = createAllJobStatus.value.results as BulkCreateTasksResponse;
    if (result.created_tickets && result.created_tickets.length > 0) {
      uiStore.showSuccess(`Created ${result.successful} task(s): ${result.created_tickets.join(', ')}`);
      updateTasksWithCreatedKeys(result);
    }
    createAllJobId.value = null;
    creatingAll.value = false;
  }
}
</script>










