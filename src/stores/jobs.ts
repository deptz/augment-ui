import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { listJobs, getJobStatus } from '../api/endpoints';
import type { JobStatus, JobListParams } from '../types/api';
import { error } from '../utils/logger';

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<JobStatus[]>([]);
  const loading = ref(false);
  const lastRefresh = ref<Date | null>(null);

  // Computed properties
  const activeJobs = computed(() => {
    return jobs.value.filter(job => ['started', 'processing'].includes(job.status));
  });

  const completedJobs = computed(() => {
    return jobs.value.filter(job => job.status === 'completed');
  });

  const failedJobs = computed(() => {
    return jobs.value.filter(job => job.status === 'failed');
  });

  // Actions
  async function fetchJobs(params?: JobListParams) {
    loading.value = true;
    try {
      const response = await listJobs(params);
      jobs.value = response.jobs || [];
      lastRefresh.value = new Date();
    } catch (error) {
      error('Error fetching jobs:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function refreshJob(jobId: string) {
    try {
      const job = await getJobStatus(jobId);
      const index = jobs.value.findIndex(j => j.job_id === jobId);
      if (index >= 0) {
        jobs.value[index] = job;
      } else {
        jobs.value.push(job);
      }
      return job;
    } catch (error) {
      error('Error refreshing job:', error);
      throw error;
    }
  }

  function addJob(job: JobStatus) {
    const index = jobs.value.findIndex(j => j.job_id === job.job_id);
    if (index >= 0) {
      jobs.value[index] = job;
    } else {
      jobs.value.unshift(job); // Add to beginning
    }
  }

  function removeJob(jobId: string) {
    const index = jobs.value.findIndex(j => j.job_id === jobId);
    if (index >= 0) {
      jobs.value.splice(index, 1);
    }
  }

  function getJob(jobId: string): JobStatus | undefined {
    return jobs.value.find(j => j.job_id === jobId);
  }

  // Auto-refresh active jobs
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  function startAutoRefresh(intervalMs: number = 5000) {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(async () => {
      if (activeJobs.value.length > 0) {
        // Refresh all active jobs
        await Promise.all(
          activeJobs.value.map(job => refreshJob(job.job_id).catch(err => error('Error refreshing job:', err)))
        );
      }
    }, intervalMs);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  return {
    // State
    jobs,
    loading,
    lastRefresh,
    // Computed
    activeJobs,
    completedJobs,
    failedJobs,
    // Actions
    fetchJobs,
    refreshJob,
    addJob,
    removeJob,
    getJob,
    startAutoRefresh,
    stopAutoRefresh,
  };
});


