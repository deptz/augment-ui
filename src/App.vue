<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Auth Modal -->
    <AuthModal v-if="authStore.showAuthModal" />

    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center space-x-2">
              <img src="/augment_icon.png" alt="Augment" class="h-8 w-8" />
              <h1 class="text-xl font-bold text-gray-900">Augment</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
              >
                Home
              </router-link>
              
              <!-- Tools Dropdown -->
              <div class="relative tools-dropdown inline-flex items-center" ref="toolsDropdownRef">
                <button
                  @click="toggleToolsDropdown"
                  type="button"
                  :class="[
                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    isToolsActive ? 'border-indigo-500 text-gray-900' : ''
                  ]"
                >
                  Tools
                  <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div
                  v-if="showToolsDropdown"
                  @click.stop
                  class="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <router-link
                      to="/single-ticket"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Single Ticket
                    </router-link>
                    <router-link
                      to="/task-breakdown"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Task Breakdown
                    </router-link>
                    <router-link
                      to="/story-coverage"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Story Coverage
                    </router-link>
                    <router-link
                      to="/prd-sync"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      PRD Sync
                    </router-link>
                    <router-link
                      to="/sprint-planning"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sprint Planning
                    </router-link>
                    <router-link
                      to="/draft-pr"
                      @click="showToolsDropdown = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Draft PR
                    </router-link>
                  </div>
                </div>
              </div>
              
              <router-link
                to="/jobs"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
              >
                Jobs
              </router-link>
              <router-link
                to="/settings"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
              >
                Settings
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- LLM Selection -->
            <div class="flex items-center space-x-2" v-if="authStore.isAuthenticated && modelsStore.providers.length > 0">
              <select
                v-model="modelsStore.selectedProvider"
                @change="onProviderChange"
                class="text-xs border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option v-for="provider in modelsStore.providers" :key="provider" :value="provider">
                  {{ capitalize(provider) }}
                </option>
              </select>
              <select
                v-model="modelsStore.selectedModel"
                @change="onModelChange"
                class="text-xs border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option v-for="model in availableModels" :key="model" :value="model">
                  {{ model }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Notifications -->
    <NotificationContainer />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useModelsStore } from './stores/models';
import AuthModal from './components/AuthModal.vue';
import NotificationContainer from './components/NotificationContainer.vue';

const authStore = useAuthStore();
const modelsStore = useModelsStore();
const route = useRoute();
const showToolsDropdown = ref(false);
const toolsDropdownRef = ref<HTMLElement | null>(null);

const availableModels = computed(() => {
  return modelsStore.getModelsForProvider(modelsStore.selectedProvider);
});

const isToolsActive = computed(() => {
  const toolsRoutes = ['/single-ticket', '/task-breakdown', '/story-coverage', '/prd-sync', '/sprint-planning', '/draft-pr'];
  return toolsRoutes.includes(route.path);
});

function onProviderChange() {
  modelsStore.setProvider(modelsStore.selectedProvider);
}

function onModelChange() {
  modelsStore.setModel(modelsStore.selectedModel);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleToolsDropdown(e?: Event) {
  if (e) {
    e.stopPropagation();
  }
  showToolsDropdown.value = !showToolsDropdown.value;
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (toolsDropdownRef.value && !toolsDropdownRef.value.contains(target)) {
    showToolsDropdown.value = false;
  }
}

onMounted(() => {
  // Check authentication on mount
  authStore.checkAuth();
  
  // Fetch available models
  if (authStore.isAuthenticated) {
    modelsStore.fetchModels();
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
