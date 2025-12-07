<template>
  <div class="flex justify-center items-center" :class="containerClass">
    <div class="animate-spin rounded-full border-t-2 border-b-2" :class="spinnerClass"></div>
    <span v-if="message" class="ml-3 text-sm" :class="textClass">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  color?: 'primary' | 'white';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  message: '',
  color: 'primary',
});

const spinnerClass = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const colorClasses = {
    primary: 'border-indigo-600',
    white: 'border-white',
  };
  
  return `${sizeClasses[props.size]} ${colorClasses[props.color]}`;
});

const containerClass = computed(() => {
  return props.message ? 'space-x-3' : '';
});

const textClass = computed(() => {
  return props.color === 'white' ? 'text-white' : 'text-gray-600';
});
</script>










