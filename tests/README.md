# Tests

This directory contains tests for the Augment UI application.

## Test Structure

```
tests/
├── setup.ts                    # Test setup and global mocks
├── composables/                # Tests for Vue composables
│   └── useJobPolling.test.ts  # Job polling composable tests
├── api/                        # Tests for API endpoints
│   ├── endpoints.test.ts      # Job API endpoint tests
│   └── prdSync.test.ts        # PRD story sync endpoint tests
└── types/                      # Type validation tests
    └── api.test.ts            # API type tests (including PRD sync types)
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

Current test coverage includes:

- **Job Polling Composable** (`useJobPolling`)
  - Initialization
  - Polling start/stop
  - Job completion handling
  - Error handling (404, 401, network errors)
  - Job cancellation
  - Automatic cleanup

- **Job API Endpoints**
  - `getJobStatus` - Fetch job status
  - `listJobs` - List jobs with filters
  - `cancelJob` - Cancel running jobs
  - `getJobByTicket` - Get job by ticket key

- **PRD Story Sync API Endpoints**
  - `syncStoriesFromPRD` - Sync stories from PRD with epic_key
  - `syncStoriesFromPRD` - Sync stories from PRD with prd_url
  - `syncStoriesFromPRD` - Handle async mode and BatchResponse
  - `syncStoriesFromPRD` - Default parameter handling
  - `syncStoriesFromPRD` - Existing ticket action options

- **Type Definitions**
  - `BatchResponse` type validation
  - `JobStatus` type validation
  - `JobStatusType` enum validation
  - `JobListParams` type validation
  - `PRDStorySyncRequest` type validation
  - `PRDStorySyncResponse` type validation
  - `StoryDetail` type validation

## Writing New Tests

When adding new features, especially related to async jobs:

1. Add tests for new composables in `tests/composables/`
2. Add tests for new API endpoints in `tests/api/` (create separate file for each major feature)
3. Add type validation tests in `tests/types/`
4. Update this README with new test coverage

### Example: PRD Story Sync Tests

The PRD Story Sync feature includes comprehensive tests:
- API endpoint tests in `tests/api/prdSync.test.ts`
- Type validation tests in `tests/types/api.test.ts`
- Tests cover both epic_key and prd_url scenarios
- Tests verify async mode handling
- Tests validate default parameter behavior

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { useMyComposable } from '../../src/composables/useMyComposable';

describe('useMyComposable', () => {
  it('should work correctly', () => {
    const result = useMyComposable();
    expect(result).toBeDefined();
  });
});
```

## Mocking

Tests use Vitest's mocking capabilities:

- API endpoints are mocked in composable tests
- UI store is mocked to avoid side effects
- Timers are faked for polling tests

See `tests/setup.ts` for global mocks and setup.

