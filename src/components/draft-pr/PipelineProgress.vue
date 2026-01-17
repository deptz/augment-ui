<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Pipeline Progress</h3>
      <span v-if="currentStage" class="text-sm text-gray-500">
        Stage: {{ getStageLabel(currentStage) }}
      </span>
    </div>
    
    <div class="flex items-center justify-between relative">
      <!-- Pipeline stages -->
      <div
        v-for="(stage, index) in stages"
        :key="stage"
        class="flex items-center flex-1"
      >
        <div class="flex flex-col items-center flex-1">
          <!-- Stage circle -->
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
              getStageClass(stage)
            ]"
          >
            <svg
              v-if="getStageState(stage) === 'completed'"
              class="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else-if="getStageState(stage) === 'current'"
              class="w-6 h-6 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <svg
              v-else-if="getStageState(stage) === 'failed'"
              class="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span v-else class="text-gray-400">{{ index + 1 }}</span>
          </div>
          
          <!-- Stage label -->
          <div class="mt-2 text-xs text-center max-w-[80px]">
            <div :class="['font-medium', getStageLabelClass(stage)]">
              {{ getStageLabel(stage) }}
            </div>
            <div v-if="getStageTimestamp(stage)" class="text-gray-400 mt-1">
              {{ formatTimestamp(getStageTimestamp(stage)) }}
            </div>
          </div>
        </div>
        
        <!-- Connector line -->
        <div
          v-if="index < stages.length - 1"
          :class="[
            'h-1 flex-1 mx-2 transition-all',
            getConnectorClass(stage, stages[index + 1])
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PipelineStage } from '@/types/api';
import { formatDate } from '@/utils/dateFormat';

interface Props {
  currentStage?: PipelineStage | null;
  stageTimestamps?: Record<PipelineStage, string | null>;
  failedStage?: PipelineStage | null;
}

const props = withDefaults(defineProps<Props>(), {
  currentStage: null,
  stageTimestamps: () => ({}),
  failedStage: null,
});

const stages: PipelineStage[] = [
  'PLANNING',
  'WAITING_FOR_APPROVAL',
  'APPLYING',
  'VERIFYING',
  'PACKAGING',
  'DRAFTING',
];

function getStageState(stage: PipelineStage): 'completed' | 'current' | 'pending' | 'failed' {
  if (props.failedStage === stage) return 'failed';
  if (!props.currentStage) return 'pending';
  
  const stageIndex = stages.indexOf(stage);
  const currentIndex = stages.indexOf(props.currentStage);
  
  // Handle stages not in the main pipeline (e.g., REVISING, CREATED)
  if (stageIndex === -1 || currentIndex === -1) {
    // For stages not in pipeline, check if they match current stage
    if (stage === props.currentStage) {
      return props.failedStage === stage ? 'failed' : 'current';
    }
    return 'pending';
  }
  
  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'current';
  return 'pending';
}

function getStageClass(stage: PipelineStage): string {
  const state = getStageState(stage);
  
  switch (state) {
    case 'completed':
      return 'bg-green-500 border-green-600 text-white';
    case 'current':
      return 'bg-blue-500 border-blue-600 text-white';
    case 'failed':
      return 'bg-red-500 border-red-600 text-white';
    default:
      return 'bg-gray-200 border-gray-300 text-gray-400';
  }
}

function getStageLabelClass(stage: PipelineStage): string {
  const state = getStageState(stage);
  
  switch (state) {
    case 'completed':
      return 'text-green-600';
    case 'current':
      return 'text-blue-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-400';
  }
}

function getConnectorClass(currentStage: PipelineStage, nextStage: PipelineStage): string {
  const currentState = getStageState(currentStage);
  const nextState = getStageState(nextStage);
  
  if (currentState === 'completed' || (currentState === 'current' && nextState !== 'failed')) {
    return 'bg-green-500';
  }
  if (currentState === 'failed' || nextState === 'failed') {
    return 'bg-red-500';
  }
  return 'bg-gray-200';
}

function getStageLabel(stage: PipelineStage): string {
  const labels: Record<PipelineStage, string> = {
    CREATED: 'Created',
    PLANNING: 'Plan',
    WAITING_FOR_APPROVAL: 'Approval',
    REVISING: 'Revising',
    APPLYING: 'Apply',
    VERIFYING: 'Verify',
    PACKAGING: 'Package',
    DRAFTING: 'Draft PR',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[stage] || stage;
}

function getStageTimestamp(stage: PipelineStage): string | null {
  return props.stageTimestamps?.[stage] || null;
}

function formatTimestamp(timestamp: string): string {
  try {
    return formatDate(timestamp);
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
</script>
