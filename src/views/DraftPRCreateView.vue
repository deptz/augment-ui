<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Create Draft PR</h1>
      <p class="mt-2 text-sm text-gray-600">
        Create a Draft PR from a JIRA story through a guided workflow: PLAN → REVIEW → APPROVE → MONITOR → COMPLETE
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Story Key Input -->
        <div>
          <label for="story-key" class="block text-sm font-medium text-gray-700">
            Story Key <span class="text-red-500">*</span>
          </label>
          <input
            id="story-key"
            v-model="formData.story_key"
            type="text"
            placeholder="e.g., STORY-123"
            required
            :disabled="loading"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p class="mt-1 text-xs text-gray-500">The JIRA story key to create a Draft PR from</p>
        </div>

        <!-- Repository Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Repositories <span class="text-red-500">*</span>
            <span class="text-xs font-normal text-gray-500 ml-2">(1-5 repos)</span>
          </label>
          <RepoSelector
            v-model="repos"
            :disabled="loading"
            :max-repos="5"
            :min-repos="1"
          />
        </div>

        <!-- Scope (Optional) -->
        <div>
          <label for="scope" class="block text-sm font-medium text-gray-700">
            Scope (Optional)
          </label>
          <textarea
            id="scope"
            v-model="scopeInput"
            placeholder="e.g., src/api/, tests/"
            rows="2"
            :disabled="loading"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p class="mt-1 text-xs text-gray-500">Comma-separated file paths or directories to limit scope</p>
        </div>

        <!-- Additional Context -->
        <div>
          <label for="additional-context" class="block text-sm font-medium text-gray-700">
            Additional Context (Optional)
          </label>
          <textarea
            id="additional-context"
            v-model="formData.additional_context"
            placeholder="Provide any additional context or instructions..."
            rows="4"
            :disabled="loading"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Mode Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mode <span class="text-red-500">*</span>
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="formData.mode"
                type="radio"
                value="normal"
                :disabled="loading"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span class="ml-2 text-sm text-gray-900">
                <span class="font-medium">Normal</span>
                <span class="text-gray-500 ml-1">- Requires manual approval before applying changes</span>
              </span>
            </label>
            <label class="flex items-center">
              <input
                v-model="formData.mode"
                type="radio"
                value="yolo"
                :disabled="loading"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span class="ml-2 text-sm text-gray-900">
                <span class="font-medium">YOLO</span>
                <span class="text-gray-500 ml-1">- Auto-approves plan and continues automatically</span>
              </span>
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
                <div v-if="existingJobId" class="mt-2">
                  <router-link
                    :to="`/draft-pr/jobs/${existingJobId}`"
                    class="font-medium underline hover:text-red-900"
                  >
                    View existing job
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Create Draft PR Job</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createDraftPR } from '@/api/endpoints';
import type { CreateDraftPRRequest, RepoInput } from '@/types/api';
import RepoSelector from '@/components/RepoSelector.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useUIStore } from '@/stores/ui';

const router = useRouter();
const uiStore = useUIStore();

const formData = ref<CreateDraftPRRequest>({
  story_key: '',
  repos: [],
  scope: undefined,
  additional_context: '',
  mode: 'normal',
});

const repos = ref<RepoInput[]>([]);
const scopeInput = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const existingJobId = ref<string | null>(null);

const isFormValid = computed(() => {
  return (
    formData.value.story_key.trim().length > 0 &&
    repos.value.length > 0 &&
    repos.value.length <= 5
  );
});

async function handleSubmit() {
  if (!isFormValid.value) {
    return;
  }

  loading.value = true;
  error.value = null;
  existingJobId.value = null;

  try {
    // Convert repos to the format expected by API
    const reposFormatted = repos.value.map(repo => {
      if (typeof repo === 'string') {
        return { url: repo };
      }
      return { url: repo.url, branch: repo.branch };
    });

    // Parse scope if provided
    let scope: { files?: string[] } | undefined;
    if (scopeInput.value.trim()) {
      const files = scopeInput.value
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      if (files.length > 0) {
        scope = { files };
      }
    }

    const request: CreateDraftPRRequest = {
      story_key: formData.value.story_key.trim(),
      repos: reposFormatted,
      scope,
      additional_context: formData.value.additional_context?.trim() || undefined,
      mode: formData.value.mode,
    };

    const response = await createDraftPR(request);
    
    // Redirect to job detail page
    router.push(`/draft-pr/jobs/${response.job_id}`);
  } catch (err: any) {
    // Handle 409 Conflict (duplicate job)
    if (err.response?.status === 409) {
      const jobId = err.response.headers['x-active-job-id'];
      existingJobId.value = jobId;
      error.value = `Story ${formData.value.story_key} is already being processed.`;
      uiStore.showError(error.value);
    } else {
      error.value = err.response?.data?.detail || err.message || 'Failed to create Draft PR job';
      uiStore.showError(error.value);
    }
  } finally {
    loading.value = false;
  }
}
</script>
