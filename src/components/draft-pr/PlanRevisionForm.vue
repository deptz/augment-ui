<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Revise Plan</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Feedback -->
      <div>
        <label for="feedback" class="block text-sm font-medium text-gray-700 mb-1">
          Feedback <span class="text-red-500">*</span>
        </label>
        <textarea
          id="feedback"
          v-model="formData.feedback"
          rows="6"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Provide feedback on the plan..."
        />
      </div>

      <!-- Specific Concerns -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Specific Concerns (optional)
        </label>
        <div class="space-y-2">
          <div
            v-for="(concern, index) in formData.specific_concerns"
            :key="index"
            class="flex items-center space-x-2"
          >
            <input
              v-model="formData.specific_concerns[index]"
              type="text"
              class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter a specific concern..."
            />
            <button
              type="button"
              @click="removeConcern(index)"
              class="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            @click="addConcern"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            + Add Concern
          </button>
        </div>
      </div>

      <!-- Requested Changes -->
      <div>
        <label for="requested_changes" class="block text-sm font-medium text-gray-700 mb-1">
          Requested Changes (optional)
        </label>
        <textarea
          id="requested_changes"
          v-model="formData.requested_changes"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe the changes you'd like to see..."
        />
      </div>

      <!-- Feedback Type -->
      <div>
        <label for="feedback_type" class="block text-sm font-medium text-gray-700 mb-1">
          Feedback Type <span class="text-red-500">*</span>
        </label>
        <select
          id="feedback_type"
          v-model="formData.feedback_type"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="general">General</option>
          <option value="scope">Scope</option>
          <option value="tests">Tests</option>
          <option value="safety">Safety</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !formData.feedback.trim()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Submit Revision</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { RevisePlanRequest } from '@/types/api';

const emit = defineEmits<{
  submit: [data: RevisePlanRequest];
  cancel: [];
}>();

const isSubmitting = ref(false);

const formData = reactive<RevisePlanRequest>({
  feedback: '',
  specific_concerns: [],
  requested_changes: '',
  feedback_type: 'general',
});

// Ensure specific_concerns is always an array
if (!formData.specific_concerns) {
  formData.specific_concerns = [];
}

function addConcern() {
  if (!formData.specific_concerns) {
    formData.specific_concerns = [];
  }
  formData.specific_concerns.push('');
}

function removeConcern(index: number) {
  if (formData.specific_concerns && index >= 0 && index < formData.specific_concerns.length) {
    formData.specific_concerns.splice(index, 1);
  }
}

async function handleSubmit() {
  if (!formData.feedback || !formData.feedback.trim()) {
    return;
  }

  // Prevent double submission
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    // Filter out empty concerns
    const concerns = formData.specific_concerns?.filter(c => c && c.trim().length > 0) || [];
    
    emit('submit', {
      feedback: formData.feedback.trim(),
      specific_concerns: concerns.length > 0 ? concerns : undefined,
      requested_changes: formData.requested_changes?.trim() || undefined,
      feedback_type: formData.feedback_type || 'general',
    });
    
    // Reset form after successful submission (parent will handle API call)
    // The form will be closed when stage changes to REVISING
  } catch (err) {
    console.error('Error submitting revision:', err);
    isSubmitting.value = false; // Reset on error so user can retry
    // Error will be handled by parent component
  }
  // Note: isSubmitting will be reset when form is closed or stage changes
}
</script>
