# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Augment UI is a Vue.js 3 frontend application for the Augment API - a tool that helps generate, manage, and optimize JIRA ticket descriptions with AI-powered assistance. The app provides features for single ticket generation, task breakdown from stories, story coverage analysis, PRD synchronization, and sprint planning.

## Development Commands

```bash
# Start dev server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run a single test file
npx vitest tests/api/endpoints.test.ts

# Run tests matching a pattern
npx vitest -t "useJobPolling"
```

## Architecture

### Tech Stack
- Vue 3 with Composition API
- Pinia for state management
- Vue Router for navigation
- Vite for build tooling
- Tailwind CSS for styling
- Axios for HTTP requests
- Vitest + jsdom for testing

### Key Directories
- `src/api/` - API client and endpoint definitions
- `src/composables/` - Vue composables for reusable logic
- `src/stores/` - Pinia stores for global state
- `src/types/` - TypeScript type definitions
- `src/views/` - Page-level Vue components
- `src/components/` - Reusable Vue components
- `tests/` - Test files mirroring src structure

### API Layer Pattern
The API layer uses a singleton `ApiClient` class (`src/api/client.ts`) that wraps Axios with:
- Automatic Basic Auth header injection (credentials stored in localStorage or env vars)
- 401 response handling with automatic credential clearing
- Configurable public endpoints that skip auth

All API endpoints are defined as async functions in `src/api/endpoints.ts`, returning typed responses from `src/types/api.ts`.

### State Management Pattern
Pinia stores use the Composition API style (`defineStore` with setup function). Key stores:
- `auth` - Authentication state, credential management, modal visibility
- `jobs` - Background job tracking with auto-refresh
- `ui` - Notification system (showSuccess, showError, showInfo, showWarning)
- `models` - LLM provider/model selection

### Async Job Pattern
Long-running operations use async mode (`async_mode: true`). The flow:
1. API returns `BatchResponse` with `job_id` and `status_url`
2. Use `useJobPolling` composable to poll job status
3. Composable handles retries, exponential backoff, and final state notifications
4. Job results stored in `JobStatus.results`

The `useJobPolling` composable (`src/composables/useJobPolling.ts`) provides:
- Automatic polling with configurable intervals
- Status change callbacks
- Cancellation support
- Automatic cleanup on component unmount

### Environment Variables
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_DEFAULT_USERNAME` / `VITE_DEFAULT_PASSWORD` - Auto-fill auth credentials
- `VITE_AUTO_AUTH_MODAL` - Control automatic auth modal display
- `VITE_ALLOWED_HOSTS` - Comma-separated list of allowed hosts for dev server

### Path Alias
Use `@/` to reference files from `src/` directory (configured in vite.config.js).

## Testing Patterns

Tests use Vitest with jsdom environment. Setup file at `tests/setup.ts` mocks browser APIs.

- Mock API calls using `vi.mock('../src/api/endpoints')`
- Mock stores using `vi.mock('../src/stores/ui')`
- Use `vi.useFakeTimers()` for testing polling/intervals
- Test files mirror source structure in `tests/` directory
