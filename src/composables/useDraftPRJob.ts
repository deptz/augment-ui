import { ref, computed, watch, type Ref } from 'vue';
import { useJobPolling } from './useJobPolling';
import { getDraftPRJob, approvePlan, revisePlan } from '../api/endpoints';
import type { DraftPRJobStatus, PipelineStage, PlanVersion, RevisePlanRequest } from '../types/api';
import { useUIStore } from '../stores/ui';

export function useDraftPRJob(jobId: Ref<string | null>) {
  const uiStore = useUIStore();
  const draftPRJob = ref<DraftPRJobStatus | null>(null);
  const isApproving = ref(false);
  const isRevising = ref(false);

  // Use the base job polling - we'll handle dynamic intervals by restarting when stage changes
  // Default to 3 seconds, which works well for most stages
  const {
    job: baseJob,
    isLoading,
    error,
    isPolling,
    isCancelling,
    startPolling: baseStartPolling,
    stopPolling,
    cancelJob,
    refresh,
  } = useJobPolling(jobId, {
    interval: 3000, // Default 3 seconds - will be adjusted dynamically
    onComplete: (job) => {
      draftPRJob.value = job as DraftPRJobStatus;
    },
    onStatusChange: async () => {
      // Refresh draft PR specific data when status changes
      if (jobId.value) {
        await refreshDraftPRJob();
        // Check for auto-approval after status change
        await checkAndAutoApprove();
      }
    },
  });

  // Computed properties for draft PR specific fields
  const currentStage = computed<PipelineStage | null>(() => draftPRJob.value?.stage || null);
  const planVersions = computed<PlanVersion[]>(() => draftPRJob.value?.plan_versions || []);
  const latestPlan = computed<PlanVersion | null>(() => {
    const versions = planVersions.value;
    return versions.length > 0 ? versions[versions.length - 1] : null;
  });
  const approvedPlanHash = computed<string | null>(() => draftPRJob.value?.approved_plan_hash || null);
  const isYoloMode = computed(() => {
    return draftPRJob.value?.mode === 'yolo';
  });

  // Get polling interval based on stage
  function getPollingInterval(stage?: PipelineStage | null): number {
    if (!stage) return 3000;

    // Active stages need more frequent polling
    const activeStages: PipelineStage[] = ['PLANNING', 'APPLYING', 'VERIFYING'];
    if (activeStages.includes(stage)) {
      return 2000; // 2 seconds
    }

    // Waiting stages can poll less frequently
    const waitingStages: PipelineStage[] = ['WAITING_FOR_APPROVAL', 'REVISING'];
    if (waitingStages.includes(stage)) {
      return 5000; // 5 seconds
    }

    // Other stages
    return 3000; // 3 seconds
  }

  // Refresh draft PR job data
  async function refreshDraftPRJob() {
    if (!jobId.value || typeof jobId.value !== 'string' || jobId.value.trim().length === 0) {
      return;
    }

    try {
      const job = await getDraftPRJob(jobId.value);
      draftPRJob.value = job;
    } catch (err: any) {
      console.error('Failed to refresh draft PR job:', err);
      // Don't set error here - let the base polling handle it
    }
  }

  // Track if we've already attempted auto-approval to prevent multiple attempts
  const autoApprovalAttempted = ref(false);

  // Auto-approve plan in YOLO mode
  async function checkAndAutoApprove() {
    if (!jobId.value || !draftPRJob.value) return;

    // Prevent multiple auto-approval attempts
    if (autoApprovalAttempted.value) return;

    // Only auto-approve if:
    // 1. Mode is YOLO
    // 2. Stage is WAITING_FOR_APPROVAL
    // 3. There's a latest plan available
    // 4. Plan has a valid hash
    // 5. Plan hasn't been approved yet
    // 6. We haven't already attempted approval
    if (
      isYoloMode.value &&
      currentStage.value === 'WAITING_FOR_APPROVAL' &&
      latestPlan.value &&
      latestPlan.value.plan_hash &&
      typeof latestPlan.value.plan_hash === 'string' &&
      latestPlan.value.plan_hash.trim().length > 0 &&
      !approvedPlanHash.value &&
      !autoApprovalAttempted.value
    ) {
      autoApprovalAttempted.value = true;
      try {
        uiStore.showInfo('YOLO mode: Auto-approving plan...');
        await approvePlanHash(latestPlan.value.plan_hash);
      } catch (err) {
        // Reset flag on error so we can retry if needed
        autoApprovalAttempted.value = false;
        // Error already handled in approvePlanHash
        console.error('Auto-approval failed:', err);
      }
    }
  }

  // Start polling with draft PR specific refresh
  async function startDraftPRPolling() {
    if (!jobId.value || typeof jobId.value !== 'string' || jobId.value.trim().length === 0) {
      return;
    }

    // Initial load
    await refreshDraftPRJob();

    // Check for YOLO auto-approval on initial load
    await checkAndAutoApprove();

    // Start base polling
    baseStartPolling();
    
    // Watch for stage changes and adjust polling frequency
    // Note: useJobPolling uses a fixed interval, so we can't change it dynamically
    // But we can restart polling when stage changes to use a better interval
    // For now, we'll use the default 3s interval which works reasonably well for all stages
    // The stage-aware intervals (2s for active, 5s for waiting) would require
    // modifying useJobPolling to support reactive intervals, which is a larger change
  }

  // Watch for stage changes to trigger auto-approval
  watch(currentStage, async (newStage, oldStage) => {
    // When stage changes to WAITING_FOR_APPROVAL, check for auto-approval
    if (newStage === 'WAITING_FOR_APPROVAL' && oldStage !== 'WAITING_FOR_APPROVAL') {
      // Reset auto-approval flag when entering WAITING_FOR_APPROVAL stage
      autoApprovalAttempted.value = false;
      await refreshDraftPRJob();
      await checkAndAutoApprove();
    } else if (newStage !== 'WAITING_FOR_APPROVAL') {
      // Reset flag when leaving WAITING_FOR_APPROVAL stage
      autoApprovalAttempted.value = false;
    }
  });

  // Approve plan
  async function approvePlanHash(planHash: string) {
    if (!jobId.value || typeof jobId.value !== 'string' || jobId.value.trim().length === 0) {
      uiStore.showError('Job ID is required');
      return;
    }

    if (!planHash || typeof planHash !== 'string' || planHash.trim().length === 0) {
      uiStore.showError('Plan hash is required');
      return;
    }

    // Prevent duplicate approvals
    if (isApproving.value) {
      return;
    }

    isApproving.value = true;
    try {
      const result = await approvePlan(jobId.value, planHash);
      uiStore.showSuccess('Plan approved! Pipeline is continuing...');
      
      // Refresh job status
      await refreshDraftPRJob();
      await refresh();
      
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to approve plan';
      
      // Handle TOCTOU error
      if (err.response?.status === 409) {
        uiStore.showError('Plan was modified during approval. Please refresh and approve the latest version.');
        await refreshDraftPRJob();
      } else {
        uiStore.showError(errorMsg);
      }
      throw err;
    } finally {
      isApproving.value = false;
    }
  }

  // Revise plan
  async function revisePlanWithFeedback(feedback: RevisePlanRequest) {
    if (!jobId.value || typeof jobId.value !== 'string' || jobId.value.trim().length === 0) {
      uiStore.showError('Job ID is required');
      return;
    }

    if (!feedback || !feedback.feedback || typeof feedback.feedback !== 'string' || feedback.feedback.trim().length === 0) {
      uiStore.showError('Feedback is required');
      return;
    }

    // Prevent duplicate revisions
    if (isRevising.value) {
      return;
    }

    isRevising.value = true;
    try {
      const result = await revisePlan(jobId.value, feedback);
      uiStore.showSuccess(`Plan revised to v${result.plan_version}`);
      
      // Refresh job status
      await refreshDraftPRJob();
      await refresh();
      
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to revise plan';
      
      // Handle plan already approved error
      if (err.response?.status === 400) {
        uiStore.showError('Cannot revise plan - plan is already approved');
      } else {
        uiStore.showError(errorMsg);
      }
      throw err;
    } finally {
      isRevising.value = false;
    }
  }

  // Get PR URL from results
  const prUrl = computed<string | null>(() => {
    const results = draftPRJob.value?.results;
    if (results && typeof results === 'object') {
      const prResults = (results as any).pr_results;
      return prResults?.pr_url || null;
    }
    return null;
  });

  // Get error message
  const errorMessage = computed<string | null>(() => {
    return draftPRJob.value?.error || null;
  });

  return {
    // Job data
    job: computed(() => draftPRJob.value || baseJob.value),
    draftPRJob,
    currentStage,
    planVersions,
    latestPlan,
    approvedPlanHash,
    isYoloMode,
    prUrl,
    errorMessage,

    // Loading states
    isLoading,
    error,
    isPolling,
    isCancelling,
    isApproving,
    isRevising,

    // Actions
    startPolling: startDraftPRPolling,
    stopPolling,
    cancelJob,
    refresh: async () => {
      await refreshDraftPRJob();
      await refresh();
    },
    approvePlan: approvePlanHash,
    revisePlan: revisePlanWithFeedback,
  };
}
