import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { error } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private authCredentials: { username: string; password: string } | null = null;

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
        if (this.authCredentials) {
          const auth = btoa(`${this.authCredentials.username}:${this.authCredentials.password}`);
          config.headers.Authorization = `Basic ${auth}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear stored credentials on 401
          this.clearAuth();
        }
        return Promise.reject(error);
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

  private loadAuthFromStorage() {
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

