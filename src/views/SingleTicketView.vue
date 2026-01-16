<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Single Ticket Description Backfill</h1>
      <p class="mt-2 text-sm text-gray-600">
        Generate AI-powered descriptions for individual JIRA tickets. Review and edit before updating.
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div class="space-y-6">
        <!-- Ticket Key Input -->
        <div>
          <label for="ticket-key" class="block text-sm font-medium text-gray-700">
            Ticket Key
          </label>
          <input
            id="ticket-key"
            v-model="ticketKey"
            type="text"
            placeholder="e.g., PROJ-123"
            @blur="ticketKey = ticketKey.trim()"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handleGenerate"
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
              Inherited from previous operation
            </span>
          </div>
          <textarea
            id="additional-context"
            v-model="additionalContext"
            placeholder="Provide any additional context or instructions for generating the description..."
            rows="4"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @input="contextInherited = false"
          />
          <p class="mt-1 text-xs text-gray-500">Optional: Add any extra context or specific requirements for the description generation</p>
        </div>

        <!-- Repository Selector -->
        <RepoSelector v-model="repos" :disabled="loading" />

        <!-- Async Mode Option -->
        <div class="flex items-center">
          <input
            id="async-mode"
            v-model="asyncMode"
            type="checkbox"
            :disabled="repos.length > 0"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label for="async-mode" class="ml-2 block text-sm text-gray-900" :class="{ 'text-gray-500': repos.length > 0 }">
            Run in background (for long-running operations)
            <span v-if="repos.length > 0" class="text-xs text-gray-500 ml-1">(required when using repositories)</span>
          </label>
        </div>

        <!-- Generate Button -->
        <div>
          <button
            @click="handleGenerate"
            :disabled="!ticketKey.trim() || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Generate Description</span>
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
      <!-- Ticket Info -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Ticket Information</h2>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Ticket Key</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ response.ticket_key }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Summary</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ response.summary }}</dd>
          </div>
          <div v-if="response.assignee_name">
            <dt class="text-sm font-medium text-gray-500">Assignee</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ response.assignee_name }}</dd>
          </div>
          <div v-if="response.parent_name">
            <dt class="text-sm font-medium text-gray-500">Parent/Epic</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ response.parent_name }}</dd>
          </div>
        </dl>
      </div>

      <!-- Generated Description -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Generated Description</h2>
          <div class="flex space-x-2">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              v-else
              @click="isEditing = false"
              class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
        
        <textarea
          v-model="editedDescription"
          :readonly="!isEditing"
          :class="{ 'bg-gray-50': !isEditing, 'bg-white': isEditing }"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
          rows="15"
        ></textarea>

        <!-- Action Buttons -->
        <div class="mt-4 flex space-x-3">
          <button
            @click="handlePreview"
            :disabled="updating"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="previewing" size="sm" class="mr-2" />
            <span v-else>Preview Update</span>
          </button>
          <button
            @click="handleUpdate"
            :disabled="updating || !previewData"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="updating" size="sm" color="white" class="mr-2" />
            <span v-else>Update JIRA</span>
          </button>
        </div>
      </div>

      <!-- Preview Data -->
      <div v-if="previewData" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-sm font-medium text-blue-900 mb-2">Preview</h3>
        <p class="text-sm text-blue-700">{{ previewData.message }}</p>
        <div v-if="previewData.preview" class="mt-4 text-xs text-blue-600">
          <p>Changes will be applied to ticket: <strong>{{ previewData.ticket_key }}</strong></p>
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
      operation-type="generate_single"
      :original-request="{ ticket_key: ticketKey.trim() }"
      :original-system-prompt="response?.system_prompt"
      :original-user-prompt="response?.user_prompt || ''"
      :original-result="response"
      @close="showABTestModal = false"
      @result="handleABTestResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { generateSingle, updateJiraTicket } from '../api/endpoints';
import type { TicketResponse, JiraUpdateResponse, BatchResponse, RepoInput } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PromptViewer from '../components/PromptViewer.vue';
import PromptResubmitModal from '../components/PromptResubmitModal.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import RepoSelector from '../components/RepoSelector.vue';
import { useJobPolling } from '../composables/useJobPolling';
import { useJobUrl } from '../composables/useJobUrl';
import { getJobStatus } from '../api/endpoints';
import { error } from '../utils/logger';

const route = useRoute();
const modelsStore = useModelsStore();
const uiStore = useUIStore();

const ticketKey = ref('');
const additionalContext = ref('');
const contextInherited = ref(false);
const repos = ref<RepoInput[]>([]);
const asyncMode = ref(true);

// Auto-enable async mode when repos are added
watch(repos, (newRepos) => {
  if (newRepos.length > 0) {
    asyncMode.value = true;
  }
}, { deep: true });
const loading = ref(false);
const previewing = ref(false);
const updating = ref(false);
const response = ref<TicketResponse | null>(null);
const editedDescription = ref('');
const isEditing = ref(false);
const previewData = ref<JiraUpdateResponse | null>(null);
const showABTestModal = ref(false);

// Use useJobUrl for job ID management
const { jobId, setJobId: setJobIdInUrl, removeFromUrl: removeJobIdFromUrl } = useJobUrl('jobId');

