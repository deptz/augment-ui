import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { error } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private authCredentials: { username: string; password: string } | null = null;
  private readonly publicEndpoints = ['/health'];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Skip auth for public endpoints
        const isPublicEndpoint = this.publicEndpoints.some(
          (endpoint) => config.url === endpoint || config.url?.startsWith(endpoint)
        );

        if (this.authCredentials && !isPublicEndpoint) {
          const auth = btoa(`${this.authCredentials.username}:${this.authCredentials.password}`);
          config.headers.Authorization = `Basic ${auth}`;
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response?.status === 401) {
          // Don't clear credentials if using environment variable defaults
          // (user cannot re-enter them via the modal)
          if (!this.isUsingDefaultCredentials()) {
            // Clear stored credentials on 401
            this.clearAuth();
            // Notify auth store to update state and conditionally show modal
            // Use lazy import to avoid circular dependency
            import('../stores/auth').then(({ useAuthStore }) => {
              const authStore = useAuthStore();
              authStore.handleExternalAuthClear();
            });
          }
        }
        return Promise.reject(err);
      }
    );

    // Load credentials from localStorage
    this.loadAuthFromStorage();
  }

  setAuth(username: string, password: string) {
    this.authCredentials = { username, password };
    // Store in localStorage
    localStorage.setItem('jira_auth', JSON.stringify(this.authCredentials));
  }

  clearAuth() {
    this.authCredentials = null;
    localStorage.removeItem('jira_auth');
  }

  getAuth() {
    return this.authCredentials;
  }

  isUsingDefaultCredentials(): boolean {
    const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME;
    const defaultPassword = import.meta.env.VITE_DEFAULT_PASSWORD;
    return !!(defaultUsername && defaultPassword);
  }

  private loadAuthFromStorage() {
    // First, check for environment variable defaults
    const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME;
    const defaultPassword = import.meta.env.VITE_DEFAULT_PASSWORD;

    if (defaultUsername && defaultPassword) {
      this.authCredentials = {
        username: defaultUsername,
        password: defaultPassword,
      };
      return;
    }

    // Fall back to localStorage
    const stored = localStorage.getItem('jira_auth');
    if (stored) {
      try {
        this.authCredentials = JSON.parse(stored);
      } catch (e) {
        error('Failed to parse stored auth', e);
        localStorage.removeItem('jira_auth');
      }
    }
  }

  get axios() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

