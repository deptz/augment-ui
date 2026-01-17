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
            ref="repoSelectorRef"
            v-model="repos"
            :disabled="loading"
            :max-repos="5"
            :min-repos="1"
          />
        </div>

        <!-- Scope (Optional) -->
        <div>
          <button
            type="button"
            @click="showScopeSection = !showScopeSection"
            class="flex items-center justify-between w-full text-left"
          >
            <label class="block text-sm font-medium text-gray-700">
              Scope (Optional)
            </label>
            <svg
              :class="['w-5 h-5 text-gray-500 transition-transform', showScopeSection ? 'transform rotate-180' : '']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="showScopeSection" class="mt-3 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <!-- Include Paths -->
            <div>
              <label for="include-paths" class="block text-sm font-medium text-gray-700 mb-1">
                Include Paths
              </label>
              <textarea
                id="include-paths"
                v-model="scopeIncludePaths"
                placeholder="e.g., src/api/**, tests/**"
                rows="3"
                :disabled="loading"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-xs"
              />
              <p class="mt-1 text-xs text-gray-500">
                Glob patterns for paths to include (one per line). Examples: <code class="bg-gray-200 px-1 rounded">src/api/**</code>, <code class="bg-gray-200 px-1 rounded">*.py</code>
              </p>
            </div>

            <!-- Exclude Paths -->
            <div>
              <label for="exclude-paths" class="block text-sm font-medium text-gray-700 mb-1">
                Exclude Paths
              </label>
              <textarea
                id="exclude-paths"
                v-model="scopeExcludePaths"
                placeholder="e.g., tests/**, *.test.js"
                rows="3"
                :disabled="loading"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-xs"
              />
              <p class="mt-1 text-xs text-gray-500">
                Glob patterns for paths to exclude (one per line). Examples: <code class="bg-gray-200 px-1 rounded">tests/**</code>, <code class="bg-gray-200 px-1 rounded">*.test.js</code>
              </p>
            </div>
          </div>
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
const repoSelectorRef = ref<InstanceType<typeof RepoSelector> | null>(null);
const showScopeSection = ref(false);
const scopeIncludePaths = ref('');
const scopeExcludePaths = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const existingJobId = ref<string | null>(null);

const isFormValid = computed(() => {
  // Check basic requirements
  if (!formData.value.story_key || formData.value.story_key.trim().length === 0) {
    return false;
  }

  if (repos.value.length === 0 || repos.value.length > 5) {
    return false;
  }

  // Check for repo selector errors if ref is available
  if (repoSelectorRef.value) {
    if (repoSelectorRef.value.hasErrors || repoSelectorRef.value.hasEmptyUrls) {
      return false;
    }
  }

  // Validate all repos have URLs
  for (const repo of repos.value) {
    const url = typeof repo === 'string' ? repo : repo.url;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return false;
    }
  }

  return true;
});

async function handleSubmit() {
  if (!isFormValid.value) {
    return;
  }

  loading.value = true;
  error.value = null;
  existingJobId.value = null;

  try {
    // Validate repos have valid URLs
    for (const repo of repos.value) {
      const url = typeof repo === 'string' ? repo : repo.url;
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        error.value = 'All repositories must have a valid URL';
        uiStore.showError(error.value);
        return;
      }
    }

    // Convert repos to the format expected by API
    const reposFormatted = repos.value.map(repo => {
      if (typeof repo === 'string') {
        return { url: repo.trim() };
      }
      return { 
        url: repo.url.trim(), 
        branch: repo.branch?.trim() || undefined 
      };
    });

    // Parse scope if provided
    let scope: { files?: string[]; include_paths?: string[]; exclude_paths?: string[] } | undefined;
    
    const includePaths = scopeIncludePaths.value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0 && !/^\s*$/.test(p)); // Filter out empty and whitespace-only strings
    
    const excludePaths = scopeExcludePaths.value
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0 && !/^\s*$/.test(p)); // Filter out empty and whitespace-only strings
    
    if (includePaths.length > 0 || excludePaths.length > 0) {
      scope = {};
      if (includePaths.length > 0) {
        scope.include_paths = includePaths;
      }
      if (excludePaths.length > 0) {
        scope.exclude_paths = excludePaths;
      }
    }

    const request: CreateDraftPRRequest = {
      story_key: formData.value.story_key.trim(),
      repos: reposFormatted,
      scope: scope && (scope.include_paths?.length > 0 || scope.exclude_paths?.length > 0) ? scope : undefined,
      additional_context: formData.value.additional_context?.trim() || undefined,
      mode: formData.value.mode || 'normal',
    };

    const response = await createDraftPR(request);
    
    // Redirect to job detail page
    router.push(`/draft-pr/jobs/${response.job_id}`);
  } catch (err: any) {
    // Handle 409 Conflict (duplicate job)
    if (err.response?.status === 409) {
      const jobId = err.response.headers['x-active-job-id'] || 
                    err.response.headers['X-Active-Job-Id'] ||
                    err.response?.data?.job_id;
      if (jobId) {
        existingJobId.value = jobId;
        error.value = `Story ${formData.value.story_key} is already being processed.`;
        uiStore.showError(error.value);
      } else {
        error.value = `Story ${formData.value.story_key} is already being processed. Please check existing jobs.`;
        uiStore.showError(error.value);
      }
    } else if (err.response?.status === 400) {
      // Handle validation errors
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        error.value = detail;
      } else if (detail && typeof detail === 'object') {
        // Handle field-specific errors
        const errors = Object.entries(detail)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        error.value = `Validation error: ${errors}`;
      } else {
        error.value = 'Invalid request. Please check your input.';
      }
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
