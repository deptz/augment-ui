<template>
  <div class="space-y-4">
    <!-- Template Selector -->
    <div v-if="templates.length > 0" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Load from Template
      </label>
      <div class="flex gap-2">
        <select
          v-model="selectedTemplateId"
          @change="handleTemplateSelect"
          class="flex-1 block border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select a template --</option>
          <option
            v-for="template in templates"
            :key="template.template_id"
            :value="template.template_id"
          >
            {{ template.name }}
            <span v-if="template.description" class="text-gray-500">
              - {{ template.description }}
            </span>
          </option>
        </select>
        <button
          v-if="selectedTemplateId"
          @click="loadTemplate"
          type="button"
          class="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Load
        </button>
      </div>
    </div>

    <!-- Save as Template -->
    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">
          Save as Template
        </label>
        <button
          v-if="!showSaveForm"
          @click="showSaveForm = true"
          type="button"
          class="text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Save Template
        </button>
      </div>

      <div v-if="showSaveForm" class="space-y-3 mt-3">
        <div>
          <input
            v-model="templateName"
            type="text"
            placeholder="Template name (required)"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :class="{ 'border-red-300': saveError && !templateName }"
          />
        </div>
        <div>
          <textarea
            v-model="templateDescription"
            rows="2"
            placeholder="Description (optional)"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="saveTemplate"
            type="button"
            :disabled="!templateName || saving"
            class="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save Template</span>
          </button>
          <button
            @click="cancelSave"
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
        <p v-if="saveSuccess" class="text-sm text-green-600">{{ saveSuccess }}</p>
      </div>
    </div>

    <!-- Template Management (if admin or owner) -->
    <div v-if="templates.length > 0" class="border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-700 mb-2">Manage Templates</h3>
      <div class="space-y-2">
        <div
          v-for="template in templates"
          :key="template.template_id"
          class="flex items-center justify-between p-2 bg-gray-50 rounded"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ template.name }}</p>
            <p v-if="template.description" class="text-xs text-gray-500">{{ template.description }}</p>
            <p v-if="template.created_at" class="text-xs text-gray-400">
              Created {{ formatDate(template.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="loadTemplateById(template.template_id)"
              type="button"
              class="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Load
            </button>
            <button
              @click="deleteTemplateById(template.template_id)"
              type="button"
              class="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listTemplates, createTemplate, getTemplate, deleteTemplate } from '@/api/endpoints';
import type { TemplateSummary, TemplateResponse, RepoInput } from '@/types/api';
import { useUIStore } from '@/stores/ui';
import { formatDate } from '@/utils/dateFormat';

interface Props {
  currentRepos: RepoInput[];
  currentScope?: {
    files?: string[];
    include_paths?: string[];
    exclude_paths?: string[];
  } | null;
  currentAdditionalContext?: string;
}

interface Emits {
  (e: 'template-loaded', template: TemplateResponse): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const uiStore = useUIStore();
const templates = ref<TemplateSummary[]>([]);
const selectedTemplateId = ref<string>('');
const showSaveForm = ref(false);
const templateName = ref('');
const templateDescription = ref('');
const saving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref<string | null>(null);
const loading = ref(false);

onMounted(async () => {
  await loadTemplates();
});

async function loadTemplates() {
  try {
    loading.value = true;
    templates.value = await listTemplates();
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to load templates');
  } finally {
    loading.value = false;
  }
}

function handleTemplateSelect() {
  if (selectedTemplateId.value) {
    loadTemplate();
  }
}

async function loadTemplate() {
  if (!selectedTemplateId.value) return;

  try {
    loading.value = true;
    const template = await getTemplate(selectedTemplateId.value);
    emit('template-loaded', template);
    uiStore.showSuccess(`Template "${template.name}" loaded`);
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to load template');
  } finally {
    loading.value = false;
  }
}

async function loadTemplateById(templateId: string) {
  selectedTemplateId.value = templateId;
  await loadTemplate();
}

async function saveTemplate() {
  if (!templateName.value.trim()) {
    saveError.value = 'Template name is required';
    return;
  }

  if (props.currentRepos.length === 0) {
    saveError.value = 'At least one repository is required';
    return;
  }

  saving.value = true;
  saveError.value = null;
  saveSuccess.value = null;

  try {
    const template = await createTemplate({
      name: templateName.value.trim(),
      description: templateDescription.value.trim() || null,
      repos: props.currentRepos,
      scope: props.currentScope || null,
      additional_context: props.currentAdditionalContext || null,
    });

    uiStore.showSuccess(`Template "${template.name}" saved successfully`);
    saveSuccess.value = 'Template saved successfully';
    showSaveForm.value = false;
    templateName.value = '';
    templateDescription.value = '';
    
    // Reload templates
    await loadTemplates();
  } catch (err: any) {
    saveError.value = err.response?.data?.detail || err.message || 'Failed to save template';
  } finally {
    saving.value = false;
  }
}

function cancelSave() {
  showSaveForm.value = false;
  templateName.value = '';
  templateDescription.value = '';
  saveError.value = null;
  saveSuccess.value = null;
}

async function deleteTemplateById(templateId: string) {
  const template = templates.value.find(t => t.template_id === templateId);
  if (!template) return;

  if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) {
    return;
  }

  try {
    await deleteTemplate(templateId);
    uiStore.showSuccess(`Template "${template.name}" deleted`);
    await loadTemplates();
    if (selectedTemplateId.value === templateId) {
      selectedTemplateId.value = '';
    }
  } catch (err: any) {
    uiStore.showError(err.response?.data?.detail || err.message || 'Failed to delete template');
  }
}
</script>