// Job polling
const { job: jobStatus, isPolling, isCancelling, startPolling, cancelJob: cancelJobPolling } = useJobPolling(
  jobId,
  {
    onComplete: async (job) => {
      // When job completes, fetch the results
      if (job.results) {
        // The results should contain the TicketResponse
        response.value = job.results as TicketResponse;
        if (response.value.generated_description) {
          editedDescription.value = response.value.generated_description;
        }
        // Don't clear job ID from URL - keep it for reference
        // Only clear the local ref to hide status card
        // Note: Form fields (ticketKey, additionalContext, etc.) are preserved and NOT cleared
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
  if (route.query.ticketKey && typeof route.query.ticketKey === 'string') {
    ticketKey.value = route.query.ticketKey;
  }
  // Prefill additional context from query params (for cross-operation context reuse)
  if (route.query.additionalContext && typeof route.query.additionalContext === 'string') {
    additionalContext.value = route.query.additionalContext;
    contextInherited.value = true;
  }
  
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      
      // Prefill form from job data if not already set from query params
      if (!ticketKey.value && job.ticket_key) {
        ticketKey.value = job.ticket_key;
      }
      
      // Prefill additional context from job (top-level or nested in results)
      if (!additionalContext.value) {
        const jobContext = job.additional_context || 
          (job.results && typeof job.results === 'object' ? (job.results as any).additional_context : null);
        if (jobContext) {
          additionalContext.value = jobContext;
          contextInherited.value = true;
        }
      }
      
      if (['started', 'processing'].includes(job.status)) {
        // Job is still active, start polling
        startPolling();
      } else if (job.status === 'completed' && job.results) {
        // Job is completed, restore results
        response.value = job.results as TicketResponse;
        if (response.value.generated_description) {
          editedDescription.value = response.value.generated_description;
        }
        // Clear local ref to hide status card, but keep in URL
        // Note: Form fields (ticketKey, additionalContext, etc.) are preserved and NOT cleared
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

async function handleGenerate() {
  const trimmedTicketKey = ticketKey.value.trim();
  if (!trimmedTicketKey) {
    uiStore.showError('Please enter a ticket key');
    return;
  }

  // Clear job ID from URL before starting new generation
  removeJobIdFromUrl();

  loading.value = true;
  response.value = null;
  previewData.value = null;

  try {
    const result = await generateSingle({
      ticket_key: trimmedTicketKey,
      llm_provider: modelsStore.selectedProvider || undefined,
      llm_model: modelsStore.selectedModel || undefined,
      additional_context: additionalContext.value || undefined,
      async_mode: asyncMode.value,
      repos: repos.value.length > 0 ? repos.value : undefined,
    });

    // Check if it's a BatchResponse (async mode)
    if ('job_id' in result) {
      const batchResponse = result as BatchResponse;
      setJobIdInUrl(batchResponse.job_id);
      uiStore.showInfo(`Job started: ${batchResponse.job_id}`);
      startPolling();
    } else if (result.success) {
      // Synchronous response
      response.value = result as TicketResponse;
      editedDescription.value = result.generated_description;
      uiStore.showSuccess('Description generated successfully');
    } else {
      uiStore.showError(result.error || 'Failed to generate description');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to generate description');
    error('Error generating description:', error);
  } finally {
    loading.value = false;
  }
}

async function handleCancelJob() {
  if (!jobId.value) {
    return;
  }
  
  try {
    await cancelJobPolling();
    
    // Restore form fields from job data before removing from URL
    if (jobStatus.value) {
      // Restore ticketKey if empty
      if (!ticketKey.value && jobStatus.value.ticket_key) {
        ticketKey.value = jobStatus.value.ticket_key;
      }
      
      // Restore additionalContext if empty
      if (!additionalContext.value) {
        const jobContext = jobStatus.value.additional_context || 
          (jobStatus.value.results && typeof jobStatus.value.results === 'object' ? (jobStatus.value.results as any).additional_context : null);
        if (jobContext) {
          additionalContext.value = jobContext;
          contextInherited.value = true;
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
        response.value = job.results as TicketResponse;
        if (response.value.generated_description) {
          editedDescription.value = response.value.generated_description;
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
    response.value = jobStatus.value.results as TicketResponse;
    if (response.value.generated_description) {
      editedDescription.value = response.value.generated_description;
    }
    jobId.value = null;
  }
}

async function handlePreview() {
  if (!response.value) return;

  previewing.value = true;
  previewData.value = null;

  try {
    const result = await updateJiraTicket({
      ticket_key: response.value.ticket_key,
      description: editedDescription.value,
      update_jira: false,
    });

    previewData.value = result;
    uiStore.showInfo('Preview loaded - review changes before updating');
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to preview update');
    error('Error previewing update:', error);
  } finally {
    previewing.value = false;
  }
}

async function handleUpdate() {
  if (!response.value || !previewData.value) return;

  updating.value = true;

  try {
    const result = await updateJiraTicket({
      ticket_key: response.value.ticket_key,
      description: editedDescription.value,
      update_jira: true,
    });

    if (result.success && result.updated_in_jira) {
      uiStore.showSuccess(`Successfully updated ${result.ticket_key} in JIRA`);
      // Reset for next ticket
      response.value = null;
      editedDescription.value = '';
      previewData.value = null;
      ticketKey.value = '';
      additionalContext.value = '';
    } else {
      uiStore.showError(result.error || 'Failed to update JIRA');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to update JIRA');
    error('Error updating JIRA:', error);
  } finally {
    updating.value = false;
  }
}

function handleTestPrompt() {
  showABTestModal.value = true;
}

function handleABTestResult(result: any) {
  uiStore.showInfo('A/B test completed - you can compare the results');
}
</script>










