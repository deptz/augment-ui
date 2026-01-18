<template>
  <div :class="['animate-pulse', containerClass]">
    <!-- Text skeleton -->
    <div v-if="type === 'text'" class="space-y-2">
      <div
        v-for="i in lines"
        :key="i"
        :class="[
          'bg-gray-200 rounded',
          i === lines && lastLineWidth ? lastLineWidth : 'w-full',
          heightClass
        ]"
      ></div>
    </div>

    <!-- Card skeleton -->
    <div v-else-if="type === 'card'" class="space-y-4">
      <div class="bg-gray-200 rounded-lg h-32"></div>
      <div class="space-y-2">
        <div class="bg-gray-200 rounded h-4 w-3/4"></div>
        <div class="bg-gray-200 rounded h-4 w-full"></div>
        <div class="bg-gray-200 rounded h-4 w-5/6"></div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div
        v-for="i in items"
        :key="i"
        class="flex items-center space-x-3"
      >
        <div class="bg-gray-200 rounded-full h-10 w-10"></div>
        <div class="flex-1 space-y-2">
          <div class="bg-gray-200 rounded h-4 w-3/4"></div>
          <div class="bg-gray-200 rounded h-3 w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div v-else-if="type === 'table'" class="space-y-3">
      <div
        v-for="i in rows"
        :key="i"
        class="flex space-x-4"
      >
        <div
          v-for="j in columns"
          :key="j"
          :class="[
            'bg-gray-200 rounded h-4',
            j === 1 ? 'w-1/4' : j === 2 ? 'w-1/3' : 'w-1/4'
          ]"
        ></div>
      </div>
    </div>

    <!-- Custom skeleton -->
    <div v-else :class="['bg-gray-200 rounded', heightClass, widthClass]"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'text' | 'card' | 'list' | 'table' | 'custom';
  lines?: number;
  items?: number;
  rows?: number;
  columns?: number;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  width?: 'sm' | 'md' | 'lg' | 'full';
  lastLineWidth?: string;
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom',
  lines: 3,
  items: 5,
  rows: 5,
  columns: 3,
  height: 'md',
  width: 'full',
  lastLineWidth: 'w-3/4',
  containerClass: '',
});

const heightClass = computed(() => {
  switch (props.height) {
    case 'sm': return 'h-3';
    case 'md': return 'h-4';
    case 'lg': return 'h-6';
    case 'xl': return 'h-8';
    default: return 'h-4';
  }
});

const widthClass = computed(() => {
  switch (props.width) {
    case 'sm': return 'w-1/4';
    case 'md': return 'w-1/2';
    case 'lg': return 'w-3/4';
    case 'full': return 'w-full';
    default: return 'w-full';
  }
});
</script>
