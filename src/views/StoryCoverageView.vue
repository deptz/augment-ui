<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Story Coverage Analysis</h1>
      <p class="mt-2 text-sm text-gray-600">
        Analyze how well tasks cover story requirements and identify gaps
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div class="space-y-6">
        <!-- Story Key Input -->
        <div>
          <label for="story-key" class="block text-sm font-medium text-gray-700">
            Story Key
          </label>
          <input
            id="story-key"
            v-model="storyKey"
            type="text"
            placeholder="e.g., STORY-123"
            @blur="storyKey = storyKey.trim()"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handleAnalyze"
          />
        </div>

        <!-- Additional Context Input -->
        <div>
          <div class="flex items-center justify-between">
            <label for="additional-context" class="block text-sm font-medium text-gray-700">
              Additional Context (Optional)
            </label>
            <span
              v-if="contextInherited"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ contextInheritedFrom }}
            </span>
          </div>
          <textarea
            id="additional-context"
            v-model="additionalContext"
            rows="4"
            placeholder="Provide any additional context, concerns, constraints, or focus areas for the analysis..."
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @input="handleContextInput"
          />
          <p class="mt-1 text-xs text-gray-500">Optional: Add specific concerns, constraints, or focus areas to consider in the analysis</p>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              id="include-test-cases"
              v-model="includeTestCases"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="include-test-cases" class="ml-2 block text-sm text-gray-900">
              Include test cases in analysis
            </label>
          </div>
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
        </div>

        <!-- Analyze Button -->
        <div>
          <button
            @click="handleAnalyze"
            :disabled="!storyKey.trim() || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Analyze Coverage</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Job Status (when async mode) -->
    <div v-if="jobId && !response" class="mb-6">
      <JobStatusCard
        :job="jobStatus"
        :is-loading="isPolling"
        :is-cancelling="isCancelling"
        :show-auto-refresh-info="true"
        @cancel="handleCancelJob"
        @refresh="refreshJob"
      />
    </div>

    <!-- Results -->
    <div v-if="response" class="space-y-6">
      <!-- Coverage Score -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Coverage Score</h2>
        <div class="flex items-center space-x-6">
          <div class="flex-shrink-0">
            <div class="relative w-32 h-32">
              <svg class="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  class="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${(response.coverage_percentage / 100) * 351.86} 351.86`"
                  :class="getCoverageColor(response.coverage_percentage)"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-900">{{ response.coverage_percentage.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">{{ response.overall_assessment }}</p>
            <div class="mt-3 text-sm text-gray-500">
              Analyzing {{ response.tasks.length }} task(s) against story requirements
            </div>
          </div>
        </div>
      </div>

      <!-- Identified Gaps -->
      <div v-if="response.gaps.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Identified Gaps</h2>
        <div class="space-y-3">
          <div
            v-for="(gap, index) in response.gaps"
            :key="index"
            class="flex items-start p-3 rounded-lg"
            :class="getGapBgColor(gap.severity)"
          >
            <div class="flex-shrink-0">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getGapBadgeColor(gap.severity)"
              >
                {{ gap.severity }}
              </span>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ gap.requirement }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ gap.suggestion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggested Updates -->
      <div v-if="response.suggestions_for_updates.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Suggested Task Updates</h2>
        <div class="space-y-4">
          <div
            v-for="(suggestion, index) in response.suggestions_for_updates"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-300 hover:bg-gray-50 transition-colors"
            @click="openComparisonModal(suggestion)"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-sm font-medium text-gray-900">{{ suggestion.task_key }}</h3>
              <div class="flex space-x-2">
                <button
                  @click.stop="handlePreviewUpdate(suggestion)"
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Preview
                </button>
                <button
                  @click.stop="handleApplyUpdate(suggestion)"
                  class="text-sm text-green-600 hover:text-green-800"
                >
                  Apply
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500 text-xs mb-1">Current:</p>
                <p class="text-gray-700">{{ truncate(suggestion.current_description, 100) }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">Suggested:</p>
                <p class="text-gray-700">{{ truncate(suggestion.suggested_description, 100) }}</p>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500 text-center">
              Click to view full comparison
            </div>
          </div>
        </div>
      </div>

      <!-- Suggested New Tasks -->
      <div v-if="response.suggestions_for_new_tasks.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Suggested New Tasks</h2>
        <div class="space-y-4">
          <div
            v-for="(suggestion, index) in response.suggestions_for_new_tasks"
            :key="index"
            class="border border-green-200 bg-green-50 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-sm font-medium text-gray-900">{{ suggestion.summary }}</h3>
              <div class="flex space-x-2">
                <button
                  @click="handlePreviewCreate(suggestion)"
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Preview
                </button>
                <button
                  @click="handleApplyCreate(suggestion)"
                  class="text-sm text-green-600 hover:text-green-800"
                >
                  Create
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ truncate(suggestion.description, 150) }}</p>
            <p class="text-xs text-gray-500">Addresses gap: {{ suggestion.gap_addressed }}</p>
          </div>
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
      operation-type="analyze_coverage"
      :original-request="{ story_key: storyKey.trim(), additional_context: additionalContext || undefined }"
      :original-system-prompt="response?.system_prompt"
      :original-user-prompt="response?.user_prompt || ''"
      :original-result="response"
      @close="showABTestModal = false"
      @result="handleABTestResult"
    />

    <!-- Task Update Comparison Modal -->
    <TaskUpdateComparisonModal
      v-if="selectedSuggestion"
      :suggestion="selectedSuggestion"
      @close="selectedSuggestion = null"
      @preview="handlePreviewUpdate"
      @apply="handleApplyUpdate"
    />

    <!-- New Task Preview Modal -->
    <NewTaskPreviewModal
      v-if="showNewTaskPreviewModal && previewingNewTask"
      :suggestion="previewingNewTask"
      @close="handleCloseNewTaskPreview"
      @create="handleCreateFromPreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { analyzeStoryCoverage, updateJiraTicket, createTaskFromSuggestion, getJobStatus } from '../api/endpoints';
import type { StoryCoverageResponse, UpdateSuggestion, NewTaskSuggestion, BatchResponse } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PromptViewer from '../components/PromptViewer.vue';
import PromptResubmitModal from '../components/PromptResubmitModal.vue';
import TaskUpdateComparisonModal from '../components/TaskUpdateComparisonModal.vue';
import NewTaskPreviewModal from '../components/NewTaskPreviewModal.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import { useJobPolling } from '../composables/useJobPolling';
import { useJobUrl } from '../composables/useJobUrl';
import { error } from '../utils/logger';

const route = useRoute();
const modelsStore = useModelsStore();
const uiStore = useUIStore();

const storyKey = ref('');
const additionalContext = ref('');
const contextInherited = ref(false);
const contextInheritedFrom = ref('Inherited from previous operation');
const includeTestCases = ref(true);
const asyncMode = ref(true);
const loading = ref(false);
const response = ref<StoryCoverageResponse | null>(null);
const showABTestModal = ref(false);
const selectedSuggestion = ref<UpdateSuggestion | null>(null);
const showNewTaskPreviewModal = ref(false);
const previewingNewTask = ref<NewTaskSuggestion | null>(null);

// Use useJobUrl for job ID management
const { jobId, setJobId: setJobIdInUrl, removeFromUrl: removeJobIdFromUrl } = useJobUrl('jobId');

// Job polling
const { job: jobStatus, isPolling, isCancelling, startPolling, cancelJob: cancelJobPolling } = useJobPolling(
  jobId,
  {
    onComplete: async (job) => {
      // When job completes, fetch the results
      if (job.results) {
        // The results should contain the StoryCoverageResponse
        response.value = job.results as StoryCoverageResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Analysis complete: ${response.value.coverage_percentage.toFixed(0)}% coverage`);
        }
        // Don't clear job ID from URL - keep it for reference
        // Only clear the local ref to hide status card
        // Note: Form fields (storyKey, additionalContext, etc.) are preserved and NOT cleared
        jobId.value = null;
      }
    },
    onError: (error) => {
      error('Job polling error:', error);
    },
  }
);

