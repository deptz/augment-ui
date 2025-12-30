import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * Composable to manage job IDs in URL query parameters
 * 
 * @param paramName - The query parameter name (e.g., 'jobId', 'createAllJobId')
 * @param initialValue - Initial value for the job ID ref (optional)
 * @returns Object with jobId ref and methods to manage URL
 */
export function useJobUrl(paramName: string, initialValue: string | null = null) {
  const route = useRoute();
  const router = useRouter();
  const jobId = ref<string | null>(initialValue);

  // Read job ID from URL on mount
  onMounted(() => {
    const urlJobId = route.query[paramName];
    if (typeof urlJobId === 'string' && urlJobId.trim()) {
      jobId.value = urlJobId.trim();
    }
  });

  /**
   * Remove job ID from URL
   */
  const removeFromUrl = () => {
    const currentQuery = { ...route.query };
    delete currentQuery[paramName];
    router.replace({
      query: currentQuery,
    });
    jobId.value = null;
  };

  /**
   * Set job ID and update URL
   */
  const setJobId = (id: string | null) => {
    jobId.value = id;
    const currentQuery = { ...route.query };
    
    if (id) {
      // Update or add job ID to URL
      currentQuery[paramName] = id;
    } else {
      // Remove job ID from URL
      delete currentQuery[paramName];
    }

    // Update URL without triggering navigation
    router.replace({
      query: currentQuery,
    });
  };

  /**
   * Get job ID from URL without setting the ref
   */
  const getJobIdFromUrl = (): string | null => {
    const urlJobId = route.query[paramName];
    if (typeof urlJobId === 'string' && urlJobId.trim()) {
      return urlJobId.trim();
    }
    return null;
  };

  return {
    jobId,
    setJobId,
    removeFromUrl,
    getJobIdFromUrl,
  };
}

