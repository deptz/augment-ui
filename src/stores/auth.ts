import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../api/client';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const username = ref('');
  const showAuthModal = ref(false);

  // Check if auto auth modal is enabled (defaults to true for backward compatibility)
  const autoAuthModalEnabled = computed(() => {
    const envValue = import.meta.env.VITE_AUTO_AUTH_MODAL;
    // If not set, default to true (current behavior)
    return envValue === undefined || envValue === '' || envValue === 'true';
  });

  // Check if credentials are already stored
  function checkAuth() {
    const auth = apiClient.getAuth();
    if (auth) {
      isAuthenticated.value = true;
      username.value = auth.username;
    } else {
      // Only show modal automatically if VITE_AUTO_AUTH_MODAL is enabled
      if (autoAuthModalEnabled.value) {
        showAuthModal.value = true;
      }
    }
  }

  function setCredentials(user: string, password: string) {
    apiClient.setAuth(user, password);
    isAuthenticated.value = true;
    username.value = user;
    showAuthModal.value = false;
  }

  function clearCredentials() {
    apiClient.clearAuth();
    isAuthenticated.value = false;
    username.value = '';
    // Always show modal when user manually clears credentials
    showAuthModal.value = true;
  }

  // Called when credentials are cleared externally (e.g., on 401 error)
  // Only shows modal if auto auth modal is enabled
  function handleExternalAuthClear() {
    isAuthenticated.value = false;
    username.value = '';
    // Only show modal if auto auth modal is enabled
    if (autoAuthModalEnabled.value) {
      showAuthModal.value = true;
    }
  }

  function closeAuthModal() {
    showAuthModal.value = false;
  }

  return {
    isAuthenticated,
    username,
    showAuthModal,
    checkAuth,
    setCredentials,
    clearCredentials,
    handleExternalAuthClear,
    closeAuthModal,
  };
});










