<template>
  <div>
    <div
      :style="{ paddingLeft: `${level * 1}rem` }"
      class="flex items-center space-x-2 py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
      @click="toggleExpanded"
    >
      <!-- Expand/Collapse Icon for folders -->
      <span v-if="!node.isFile" class="w-4 h-4 flex items-center justify-center">
        <svg
          v-if="node.children.length > 0"
          :class="['w-4 h-4 text-gray-500 transition-transform', expanded ? 'transform rotate-90' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span v-else class="w-4 h-4"></span>
      </span>

      <!-- File/Folder Icon -->
      <span class="flex-shrink-0">
        <svg
          v-if="node.isFile"
          class="w-4 h-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </span>

      <!-- Change Type Badge -->
      <span
        v-if="node.change"
        :class="[
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          getChangeTypeClass(node.change)
        ]"
      >
        {{ getChangeTypeLabel(node.change) }}
      </span>

      <!-- File/Folder Name -->
      <span class="font-mono text-sm text-gray-700 flex-1 truncate" :title="node.path">
        {{ node.name }}
      </span>
    </div>

    <!-- Children (recursive) -->
    <div v-if="!node.isFile && expanded && node.children.length > 0" class="ml-4">
      <FileTreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface TreeNode {
  name: string;
  path: string;
  change?: string;
  children: TreeNode[];
  isFile: boolean;
}

interface Props {
  node: TreeNode;
  level: number;
}

const props = defineProps<Props>();

const expanded = ref(props.level < 2); // Auto-expand first 2 levels

function toggleExpanded() {
  if (!props.node.isFile && props.node.children.length > 0) {
    expanded.value = !expanded.value;
  }
}

function getChangeTypeClass(change: string): string {
  if (!change || typeof change !== 'string') return 'bg-gray-100 text-gray-800';
  const changeLower = change.toLowerCase();
  if (changeLower.includes('add') || changeLower.includes('new') || changeLower.includes('create')) return 'bg-green-100 text-green-800';
  if (changeLower.includes('modify') || changeLower.includes('update') || changeLower.includes('edit') || changeLower.includes('change')) return 'bg-blue-100 text-blue-800';
  if (changeLower.includes('delete') || changeLower.includes('remove') || changeLower.includes('drop')) return 'bg-red-100 text-red-800';
  if (changeLower.includes('rename') || changeLower.includes('move')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

function getChangeTypeLabel(change: string): string {
  if (!change || typeof change !== 'string') return '?';
  const changeLower = change.toLowerCase();
  if (changeLower.includes('add') || changeLower.includes('new') || changeLower.includes('create')) return '✨';
  if (changeLower.includes('modify') || changeLower.includes('update') || changeLower.includes('edit') || changeLower.includes('change')) return '📝';
  if (changeLower.includes('delete') || changeLower.includes('remove') || changeLower.includes('drop')) return '🗑️';
  if (changeLower.includes('rename') || changeLower.includes('move')) return '📦';
  return change;
}
</script>
