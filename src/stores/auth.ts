import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../api/client';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const username = ref('');
  const showAuthModal = ref(false);

  // Check if credentials are already stored
  function checkAuth() {
    const auth = apiClient.getAuth();
    if (auth) {
      isAuthenticated.value = true;
      username.value = auth.username;
    } else {
      showAuthModal.value = true;
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
    showAuthModal.value = true;
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
    closeAuthModal,
  };
});










