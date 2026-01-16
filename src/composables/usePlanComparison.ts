import { ref } from 'vue';
import { comparePlans } from '../api/endpoints';
import type { PlanComparison } from '../types/api';

export function usePlanComparison() {
  const comparison = ref<PlanComparison | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchComparison(
    jobId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<PlanComparison | null> {
    loading.value = true;
    error.value = null;
    comparison.value = null;

    try {
      const result = await comparePlans(jobId, fromVersion, toVersion);
      comparison.value = result;
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.detail || err.message || 'Failed to load comparison';
      return null;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    comparison.value = null;
    error.value = null;
    loading.value = false;
  }

  return {
    comparison,
    loading,
    error,
    fetchComparison,
    reset,
  };
}
