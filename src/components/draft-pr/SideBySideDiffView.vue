<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-4">
          <h4 class="text-sm font-semibold text-gray-900">Side-by-Side Comparison</h4>
          <span class="text-xs text-gray-500">v{{ fromVersion }} → v{{ toVersion }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="toggleUnifiedView"
            class="inline-flex items-center px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
            title="Toggle view mode"
          >
            {{ showUnified ? 'Side-by-Side' : 'Unified' }}
          </button>
        </div>
      </div>
      
      <!-- Section Navigation -->
      <div v-if="!showUnified && sectionsWithChanges.length > 0" class="flex items-center space-x-2">
        <span class="text-xs text-gray-600">Jump to:</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="(section, index) in sectionsWithChanges"
            :key="`nav-${index}`"
            @click="scrollToSection(section.name)"
            :class="[
              'px-2 py-0.5 text-xs rounded transition-colors',
              currentSection === section.name
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ section.name }}
          </button>
        </div>
        <button
          v-if="showOnlyChanged"
          @click="toggleShowOnlyChanged"
          class="ml-auto px-2 py-0.5 text-xs text-indigo-600 hover:text-indigo-800"
        >
          Show All
        </button>
        <button
          v-else
          @click="toggleShowOnlyChanged"
          class="ml-auto px-2 py-0.5 text-xs text-indigo-600 hover:text-indigo-800"
        >
          Show Changed Only
        </button>
      </div>
    </div>

    <!-- Unified Diff View -->
    <div v-if="showUnified && unifiedDiff" class="p-4">
      <pre class="font-mono text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">{{ unifiedDiff }}</pre>
    </div>

    <!-- Side-by-Side View -->
    <div v-else class="grid grid-cols-2 divide-x divide-gray-200">
      <!-- Left: Old Version -->
      <div class="bg-red-50/30">
        <div class="bg-red-100 px-4 py-2 border-b border-red-200">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-red-900">Version {{ fromVersion }}</span>
            <span class="text-xs text-red-700">Removed</span>
          </div>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="!structuredDiff || !structuredDiff.sections || structuredDiff.sections.length === 0" class="text-sm text-gray-500 text-center py-8">
            No changes to display
          </div>
          <div v-else class="space-y-6">
            <div
              v-for="(section, sectionIndex) in visibleSections"
              :key="`section-${sectionIndex}`"
              :id="`section-left-${section.section_name}`"
              class="space-y-3 scroll-mt-4"
            >
              <div class="flex items-center justify-between border-b border-gray-300 pb-1">
                <h5 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {{ section.section_name }}
                </h5>
                <button
                  @click="copySection(section.section_name, 'left')"
                  class="text-xs text-gray-500 hover:text-gray-700"
                  title="Copy section"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(change, changeIndex) in (section.changes || [])"
                  :key="`change-${changeIndex}`"
                  :class="[
                    'p-2 rounded text-sm',
                    getChangeClass(change?.type || 'context', 'left')
                  ]"
                >
                  <div v-if="change && (change.type === 'removed' || change.type === 'modified')">
                    <div v-if="change.field_path" class="text-xs font-mono text-gray-600 mb-1">
                      {{ change.field_path }}
                    </div>
                    <div class="whitespace-pre-wrap">{{ change.old_value || '' }}</div>
                  </div>
                  <div v-else-if="change && change.type === 'context'" class="text-gray-400 italic">
                    {{ change.old_value || '' }}
                  </div>
                  <div v-else class="text-gray-300">
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: New Version -->
      <div class="bg-green-50/30">
        <div class="bg-green-100 px-4 py-2 border-b border-green-200">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-green-900">Version {{ toVersion }}</span>
            <span class="text-xs text-green-700">Added</span>
          </div>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="!structuredDiff || !structuredDiff.sections || structuredDiff.sections.length === 0" class="text-sm text-gray-500 text-center py-8">
            No changes to display
          </div>
          <div v-else class="space-y-6">
            <div
              v-for="(section, sectionIndex) in visibleSections"
              :key="`section-${sectionIndex}`"
              :id="`section-right-${section.section_name}`"
              class="space-y-3 scroll-mt-4"
            >
              <div class="flex items-center justify-between border-b border-gray-300 pb-1">
                <h5 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {{ section.section_name }}
                </h5>
                <button
                  @click="copySection(section.section_name, 'right')"
                  class="text-xs text-gray-500 hover:text-gray-700"
                  title="Copy section"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(change, changeIndex) in (section.changes || [])"
                  :key="`change-${changeIndex}`"
                  :class="[
                    'p-2 rounded text-sm',
                    getChangeClass(change?.type || 'context', 'right')
                  ]"
                >
                  <div v-if="change && (change.type === 'added' || change.type === 'modified')">
                    <div v-if="change.field_path" class="text-xs font-mono text-gray-600 mb-1">
                      {{ change.field_path }}
                    </div>
                    <div class="whitespace-pre-wrap">{{ change.new_value || '' }}</div>
                  </div>
                  <div v-else-if="change && change.type === 'context'" class="text-gray-400 italic">
                    {{ change.new_value || '' }}
                  </div>
                  <div v-else class="text-gray-300">
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { StructuredDiff } from '@/types/api';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import { copyToClipboard } from '@/utils/clipboard';
import { useUIStore } from '@/stores/ui';

