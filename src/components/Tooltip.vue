<template>
  <div class="relative inline-block group">
    <slot />
    <div
      v-if="show"
      :class="[
        'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg',
        positionClass,
        'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
      ]"
      :style="{ minWidth: minWidth }"
    >
      {{ text }}
      <div
        :class="[
          'absolute w-2 h-2 bg-gray-900 transform rotate-45',
          arrowClass
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  show?: boolean;
  minWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  show: true,
  minWidth: '120px',
});

const positionClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
  }
});

const arrowClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2';
    case 'bottom':
      return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    case 'left':
      return 'right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2';
    case 'right':
      return 'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2';
    default:
      return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2';
  }
});
</script>
