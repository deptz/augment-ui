import { ref, computed } from 'vue';
import { listArtifacts, getArtifactMetadata } from '@/api/endpoints';
import type { ArtifactMetadata } from '@/types/api';
import { sortArtifacts, filterArtifacts } from '@/utils/artifactHelpers';

export interface ArtifactFilters {
  type?: string;
  minSize?: number;
  maxSize?: number;
  afterDate?: string;
  beforeDate?: string;
}

export type ArtifactSortBy = 'name' | 'size' | 'date' | 'type';
export type ArtifactSortOrder = 'asc' | 'desc';

export function useArtifacts(jobId: string | null) {
  const artifacts = ref<string[]>([]);
  const artifactMetadata = ref<Record<string, ArtifactMetadata>>({});
  const metadataLoading = ref<Record<string, boolean>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Filtering and sorting state
  const sortBy = ref<ArtifactSortBy>('name');
  const sortOrder = ref<ArtifactSortOrder>('asc');
  const filters = ref<ArtifactFilters>({});
  
  // Cache for metadata to avoid redundant requests
  const metadataCache = new Map<string, ArtifactMetadata>();
  
  // Computed: sorted and filtered artifacts
  const sortedArtifacts = computed(() => {
    let result = [...artifacts.value];
    
    // Apply filters
    if (Object.keys(filters.value).length > 0) {
      result = filterArtifacts(result, artifactMetadata.value, filters.value);
    }
    
    // Apply sorting
    result = sortArtifacts(
      result,
      artifactMetadata.value,
      sortBy.value,
      sortOrder.value
    );
    
    return result;
  });
  
  // Computed: metadata summary
  const metadataSummary = computed(() => {
    const totalSize = Object.values(artifactMetadata.value).reduce(
      (sum, meta) => sum + (meta.size_bytes || 0),
      0
    );
    
    const totalCount = artifacts.value.length;
    const withMetadata = Object.keys(artifactMetadata.value).length;
    
    const categories = new Set(
      artifacts.value.map(a => {
        if (a.includes('plan')) return 'Plan';
        if (a.includes('diff') || a.includes('git')) return 'Diff';
        if (a.includes('log')) return 'Log';
        if (a.includes('metadata')) return 'Metadata';
        return 'Other';
      })
    );
    
    return {
      totalCount,
      withMetadata,
      totalSize,
      categories: Array.from(categories),
    };
  });
  
  /**
   * Load all artifacts for the job
   */
  async function loadArtifacts(): Promise<void> {
    if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
      error.value = 'Invalid job ID';
      loading.value = false;
      return;
    }
    
    try {
      loading.value = true;
      error.value = null;
      
      const response = await listArtifacts(jobId);
      if (response && Array.isArray(response.artifacts)) {
        artifacts.value = response.artifacts.filter(
          a => a && typeof a === 'string' && a.trim().length > 0
        );
        
        // Load metadata for all artifacts
        await loadAllMetadata();
      } else {
        artifacts.value = [];
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || err.message || 'Failed to load artifacts';
      artifacts.value = [];
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Load metadata for all artifacts in parallel with caching
   */
  async function loadAllMetadata(): Promise<void> {
    const metadataPromises = artifacts.value.map(async (artifact) => {
      if (!artifact || typeof artifact !== 'string' || artifact.trim().length === 0) {
        return;
      }
      
      // Check cache first (only if jobId is valid)
      if (!jobId) return;
      
      const cacheKey = `${jobId}:${artifact}`;
      if (metadataCache.has(cacheKey)) {
        artifactMetadata.value[artifact] = metadataCache.get(cacheKey)!;
        return;
      }
      
      try {
        metadataLoading.value[artifact] = true;
        const metadata = await getArtifactMetadata(jobId, artifact);
        
        // Store in cache and reactive state
        metadataCache.set(cacheKey, metadata);
        artifactMetadata.value[artifact] = metadata;
      } catch (err: any) {
        // Silently fail metadata loading - it's optional
        console.warn(`Failed to load metadata for ${artifact}:`, err);
      } finally {
        metadataLoading.value[artifact] = false;
      }
    });
    
    await Promise.all(metadataPromises);
  }
  
  /**
   * Load metadata for a single artifact
   */
  async function loadMetadata(artifact: string): Promise<ArtifactMetadata | null> {
    if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) return null;
    if (!artifact || typeof artifact !== 'string' || artifact.trim().length === 0) return null;
    
    const cacheKey = `${jobId}:${artifact}`;
    
    // Check cache first
    if (metadataCache.has(cacheKey)) {
      const cached = metadataCache.get(cacheKey)!;
      artifactMetadata.value[artifact] = cached;
      return cached;
    }
    
    try {
      metadataLoading.value[artifact] = true;
      const metadata = await getArtifactMetadata(jobId, artifact);
      
      // Store in cache and reactive state
      metadataCache.set(cacheKey, metadata);
      artifactMetadata.value[artifact] = metadata;
      
      return metadata;
    } catch (err: any) {
      console.warn(`Failed to load metadata for ${artifact}:`, err);
      return null;
    } finally {
      metadataLoading.value[artifact] = false;
    }
  }
  
  /**
   * Set sort criteria
   */
  function setSort(criteria: ArtifactSortBy, order: ArtifactSortOrder = 'asc'): void {
    // If sorting by the same criteria, toggle order
    if (sortBy.value === criteria) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = criteria;
      sortOrder.value = order;
    }
  }
  
  /**
   * Set filters
   */
  function setFilters(newFilters: ArtifactFilters): void {
    filters.value = { ...filters.value, ...newFilters };
  }
  
  /**
   * Clear filters
   */
  function clearFilters(): void {
    filters.value = {};
  }
  
  /**
   * Clear cache
   */
  function clearCache(): void {
    metadataCache.clear();
  }
  
  /**
   * Reset all state
   */
  function reset(): void {
    artifacts.value = [];
    artifactMetadata.value = {};
    metadataLoading.value = {};
    loading.value = false;
    error.value = null;
    sortBy.value = 'name';
    sortOrder.value = 'asc';
    filters.value = {};
    clearCache();
  }
  
  return {
    // State
    artifacts,
    artifactMetadata,
    metadataLoading,
    loading,
    error,
    sortBy,
    sortOrder,
    filters,
    
    // Computed
    sortedArtifacts,
    metadataSummary,
    
    // Methods
    loadArtifacts,
    loadAllMetadata,
    loadMetadata,
    setSort,
    setFilters,
    clearFilters,
    clearCache,
    reset,
  };
}
