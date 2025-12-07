<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <!-- Provider Selector -->
      <div>
        <label for="provider" class="block text-sm font-medium text-gray-700">
          LLM Provider
        </label>
        <select
          id="provider"
          v-model="selectedProvider"
          @change="onProviderChange"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="provider in modelsStore.providers" :key="provider" :value="provider">
            {{ capitalize(provider) }}
          </option>
        </select>
      </div>

      <!-- Model Selector -->
      <div>
        <label for="model" class="block text-sm font-medium text-gray-700">
          Model
        </label>
        <select
          id="model"
          v-model="selectedModel"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </div>
    </div>

    <!-- Default indicator -->
    <div v-if="isUsingDefault" class="text-xs text-gray-500">
      Using default: {{ modelsStore.defaultProvider }} / {{ modelsStore.currentConfig[modelsStore.defaultProvider] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();

const selectedProvider = ref(modelsStore.selectedProvider);
const selectedModel = ref(modelsStore.selectedModel);

const availableModels = computed(() => {
  return modelsStore.getModelsForProvider(selectedProvider.value);
});

const isUsingDefault = computed(() => {
  return (
    selectedProvider.value === modelsStore.defaultProvider &&
    selectedModel.value === modelsStore.currentConfig[modelsStore.defaultProvider]
  );
});

function onProviderChange() {
  modelsStore.setProvider(selectedProvider.value);
  selectedModel.value = modelsStore.selectedModel;
}

// Watch for changes from store
watch(() => modelsStore.selectedProvider, (newVal) => {
  selectedProvider.value = newVal;
});

watch(() => modelsStore.selectedModel, (newVal) => {
  selectedModel.value = newVal;
});

// Update store when local values change
watch(selectedModel, (newVal) => {
  if (newVal) {
    modelsStore.setModel(newVal);
  }
});

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

onMounted(() => {
  if (!modelsStore.providers.length) {
    modelsStore.fetchModels();
  }
});
</script>










