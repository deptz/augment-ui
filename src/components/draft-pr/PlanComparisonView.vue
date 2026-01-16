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
        <p class="text-sm text-gray-600">{{ comparison.summary }}</p>
      </div>

      <!-- Changes Summary -->
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-sm font-medium text-green-800">Added</div>
          <div class="text-2xl font-bold text-green-900 mt-1">
            {{ comparison.changes.added.length }}
          </div>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="text-sm font-medium text-yellow-800">Modified</div>
          <div class="text-2xl font-bold text-yellow-900 mt-1">
            {{ comparison.changes.modified.length }}
          </div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-sm font-medium text-red-800">Removed</div>
          <div class="text-2xl font-bold text-red-900 mt-1">
            {{ comparison.changes.removed.length }}
          </div>
        </div>
      </div>

      <!-- Changed Sections -->
      <div class="mb-6" v-if="comparison.changed_sections.length > 0">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Changed Sections</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(section, index) in comparison.changes.added"
            :key="`added-${index}`"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
          >
            + {{ section }}
          </span>
          <span
            v-for="(section, index) in comparison.changes.modified"
            :key="`modified-${index}`"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
          >
            ~ {{ section }}
          </span>
          <span
            v-for="(section, index) in comparison.changes.removed"
            :key="`removed-${index}`"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
          >
            - {{ section }}
          </span>
        </div>
      </div>

      <!-- Detailed Changes -->
      <div class="space-y-4">
        <!-- Added Items -->
        <div v-if="comparison.changes.added.length > 0" class="border-l-4 border-green-500 pl-4">
          <h4 class="text-sm font-semibold text-green-900 mb-2">Added</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.added" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Modified Items -->
        <div v-if="comparison.changes.modified.length > 0" class="border-l-4 border-yellow-500 pl-4">
          <h4 class="text-sm font-semibold text-yellow-900 mb-2">Modified</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.modified" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Removed Items -->
        <div v-if="comparison.changes.removed.length > 0" class="border-l-4 border-red-500 pl-4">
          <h4 class="text-sm font-semibold text-red-900 mb-2">Removed</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li v-for="(item, index) in comparison.changes.removed" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PlanComparison } from '@/types/api';
import { comparePlans } from '@/api/endpoints';

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
  try {
    loading.value = true;
    error.value = null;
    comparison.value = await comparePlans(props.jobId, props.fromVersion, props.toVersion);
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load comparison';
  } finally {
    loading.value = false;
  }
});
</script>