interface Props {
  structuredDiff: StructuredDiff | null | undefined;
  unifiedDiff?: string | null;
  fromVersion: number;
  toVersion: number;
}

const props = defineProps<Props>();

const uiStore = useUIStore();
const showUnified = ref(false);
const showOnlyChanged = ref(false);
const currentSection = ref<string | null>(null);

// Computed: sections with changes
const sectionsWithChanges = computed(() => {
  if (!props.structuredDiff?.sections) return [];
  
  return props.structuredDiff.sections
    .filter(section => {
      if (!section || !Array.isArray(section.changes)) return false;
      if (!showOnlyChanged.value) return true;
      return section.changes.some(
        change => change && change.type && (change.type === 'added' || change.type === 'removed' || change.type === 'modified')
      );
    })
    .map(section => ({
      name: section.section_name || 'Unknown',
      hasChanges: Array.isArray(section.changes) && section.changes.some(
        change => change && change.type && (change.type === 'added' || change.type === 'removed' || change.type === 'modified')
      ),
    }));
});

// Computed: visible sections (filtered)
const visibleSections = computed(() => {
  if (!props.structuredDiff?.sections) return [];
  
  if (!showOnlyChanged.value) {
    return props.structuredDiff.sections;
  }
  
  return props.structuredDiff.sections.filter(section =>
    section && Array.isArray(section.changes) && section.changes.some(
      change => change && change.type && (change.type === 'added' || change.type === 'removed' || change.type === 'modified')
    )
  );
});

function toggleUnifiedView() {
  showUnified.value = !showUnified.value;
}

function toggleShowOnlyChanged() {
  showOnlyChanged.value = !showOnlyChanged.value;
}

function scrollToSection(sectionName: string) {
  currentSection.value = sectionName;
  // Scroll both left and right sections
  const leftElement = document.getElementById(`section-left-${sectionName}`);
  const rightElement = document.getElementById(`section-right-${sectionName}`);
  if (leftElement) {
    leftElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (rightElement) {
    rightElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function navigateToNextSection() {
  if (!sectionsWithChanges.value.length) return;
  
  const currentIndex = sectionsWithChanges.value.findIndex(
    s => s.name === currentSection.value
  );
  
  if (currentIndex < sectionsWithChanges.value.length - 1) {
    scrollToSection(sectionsWithChanges.value[currentIndex + 1].name);
  }
}

function navigateToPreviousSection() {
  if (!sectionsWithChanges.value.length) return;
  
  const currentIndex = sectionsWithChanges.value.findIndex(
    s => s.name === currentSection.value
  );
  
  if (currentIndex > 0) {
    scrollToSection(sectionsWithChanges.value[currentIndex - 1].name);
  } else if (currentIndex === -1 && sectionsWithChanges.value.length > 0) {
    scrollToSection(sectionsWithChanges.value[0].name);
  }
}

async function copySection(sectionName: string, side: 'left' | 'right') {
  if (!props.structuredDiff?.sections) return;
  
  const section = props.structuredDiff.sections.find(s => s && s.section_name === sectionName);
  if (!section || !Array.isArray(section.changes)) return;
  
  let text = '';
  if (side === 'left') {
    text = section.changes
      .filter(c => c && c.type && (c.type === 'removed' || c.type === 'modified' || c.type === 'context'))
      .map(c => c.old_value || '')
      .join('\n');
  } else {
    text = section.changes
      .filter(c => c && c.type && (c.type === 'added' || c.type === 'modified' || c.type === 'context'))
      .map(c => c.new_value || '')
      .join('\n');
  }
  
  const success = await copyToClipboard(text);
  if (success) {
    uiStore.showSuccess(`Copied ${side} side of ${sectionName}`);
  } else {
    uiStore.showError('Failed to copy to clipboard');
  }
}

function getChangeClass(type: string, side: 'left' | 'right'): string {
  if (type === 'added' && side === 'right') {
    return 'bg-green-100 border-l-4 border-green-500';
  }
  if (type === 'removed' && side === 'left') {
    return 'bg-red-100 border-l-4 border-red-500';
  }
  if (type === 'modified') {
    if (side === 'left') {
      return 'bg-red-100 border-l-4 border-red-500';
    } else {
      return 'bg-green-100 border-l-4 border-green-500';
    }
  }
  if (type === 'context') {
    return 'bg-gray-50 text-gray-600';
  }
  return 'bg-transparent';
}

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'ArrowDown',
    handler: () => {
      if (!showUnified.value) {
        navigateToNextSection();
      }
    },
    description: 'Next section',
  },
  {
    key: 'ArrowUp',
    handler: () => {
      if (!showUnified.value) {
        navigateToPreviousSection();
      }
    },
    description: 'Previous section',
  },
]);
</script>
