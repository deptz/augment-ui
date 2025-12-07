<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="mt-2 text-sm text-gray-600">
        Manage your application settings and preferences
      </p>
    </div>

    <!-- Authentication Section -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Authentication</h2>
      
      <div class="space-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Current User</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ authStore.username || 'Not authenticated' }}</dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Status</dt>
          <dd class="mt-1">
            <span
              v-if="authStore.isAuthenticated"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Connected
            </span>
            <span
              v-else
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              Not Connected
            </span>
          </dd>
        </div>

        <div>
          <button
            @click="handleClearCredentials"
            class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Credentials
          </button>
          <p class="mt-2 text-xs text-gray-500">
            This will log you out and remove stored credentials
          </p>
        </div>
      </div>
    </div>

    <!-- LLM Configuration Section -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">LLM Configuration</h2>
      
      <div class="space-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Default Provider</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ modelsStore.defaultProvider || 'Loading...' }}</dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Available Providers</dt>
          <dd class="mt-1 text-sm text-gray-900">
            <span v-for="(provider, index) in modelsStore.providers" :key="provider">
              {{ provider }}<span v-if="index < modelsStore.providers.length - 1">, </span>
            </span>
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Currently Selected</dt>
          <dd class="mt-1 text-sm text-gray-900">
            {{ modelsStore.selectedProvider || 'default' }} / {{ modelsStore.selectedModel || 'default' }}
          </dd>
        </div>

        <div>
          <button
            @click="handleRefreshModels"
            :disabled="refreshing"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <LoadingSpinner v-if="refreshing" size="sm" class="mr-2" />
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Models</span>
          </button>
        </div>
      </div>
    </div>

    <!-- API Configuration Section -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">API Configuration</h2>
      
      <div class="space-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">API Base URL</dt>
          <dd class="mt-1 text-sm text-gray-900 font-mono">{{ apiBaseUrl }}</dd>
        </div>

        <div>
          <button
            @click="handleTestConnection"
            :disabled="testing"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100"
          >
            <LoadingSpinner v-if="testing" size="sm" class="mr-2" />
            <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Test Connection</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useModelsStore } from '../stores/models';
import { useUIStore } from '../stores/ui';
import { healthCheck } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const authStore = useAuthStore();
const modelsStore = useModelsStore();
const uiStore = useUIStore();

const refreshing = ref(false);
const testing = ref(false);

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
});

function handleClearCredentials() {
  if (confirm('Are you sure you want to clear your credentials? You will need to log in again.')) {
    authStore.clearCredentials();
    uiStore.showInfo('Credentials cleared');
  }
}

async function handleRefreshModels() {
  refreshing.value = true;
  try {
    await modelsStore.fetchModels();
    uiStore.showSuccess('Models refreshed successfully');
  } catch (error) {
    uiStore.showError('Failed to refresh models');
  } finally {
    refreshing.value = false;
  }
}

async function handleTestConnection() {
  testing.value = true;
  try {
    const result = await healthCheck();
    if (result.status === 'healthy') {
      uiStore.showSuccess('Connection successful');
    } else {
      uiStore.showWarning('Connection established but some services may be unavailable');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Connection failed');
  } finally {
    testing.value = false;
  }
}
</script>










