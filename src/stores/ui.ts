import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = defineStore('ui', () => {
  const loading = ref(false);
  const notifications = ref<Notification[]>([]);

  function setLoading(state: boolean) {
    loading.value = state;
  }

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      id,
      ...notification,
      duration: notification.duration || 5000,
    };
    notifications.value.push(newNotification);

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  function showSuccess(message: string) {
    addNotification({ type: 'success', message });
  }

  function showError(message: string) {
    addNotification({ type: 'error', message, duration: 7000 });
  }

  function showWarning(message: string) {
    addNotification({ type: 'warning', message });
  }

  function showInfo(message: string) {
    addNotification({ type: 'info', message });
  }

  return {
    loading,
    notifications,
    setLoading,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});










