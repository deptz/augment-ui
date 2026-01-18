/**
 * Artifact utility functions for formatting and operations
 */

import type { ArtifactMetadata } from '@/types/api';

/**
 * Format bytes to human-readable file size
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatArtifactSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';
  if (bytes < 0 || !isFinite(bytes)) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedIndex = Math.max(0, Math.min(i, sizes.length - 1));
  const size = bytes / Math.pow(k, clampedIndex);
  
  return `${parseFloat(size.toFixed(2))} ${sizes[clampedIndex]}`;
}

/**
 * Format date to relative time or absolute date
 * @param dateString - ISO 8601 date string
 * @param useRelative - Whether to use relative time (e.g., "2 hours ago")
 * @returns Formatted date string
 */
export function formatArtifactDate(
  dateString: string | null | undefined,
  useRelative: boolean = true
): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    if (useRelative) {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    }
    
    // Fall back to absolute date
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

/**
 * Get icon class based on artifact type
 * @param artifactType - Artifact type string
 * @returns Tailwind CSS classes for icon background
 */
export function getArtifactIconClass(artifactType: string): string {
  const type = artifactType.toLowerCase();
  
  if (type.includes('plan')) {
    return 'bg-blue-100 text-blue-600';
  }
  if (type.includes('diff') || type.includes('git')) {
    return 'bg-green-100 text-green-600';
  }
  if (type.includes('log')) {
    return 'bg-yellow-100 text-yellow-600';
  }
  if (type.includes('metadata')) {
    return 'bg-purple-100 text-purple-600';
  }
  if (type.includes('approval')) {
    return 'bg-indigo-100 text-indigo-600';
  }
  if (type.includes('fingerprint')) {
    return 'bg-gray-100 text-gray-600';
  }
  
  return 'bg-gray-100 text-gray-600';
}

/**
 * Sort artifacts by various criteria
 * @param artifacts - Array of artifact names
 * @param metadata - Metadata record for artifacts
 * @param sortBy - Sort criteria: 'name', 'size', 'date', 'type'
 * @param sortOrder - Sort order: 'asc' or 'desc'
 * @returns Sorted array of artifact names
 */
export function sortArtifacts(
  artifacts: string[],
  metadata: Record<string, ArtifactMetadata>,
  sortBy: 'name' | 'size' | 'date' | 'type' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): string[] {
  const sorted = [...artifacts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.localeCompare(b);
        break;
      case 'size':
        const sizeA = metadata[a]?.size_bytes || 0;
        const sizeB = metadata[b]?.size_bytes || 0;
        comparison = sizeA - sizeB;
        break;
      case 'date':
        const dateA = metadata[a]?.created_at 
          ? new Date(metadata[a].created_at).getTime() 
          : 0;
        const dateB = metadata[b]?.created_at 
          ? new Date(metadata[b].created_at).getTime() 
          : 0;
        comparison = dateA - dateB;
        break;
      case 'type':
        // Group by type prefix (e.g., 'plan_', 'git_', etc.)
        const typeA = a.split('_')[0] || a;
        const typeB = b.split('_')[0] || b;
        comparison = typeA.localeCompare(typeB);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Filter artifacts by type, size, or date
 * @param artifacts - Array of artifact names
 * @param metadata - Metadata record for artifacts
 * @param filters - Filter criteria
 * @returns Filtered array of artifact names
 */
export function filterArtifacts(
  artifacts: string[],
  metadata: Record<string, ArtifactMetadata>,
  filters: {
    type?: string;
    minSize?: number;
    maxSize?: number;
    afterDate?: string;
    beforeDate?: string;
  }
): string[] {
  return artifacts.filter(artifact => {
    const meta = metadata[artifact];
    
    // Filter by type
    if (filters.type && !artifact.toLowerCase().includes(filters.type.toLowerCase())) {
      return false;
    }
    
    // Filter by size
    if (meta?.size_bytes !== undefined) {
      if (filters.minSize !== undefined && meta.size_bytes < filters.minSize) {
        return false;
      }
      if (filters.maxSize !== undefined && meta.size_bytes > filters.maxSize) {
        return false;
      }
    }
    
    // Filter by date
    if (meta?.created_at) {
      const artifactDate = new Date(meta.created_at).getTime();
      
      if (filters.afterDate) {
        const afterDate = new Date(filters.afterDate).getTime();
        if (artifactDate < afterDate) {
          return false;
        }
      }
      
      if (filters.beforeDate) {
        const beforeDate = new Date(filters.beforeDate).getTime();
        if (artifactDate > beforeDate) {
          return false;
        }
      }
    }
    
    return true;
  });
}

/**
 * Get artifact type category
 * @param artifactType - Artifact type string
 * @returns Category name
 */
export function getArtifactCategory(artifactType: string): string {
  const type = artifactType.toLowerCase();
  
  if (type.includes('plan')) return 'Plan';
  if (type.includes('diff') || type.includes('git')) return 'Diff';
  if (type.includes('log')) return 'Log';
  if (type.includes('metadata')) return 'Metadata';
  if (type.includes('approval')) return 'Approval';
  if (type.includes('fingerprint')) return 'Fingerprint';
  if (type.includes('spec')) return 'Specification';
  
  return 'Other';
}

/**
 * Format artifact name for display
 * @param artifact - Artifact name
 * @returns Formatted display name
 */
export function formatArtifactName(artifact: string): string {
  return artifact
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get artifact description
 * @param artifact - Artifact name
 * @returns Description string
 */
export function getArtifactDescription(artifact: string): string {
  const descriptions: Record<string, string> = {
    input_spec: 'Input specification for the job',
    workspace_fingerprint: 'Workspace fingerprint information',
    plan_v1: 'Plan version 1',
    plan_v2: 'Plan version 2',
    approval: 'Plan approval record',
    git_diff: 'Git diff of changes',
    validation_logs: 'Validation and test logs',
    pr_metadata: 'Pull request metadata',
  };
  
  // Try exact match first
  if (descriptions[artifact]) {
    return descriptions[artifact];
  }
  
  // Try pattern matching
  if (artifact.includes('plan')) {
    const versionMatch = artifact.match(/v(\d+)/);
    if (versionMatch) {
      return `Plan version ${versionMatch[1]}`;
    }
    return 'Plan specification';
  }
  
  if (artifact.includes('diff') || artifact.includes('git')) {
    return 'Git diff of changes';
  }
  
  if (artifact.includes('log')) {
    return 'Validation and test logs';
  }
  
  if (artifact.includes('metadata')) {
    return 'Metadata information';
  }
  
  return 'Artifact data';
}
