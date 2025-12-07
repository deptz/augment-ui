<template>
  <div class="fixed z-10 inset-0 overflow-y-auto" @click="handleBackdropClick">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

      <div 
        ref="modalContentRef"
        @click.stop
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Authentication Required
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Enter your credentials to access the application.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-5 sm:mt-6 space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username / Email
            </label>
            <input
              v-model="username"
              type="text"
              id="username"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="your-email@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              API Password / Token
            </label>
            <input
              v-model="password"
              type="password"
              id="password"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-6">
            <button
              type="submit"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { healthCheck } from '../api/endpoints';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const error = ref('');
const modalContentRef = ref<HTMLElement | null>(null);

function handleBackdropClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // Only close if clicking directly on the backdrop, not on modal content
  if (modalContentRef.value && !modalContentRef.value.contains(target)) {
    authStore.closeAuthModal();
  }
}

async function handleSubmit() {
  error.value = '';
  
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password';
    return;
  }

  try {
    // Set credentials
    authStore.setCredentials(username.value, password.value);
    
    // Test the connection
    await healthCheck();
    
    // Success - modal will close automatically via store
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
    authStore.clearCredentials();
  }
}
</script>










