<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-gray-500">Loading comparison...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="comparison">
      <!-- Header -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Plan Comparison: v{{ comparison.from_version }} → v{{ comparison.to_version }}
        </h3>
        <p class="text-sm text-gray-600">{{ comparison.summary || 'No summary available' }}</p>
      </div>

      <!-- Changes Summary -->
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-sm font-medium text-green-800">Added</div>
          <div class="text-2xl font-bold text-green-900 mt-1">
            {{ comparison.changes?.added?.length || 0 }}
          </div>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="text-sm font-medium text-yellow-800">Modified</div>
          <div class="text-2xl font-bold text-yellow-900 mt-1">
            {{ comparison.changes?.modified?.length || 0 }}
          </div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-sm font-medium text-red-800">Removed</div>
          <div class="text-2xl font-bold text-red-900 mt-1">
            {{ comparison.changes?.removed?.length || 0 }}
          </div>
        </div>
      </div>

      <!-- Changed Sections with Jump Links -->
      <div class="mb-6" v-if="comparison.changed_sections && comparison.changed_sections.length > 0">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-900">Changed Sections</h4>
          <div class="flex items-center space-x-2">
            <button
              @click="exportComparison('markdown')"
              class="inline-flex items-center px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
              title="Export as Markdown"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export MD
            </button>
            <button
              @click="exportComparison('json')"
              class="inline-flex items-center px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
              title="Export as JSON"
            >
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(section, index) in comparison.changed_sections"
            :key="`section-${index}`"
            @click="scrollToSection(section)"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
          >
            {{ section }}
          </button>
        </div>
      </div>

      <!-- Side-by-Side Diff View (when structured format is available) -->
      <div v-if="comparison.structured_diff" class="mb-6">
        <SideBySideDiffView
          :structured-diff="comparison.structured_diff"
          :unified-diff="comparison.unified_diff"
          :from-version="comparison.from_version"
          :to-version="comparison.to_version"
        />
      </div>

      <!-- Detailed Changes (fallback when structured diff is not available) -->
      <div v-else class="space-y-4">
        <!-- Added Items -->
        <div v-if="comparison.changes?.added && comparison.changes.added.length > 0" class="border-l-4 border-green-500 pl-4">
          <h4 class="text-sm font-semibold text-green-900 mb-2">Added</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.added" :key="index">
              {{ item || 'N/A' }}
            </li>
          </ul>
        </div>

        <!-- Modified Items -->
        <div v-if="comparison.changes?.modified && comparison.changes.modified.length > 0" class="border-l-4 border-yellow-500 pl-4">
          <h4 class="text-sm font-semibold text-yellow-900 mb-2">Modified</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.modified" :key="index">
              {{ item || 'N/A' }}
            </li>
          </ul>
        </div>

        <!-- Removed Items -->
        <div v-if="comparison.changes?.removed && comparison.changes.removed.length > 0" class="border-l-4 border-red-500 pl-4">
          <h4 class="text-sm font-semibold text-red-900 mb-2">Removed</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.removed" :key="index">
              {{ item || 'N/A' }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <div class="flex items-center space-x-2">
          <button
            @click="exportComparison('markdown')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="Export comparison as Markdown"
          >
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
        <div class="flex space-x-3">
          <button
            @click="$emit('view-old')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View v{{ comparison.from_version }}
          </button>
          <button
            @click="$emit('view-new')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View v{{ comparison.to_version }}
          </button>
          <button
            @click="$emit('approve-new')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Approve v{{ comparison.to_version }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PlanComparison } from '@/types/api';
import { comparePlans } from '@/api/endpoints';
import SideBySideDiffView from './SideBySideDiffView.vue';

interface Props {
  jobId: string;
  fromVersion: number;
  toVersion: number;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

const emit = defineEmits<{
  viewOld: [];
  viewNew: [];
  approveNew: [];
}>();

const comparison = ref<PlanComparison | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  // Validate inputs
  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    loading.value = false;
    return;
  }

  if (typeof props.fromVersion !== 'number' || typeof props.toVersion !== 'number' || 
      props.fromVersion < 1 || props.toVersion < 1 || props.fromVersion === props.toVersion) {
    error.value = 'Invalid version numbers for comparison';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    // Use structured format for detailed diffs
    comparison.value = await comparePlans(props.jobId, props.fromVersion, props.toVersion, 'structured');
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load comparison';
  } finally {
    loading.value = false;
  }
});

function scrollToSection(sectionName: string) {
  // Emit event to parent or scroll within the component
  // For now, we'll scroll to the section in the SideBySideDiffView
  const element = document.querySelector(`[id*="${sectionName}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function exportComparison(format: 'markdown' | 'json') {
  if (!comparison.value) return;
  
  let content = '';
  let filename = '';
  let mimeType = '';
  
  if (format === 'markdown') {
    content = generateMarkdownExport();
    filename = `plan-comparison-v${comparison.value.from_version}-to-v${comparison.value.to_version}.md`;
    mimeType = 'text/markdown';
  } else {
    content = JSON.stringify(comparison.value, null, 2);
    filename = `plan-comparison-v${comparison.value.from_version}-to-v${comparison.value.to_version}.json`;
    mimeType = 'application/json';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateMarkdownExport(): string {
  if (!comparison.value) return '';
  
  const lines: string[] = [];
  lines.push(`# Plan Comparison: v${comparison.value.from_version} → v${comparison.value.to_version}`);
  lines.push('');
  lines.push(`**Summary:** ${comparison.value.summary || 'No summary available'}`);
  lines.push('');
  
  // Statistics
  lines.push('## Statistics');
  lines.push('');
  lines.push(`- **Added:** ${comparison.value.changes?.added?.length || 0}`);
  lines.push(`- **Modified:** ${comparison.value.changes?.modified?.length || 0}`);
  lines.push(`- **Removed:** ${comparison.value.changes?.removed?.length || 0}`);
  lines.push('');
  
  // Changed sections
  if (comparison.value.changed_sections && comparison.value.changed_sections.length > 0) {
    lines.push('## Changed Sections');
    lines.push('');
    comparison.value.changed_sections.forEach(section => {
      lines.push(`- ${section}`);
    });
    lines.push('');
  }
  
  // Detailed changes
  if (comparison.value.changes) {
    if (comparison.value.changes.added && comparison.value.changes.added.length > 0) {
      lines.push('### Added');
      lines.push('');
      comparison.value.changes.added.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }
    
    if (comparison.value.changes.modified && comparison.value.changes.modified.length > 0) {
      lines.push('### Modified');
      lines.push('');
      comparison.value.changes.modified.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }
    
    if (comparison.value.changes.removed && comparison.value.changes.removed.length > 0) {
      lines.push('### Removed');
      lines.push('');
      comparison.value.changes.removed.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }
  }
  
  // Unified diff if available
  if (comparison.value.unified_diff) {
    lines.push('## Unified Diff');
    lines.push('');
    lines.push('```diff');
    lines.push(comparison.value.unified_diff);
    lines.push('```');
  }
  
  return lines.join('\n');
}
</script>