// Restore job from URL on mount
onMounted(async () => {
  // Prefill form from query params
  if (route.query.storyKey && typeof route.query.storyKey === 'string') {
    storyKey.value = route.query.storyKey;
  }
  // Prefill additional context from query params (for cross-operation context reuse)
  if (route.query.additionalContext && typeof route.query.additionalContext === 'string') {
    additionalContext.value = route.query.additionalContext;
    contextInherited.value = true;
    contextInheritedFrom.value = 'Inherited from previous operation';
  }
  
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      
      // Prefill form from job data if not already set from query params
      if (!storyKey.value && job.story_key) {
        storyKey.value = job.story_key;
      }
      
      // Prefill additional context from job (top-level or nested in results)
      if (!additionalContext.value) {
        const jobContext = job.additional_context || 
          (job.results && typeof job.results === 'object' ? (job.results as any).additional_context : null);
        if (jobContext) {
          additionalContext.value = jobContext;
          contextInherited.value = true;
          contextInheritedFrom.value = 'Inherited from job';
        }
      }
      
      if (['started', 'processing'].includes(job.status)) {
        // Job is still active, start polling
        startPolling();
      } else if (job.status === 'completed' && job.results) {
        // Job is completed, restore results
        response.value = job.results as StoryCoverageResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Analysis complete: ${response.value.coverage_percentage.toFixed(0)}% coverage`);
        }
        // Clear local ref to hide status card, but keep in URL
        // Note: Form fields (storyKey, additionalContext, etc.) are preserved and NOT cleared
        jobId.value = null;
      } else if (job.status === 'failed') {
        uiStore.showError(`Job failed: ${job.error || 'Unknown error'}`);
        jobId.value = null;
      } else if (job.status === 'cancelled') {
        uiStore.showInfo('Job was cancelled');
        jobId.value = null;
      }
    } catch (err: any) {
      error('Error restoring job from URL:', err);
      uiStore.showError('Failed to restore job from URL');
      removeJobIdFromUrl();
    }
  }
});

async function handleAnalyze() {
  const trimmedStoryKey = storyKey.value.trim();
  if (!trimmedStoryKey) {
    uiStore.showError('Please enter a story key');
    return;
  }

  // Clear job ID from URL before starting new analysis
  removeJobIdFromUrl();

  loading.value = true;
  response.value = null;

  try {
    const result = await analyzeStoryCoverage({
      story_key: trimmedStoryKey,
      include_test_cases: includeTestCases.value,
      llm_provider: modelsStore.selectedProvider || undefined,
      llm_model: modelsStore.selectedModel || undefined,
      additional_context: additionalContext.value || undefined,
      async_mode: asyncMode.value,
    });

    // Check if it's a BatchResponse (async mode)
    // BatchResponse has job_id property, StoryCoverageResponse has success property
    if (result && typeof result === 'object' && 'job_id' in result) {
      const batchResponse = result as BatchResponse;
      setJobIdInUrl(batchResponse.job_id);
      uiStore.showInfo(`Job started: ${batchResponse.job_id}`);
      startPolling();
    } else if (result && typeof result === 'object' && 'success' in result && (result as StoryCoverageResponse).success) {
      // Synchronous response
      response.value = result as StoryCoverageResponse;
      uiStore.showSuccess(`Analysis complete: ${result.coverage_percentage.toFixed(0)}% coverage`);
    } else {
      uiStore.showError('Failed to analyze coverage');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to analyze coverage');
    error('Error analyzing coverage:', error);
  } finally {
    loading.value = false;
  }
}

function openComparisonModal(suggestion: UpdateSuggestion) {
  // Get current test cases from the tasks array if available
  if (response.value) {
    const task = response.value.tasks.find(t => t.task_key === suggestion.task_key);
    if (task && task.test_cases) {
      // Add current_test_cases to the suggestion object
      selectedSuggestion.value = {
        ...suggestion,
        current_test_cases: task.test_cases,
      };
      return;
    }
  }
  selectedSuggestion.value = suggestion;
}

async function handlePreviewUpdate(suggestion: UpdateSuggestion) {
  try {
    const result = await updateJiraTicket({
      ticket_key: suggestion.task_key,
      description: suggestion.suggested_description,
      test_cases: suggestion.suggested_test_cases,
      update_jira: false,
    });
    uiStore.showInfo(`Preview: ${result.message}`);
    selectedSuggestion.value = null;
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to preview update');
  }
}

async function handleApplyUpdate(suggestion: UpdateSuggestion) {
  if (!confirm(`Apply updates to ${suggestion.task_key}?`)) return;

  try {
    const result = await updateJiraTicket({
      ticket_key: suggestion.task_key,
      description: suggestion.suggested_description,
      test_cases: suggestion.suggested_test_cases,
      update_jira: true,
    });
    
    if (result.success && result.updated_in_jira) {
      uiStore.showSuccess(`Successfully updated ${suggestion.task_key}`);
      selectedSuggestion.value = null;
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to update task');
  }
}

function handlePreviewCreate(suggestion: NewTaskSuggestion) {
  previewingNewTask.value = suggestion;
  showNewTaskPreviewModal.value = true;
}

function handleCloseNewTaskPreview() {
  showNewTaskPreviewModal.value = false;
  previewingNewTask.value = null;
}

function handleCreateFromPreview() {
  if (previewingNewTask.value) {
    const taskToCreate = previewingNewTask.value;
    handleCloseNewTaskPreview();
    handleApplyCreate(taskToCreate);
  } else {
    uiStore.showError('No task selected to create');
  }
}

async function handleApplyCreate(suggestion: NewTaskSuggestion) {
  if (!suggestion || !suggestion.ready_to_submit) {
    uiStore.showError('Invalid task suggestion');
    return;
  }

  if (!suggestion.ready_to_submit.story_key) {
    uiStore.showError('Story key is required to create task');
    return;
  }

  if (!confirm(`Create task "${suggestion.summary}" in JIRA?`)) {
    return;
  }

  loading.value = true;

  try {
    // Use the dedicated endpoint that automatically gets the parent epic from the story
    const result = await createTaskFromSuggestion({
      story_key: suggestion.ready_to_submit.story_key,
      task_summary: suggestion.ready_to_submit.task_summary,
      task_description: suggestion.ready_to_submit.task_description,
      test_cases: suggestion.ready_to_submit.test_cases,
      create_ticket: true,
    });

    if (result.success && result.task_key) {
      uiStore.showSuccess(`Successfully created task: ${result.task_key}`);
      // Optionally refresh the analysis to show the new task
      // handleAnalyze();
    } else {
      uiStore.showError(`Failed to create task: ${result.error || result.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
    uiStore.showError(`Failed to create task: ${errorMsg}`);
    error('Error creating task:', error);
  } finally {
    loading.value = false;
  }
}

function handleTestPrompt() {
  showABTestModal.value = true;
}

function handleABTestResult(result: any) {
  uiStore.showInfo('A/B test completed');
}

function handleContextInput() {
  contextInherited.value = false;
}

function getCoverageColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getGapBgColor(severity: string): string {
  if (severity === 'critical') return 'bg-red-50';
  if (severity === 'high') return 'bg-orange-50';
  if (severity === 'medium') return 'bg-yellow-50';
  return 'bg-blue-50';
}

function getGapBadgeColor(severity: string): string {
  if (severity === 'critical') return 'bg-red-100 text-red-800';
  if (severity === 'high') return 'bg-orange-100 text-orange-800';
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-blue-100 text-blue-800';
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

async function handleCancelJob() {
  if (!jobId.value) {
    return;
  }
  
  try {
    await cancelJobPolling();
    
    // Restore form fields from job data before removing from URL
    if (jobStatus.value) {
      // Restore storyKey if empty
      if (!storyKey.value && jobStatus.value.story_key) {
        storyKey.value = jobStatus.value.story_key;
      }
      
      // Restore additionalContext if empty
      if (!additionalContext.value) {
        const jobContext = jobStatus.value.additional_context || 
          (jobStatus.value.results && typeof jobStatus.value.results === 'object' ? (jobStatus.value.results as any).additional_context : null);
        if (jobContext) {
          additionalContext.value = jobContext;
        }
      }
    }
    
    // Only remove from URL if cancel was successful
    // The cancelJobPolling function handles the API call, status checks, and status updates
    removeJobIdFromUrl();
  } catch (err: any) {
    // Error is already handled in cancelJobPolling, but we don't remove from URL on error
    error('Error cancelling job:', err);
  }
}

async function refreshJob() {
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      if (job.status === 'completed' && job.results) {
        response.value = job.results as StoryCoverageResponse;
        if (response.value.success) {
          uiStore.showSuccess(`Analysis complete: ${response.value.coverage_percentage.toFixed(0)}% coverage`);
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
    response.value = jobStatus.value.results as StoryCoverageResponse;
    if (response.value.success) {
      uiStore.showSuccess(`Analysis complete: ${response.value.coverage_percentage.toFixed(0)}% coverage`);
    }
    jobId.value = null;
  }
}
</script>










