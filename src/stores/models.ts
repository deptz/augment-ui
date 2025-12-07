import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getModels } from '../api/endpoints';
import type { LLMModelsResponse } from '../types/api';
import { warn, error } from '../utils/logger';

// Cookie utilities
const COOKIE_NAMES = {
  PROVIDER: 'llm_provider',
  MODEL: 'llm_model',
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export const useModelsStore = defineStore('models', () => {
  const providers = ref<string[]>([]);
  const models = ref<{ [provider: string]: string[] }>({});
  const defaultProvider = ref<string>('');
  const currentConfig = ref<{ [provider: string]: string }>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Priority: Cookies > Env Variables > Empty
  const savedProvider = getCookie(COOKIE_NAMES.PROVIDER);
  const savedModel = getCookie(COOKIE_NAMES.MODEL);
  
  const envProvider = import.meta.env.VITE_DEFAULT_LLM_PROVIDER || '';
  const envModel = import.meta.env.VITE_DEFAULT_LLM_MODEL || '';

  // Selected provider and model
  const selectedProvider = ref<string>(savedProvider || envProvider);
  const selectedModel = ref<string>(savedModel || envModel);

  async function fetchModels() {
    loading.value = true;
    error.value = null;
    try {
      const data: LLMModelsResponse = await getModels();
      providers.value = data.providers;
      models.value = data.models;
      defaultProvider.value = data.default_provider;
      currentConfig.value = data.current_config;

      // Set default selections if not already set from cookies or env
      // Priority: Cookies > Env Variables > Backend Defaults
      
      // Special case: If we have a model but no provider, try to infer provider from model
      if (!selectedProvider.value && selectedModel.value) {
        // Find which provider has this model
        for (const [provider, modelList] of Object.entries(models.value)) {
          if (modelList.includes(selectedModel.value)) {
            selectedProvider.value = provider;
            break;
          }
        }
      }
      
      if (!selectedProvider.value && defaultProvider.value) {
        selectedProvider.value = defaultProvider.value;
        selectedModel.value = currentConfig.value[defaultProvider.value] || '';
        // Save to cookies
        saveToCookies();
      } else if (selectedProvider.value && !selectedModel.value) {
        // If we have a provider but no model, set default model for that provider
        if (currentConfig.value[selectedProvider.value]) {
          selectedModel.value = currentConfig.value[selectedProvider.value];
        } else if (models.value[selectedProvider.value]?.length > 0) {
          selectedModel.value = models.value[selectedProvider.value][0];
        }
        saveToCookies();
      } else if (selectedProvider.value && selectedModel.value) {
        // Validate that env/cookie values are valid against available models
        if (!providers.value.includes(selectedProvider.value)) {
          warn(`Provider "${selectedProvider.value}" from env/cookies not available, using backend default`);
          selectedProvider.value = defaultProvider.value;
          selectedModel.value = currentConfig.value[defaultProvider.value] || '';
        } else if (!models.value[selectedProvider.value]?.includes(selectedModel.value)) {
          warn(`Model "${selectedModel.value}" not available for provider "${selectedProvider.value}", using provider default`);
          selectedModel.value = currentConfig.value[selectedProvider.value] || models.value[selectedProvider.value]?.[0] || '';
        }
        // Save validated values to cookies
        saveToCookies();
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch models';
      error('Error fetching models:', err);
    } finally {
      loading.value = false;
    }
  }

  function saveToCookies() {
    if (selectedProvider.value) {
      setCookie(COOKIE_NAMES.PROVIDER, selectedProvider.value);
    }
    if (selectedModel.value) {
      setCookie(COOKIE_NAMES.MODEL, selectedModel.value);
    }
  }

  function setProvider(provider: string) {
    selectedProvider.value = provider;
    // Auto-select default model for this provider
    if (currentConfig.value[provider]) {
      selectedModel.value = currentConfig.value[provider];
    } else if (models.value[provider]?.length > 0) {
      selectedModel.value = models.value[provider][0];
    }
    saveToCookies();
  }

  function setModel(model: string) {
    selectedModel.value = model;
    saveToCookies();
  }

  function getModelsForProvider(provider: string): string[] {
    return models.value[provider] || [];
  }

  return {
    providers,
    models,
    defaultProvider,
    currentConfig,
    loading,
    error,
    selectedProvider,
    selectedModel,
    fetchModels,
    setProvider,
    setModel,
    getModelsForProvider,
  };
});










