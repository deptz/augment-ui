<template>
  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div v-if="files.length === 0" class="text-gray-500 text-sm">
      No files specified
    </div>
    <div v-else class="space-y-1">
      <FileTreeNode
        v-for="(node, index) in treeNodes"
        :key="index"
        :node="node"
        :level="0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FileTreeNode from './FileTreeNode.vue';

interface FileChange {
  path: string;
  change: string;
}

interface Props {
  files: FileChange[];
}

const props = defineProps<Props>();

interface TreeNode {
  name: string;
  path: string;
  change?: string;
  children: TreeNode[];
  isFile: boolean;
}

// Build tree structure from file paths
const treeNodes = computed<TreeNode[]>(() => {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  // Handle empty files array
  if (!props.files || props.files.length === 0) {
    return root;
  }

  for (const file of props.files) {
    // Skip invalid file entries
    if (!file || !file.path || typeof file.path !== 'string') {
      continue;
    }

    // Handle root-level files (no directory structure)
    const trimmedPath = file.path.trim();
    if (trimmedPath.length === 0) {
      continue;
    }

    const parts = trimmedPath.split('/').filter(p => p.length > 0);
    
    // Handle edge case: file at root with no path separator
    if (parts.length === 0) {
      continue;
    }

    let currentPath = '';
    let parentNode: TreeNode | null = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!nodeMap.has(currentPath)) {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          children: [],
          isFile,
        };

        if (isFile) {
          node.change = file.change || 'modified'; // Default change type
        }

        nodeMap.set(currentPath, node);

        if (parentNode) {
          parentNode.children.push(node);
        } else {
          root.push(node);
        }
      } else {
        // If node exists and it's a file, update the change type (handles duplicate paths)
        const existingNode = nodeMap.get(currentPath)!;
        if (isFile && existingNode.isFile && file.change) {
          existingNode.change = file.change;
        }
      }

      parentNode = nodeMap.get(currentPath)!;
    }
  }

  // Sort: folders first, then files, both alphabetically
  function sortNodes(nodes: TreeNode[]): void {
    nodes.sort((a, b) => {
      if (a.isFile !== b.isFile) {
        return a.isFile ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(root);
  return root;
});
</script>
