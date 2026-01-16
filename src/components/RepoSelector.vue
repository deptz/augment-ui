<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Repositories (Optional)
      <span class="text-xs font-normal text-gray-500 ml-2">{{ repos.length }}/{{ maxRepos }} repos</span>
    </label>

    <!-- Repository entries -->
    <div v-if="repos.length > 0" class="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50 mb-3">
      <div
        v-for="(repo, index) in repos"
        :key="index"
        class="bg-white rounded border p-3"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-medium text-gray-500">Repository {{ index + 1 }}</span>
          <button
            @click="removeRepo(index)"
            :disabled="disabled"
            class="text-red-600 hover:text-red-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>

        <!-- URL Input -->
        <div class="mb-2">
          <input
            :value="getRepoUrl(repo)"
            @input="updateRepoUrl(index, ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="https://github.com/org/repo.git or git@github.com:org/repo.git"
            :disabled="disabled"
            class="block w-full border rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            :class="getUrlError(repo) ? 'border-red-300' : 'border-gray-300'"
          />
          <p v-if="getUrlError(repo)" class="mt-1 text-xs text-red-600">
            {{ getUrlError(repo) }}
          </p>
        </div>

        <!-- Branch Input (optional) -->
        <div>
          <div class="flex items-center gap-2">
            <input
              :value="getRepoBranch(repo)"
              @input="updateRepoBranch(index, ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Branch (optional, e.g., main, develop)"
              :disabled="disabled"
              class="block w-full border rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              :class="getBranchError(repo) ? 'border-red-300' : 'border-gray-300'"
            />
          </div>
          <p v-if="getBranchError(repo)" class="mt-1 text-xs text-red-600">
            {{ getBranchError(repo) }}
          </p>
        </div>
      </div>

      <!-- Add button inside container -->
      <button
        v-if="repos.length < maxRepos"
        @click="addRepo"
        :disabled="disabled"
        class="w-full text-sm text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 rounded-md py-2 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Repository
      </button>
    </div>

    <!-- Add button when no repos -->
    <button
      v-else
      @click="addRepo"
      :disabled="disabled"
      class="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      + Add Repository
    </button>

    <!-- Warning banner when repos are added -->
    <div v-if="repos.length > 0" class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div class="flex items-start gap-2">
        <svg class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm">
          <p class="font-medium text-amber-800">Code-Aware Analysis Enabled</p>
          <p class="text-amber-700 mt-1">
            Adding repositories enables deep code analysis. This process takes <strong>5-20 minutes</strong>
            and requires async mode. The analysis will examine actual repository code structure for more accurate results.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RepoInput, RepoSpec } from '../types/api';

const props = withDefaults(defineProps<{
  modelValue: RepoInput[];
  maxRepos?: number;
  disabled?: boolean;
}>(), {
  maxRepos: 5,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: RepoInput[]];
}>();

const repos = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// URL validation: must start with https:// or git@
function isValidUrl(url: string): boolean {
  if (!url) return true; // Empty is valid (will be caught as required)
  return url.startsWith('https://') || url.startsWith('git@');
}

// Branch validation: alphanumeric, dash, underscore, dot, forward slash
function isValidBranch(branch: string): boolean {
  if (!branch) return true; // Empty is valid (optional)
  return /^[a-zA-Z0-9._/-]+$/.test(branch);
}

function getRepoUrl(repo: RepoInput): string {
  if (typeof repo === 'string') return repo;
  return repo.url;
}

function getRepoBranch(repo: RepoInput): string {
  if (typeof repo === 'string') return '';
  return repo.branch || '';
}

function getUrlError(repo: RepoInput): string | null {
  const url = getRepoUrl(repo);
  if (url && !isValidUrl(url)) {
    return 'URL must start with https:// or git@';
  }
  return null;
}

function getBranchError(repo: RepoInput): string | null {
  const branch = getRepoBranch(repo);
  if (branch && !isValidBranch(branch)) {
    return 'Branch name can only contain letters, numbers, dots, dashes, underscores, and forward slashes';
  }
  return null;
}

function addRepo() {
  if (repos.value.length >= props.maxRepos) return;
  const newRepos = [...repos.value, { url: '', branch: '' } as RepoSpec];
  emit('update:modelValue', newRepos);
}

function removeRepo(index: number) {
  const newRepos = repos.value.filter((_, i) => i !== index);
  emit('update:modelValue', newRepos);
}

function updateRepoUrl(index: number, url: string) {
  const newRepos = [...repos.value];
  const currentRepo = newRepos[index];
  const branch = typeof currentRepo === 'string' ? '' : currentRepo.branch;

  // If no branch, just use URL string; otherwise use RepoSpec
  if (!branch) {
    newRepos[index] = url;
  } else {
    newRepos[index] = { url, branch };
  }
  emit('update:modelValue', newRepos);
}

function updateRepoBranch(index: number, branch: string) {
  const newRepos = [...repos.value];
  const currentRepo = newRepos[index];
  const url = typeof currentRepo === 'string' ? currentRepo : currentRepo.url;

  // Always use RepoSpec when branch is set
  if (branch) {
    newRepos[index] = { url, branch };
  } else {
    // No branch, just use URL string
    newRepos[index] = url;
  }
  emit('update:modelValue', newRepos);
}

// Expose validation for parent components
defineExpose({
  hasErrors: computed(() => {
    return repos.value.some(repo => getUrlError(repo) || getBranchError(repo));
  }),
  hasEmptyUrls: computed(() => {
    return repos.value.some(repo => !getRepoUrl(repo));
  }),
});
</script>
