import { ref } from 'vue';
import { comparePlans } from '../api/endpoints';
import type { PlanComparison } from '../types/api';

// Cache configuration
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached comparisons

interface CachedComparison {
  data: PlanComparison;
  timestamp: number;
}

// Cache for comparison results with timestamps
const comparisonCache = new Map<string, CachedComparison>();

/**
 * Generate cache key for comparison
 */
function getCacheKey(jobId: string, fromVersion: number, toVersion: number, format?: string): string {
  return `${jobId}:${fromVersion}:${toVersion}:${format || 'summary'}`;
}

/**
 * Check if cached entry is still valid (not expired)
 */
function isCacheValid(entry: CachedComparison): boolean {
  const now = Date.now();
  return (now - entry.timestamp) < CACHE_TTL_MS;
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of comparisonCache.entries()) {
    if (!isCacheValid(entry)) {
      comparisonCache.delete(key);
    }
  }
}

/**
 * Enforce cache size limit by removing oldest entries
 */
function enforceCacheSizeLimit(): void {
  if (comparisonCache.size <= MAX_CACHE_SIZE) {
    return;
  }

  // Convert to array and sort by timestamp (oldest first)
  const entries = Array.from(comparisonCache.entries())
    .map(([key, entry]) => ({ key, timestamp: entry.timestamp }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Remove oldest entries until we're under the limit
  const toRemove = comparisonCache.size - MAX_CACHE_SIZE;
  for (let i = 0; i < toRemove; i++) {
    comparisonCache.delete(entries[i].key);
  }
}

export function usePlanComparison() {
  const comparison = ref<PlanComparison | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchComparison(
    jobId: string,
    fromVersion: number,
    toVersion: number,
    format: 'summary' | 'structured' | 'unified' = 'structured',
    useCache: boolean = true
  ): Promise<PlanComparison | null> {
    // Clean up expired entries before checking cache
    cleanupExpiredCache();

    // Check cache first
    const cacheKey = getCacheKey(jobId, fromVersion, toVersion, format);
    if (useCache && comparisonCache.has(cacheKey)) {
      const cachedEntry = comparisonCache.get(cacheKey)!;
      if (isCacheValid(cachedEntry)) {
        comparison.value = cachedEntry.data;
        return cachedEntry.data;
      } else {
        // Entry expired, remove it
        comparisonCache.delete(cacheKey);
      }
    }

    loading.value = true;
    error.value = null;
    comparison.value = null;

    try {
      const result = await comparePlans(jobId, fromVersion, toVersion, format);
      comparison.value = result;
      
      // Store in cache with timestamp
      comparisonCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      // Enforce cache size limit
      enforceCacheSizeLimit();
      
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.detail || err.message || 'Failed to load comparison';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Export comparison as Markdown
   */
  function exportAsMarkdown(comparison: PlanComparison): string {
    const lines: string[] = [];
    lines.push(`# Plan Comparison: v${comparison.from_version} → v${comparison.to_version}`);
    lines.push('');
    lines.push(`**Summary:** ${comparison.summary || 'No summary available'}`);
    lines.push('');
    
    // Statistics
    lines.push('## Statistics');
    lines.push('');
    lines.push(`- **Added:** ${comparison.changes?.added?.length || 0}`);
    lines.push(`- **Modified:** ${comparison.changes?.modified?.length || 0}`);
    lines.push(`- **Removed:** ${comparison.changes?.removed?.length || 0}`);
    lines.push('');
    
    // Changed sections
    if (comparison.changed_sections && comparison.changed_sections.length > 0) {
      lines.push('## Changed Sections');
      lines.push('');
      comparison.changed_sections.forEach(section => {
        lines.push(`- ${section}`);
      });
      lines.push('');
    }
    
    // Detailed changes
    if (comparison.changes) {
      if (comparison.changes.added && comparison.changes.added.length > 0) {
        lines.push('### Added');
        lines.push('');
        comparison.changes.added.forEach(item => {
          lines.push(`- ${item}`);
        });
        lines.push('');
      }
      
      if (comparison.changes.modified && comparison.changes.modified.length > 0) {
        lines.push('### Modified');
        lines.push('');
        comparison.changes.modified.forEach(item => {
          lines.push(`- ${item}`);
        });
        lines.push('');
      }
      
      if (comparison.changes.removed && comparison.changes.removed.length > 0) {
        lines.push('### Removed');
        lines.push('');
        comparison.changes.removed.forEach(item => {
          lines.push(`- ${item}`);
        });
        lines.push('');
      }
    }
    
    // Unified diff if available
    if (comparison.unified_diff) {
      lines.push('## Unified Diff');
      lines.push('');
      lines.push('```diff');
      lines.push(comparison.unified_diff);
      lines.push('```');
    }
    
    return lines.join('\n');
  }

  /**
   * Export comparison to file
   */
  function exportComparison(
    comparison: PlanComparison,
    format: 'markdown' | 'json' = 'markdown'
  ): void {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'markdown') {
      content = exportAsMarkdown(comparison);
      filename = `plan-comparison-v${comparison.from_version}-to-v${comparison.to_version}.md`;
      mimeType = 'text/markdown';
    } else {
      content = JSON.stringify(comparison, null, 2);
      filename = `plan-comparison-v${comparison.from_version}-to-v${comparison.to_version}.json`;
      mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear cache for specific comparison or all
   */
  function clearCache(jobId?: string, fromVersion?: number, toVersion?: number, format?: string): void {
    if (jobId && fromVersion && toVersion) {
      // Clear specific comparison
      const cacheKey = getCacheKey(jobId, fromVersion, toVersion, format);
      comparisonCache.delete(cacheKey);
    } else {
      // Clear all cache
      comparisonCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  function getCacheStats(): {
    size: number;
    maxSize: number;
    ttlMs: number;
    expiredCount: number;
  } {
    cleanupExpiredCache();
    let expiredCount = 0;
    const now = Date.now();
    
    for (const entry of comparisonCache.values()) {
      if (!isCacheValid(entry)) {
        expiredCount++;
      }
    }
    
    return {
      size: comparisonCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMs: CACHE_TTL_MS,
      expiredCount,
    };
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
    exportAsMarkdown,
    exportComparison,
    clearCache,
    getCacheStats,
    reset,
  };
}
