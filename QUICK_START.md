# Quick Start Guide

Get up and running with Augment UI in minutes.

## Prerequisites

- Node.js 16+ installed
- [Augment API](https://github.com/deptz/augment) running (default: `http://localhost:8000`)
- JIRA API credentials (username/email and API token/password)

## Setup

### 1. Install Dependencies

```bash
# Navigate to the project directory
cd augment-ui

# Install dependencies
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp env.example .env
```

Edit `.env` and set your API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

See `env.example` for all available configuration options.

### 3. Start Development Server

```bash
npm run dev
```

The application will start at **http://localhost:5173**

### 4. First Login

1. Open http://localhost:5173 in your browser
2. An authentication modal will appear
3. Enter your JIRA credentials:
   - **Username**: Your JIRA email (e.g., user@example.com)
   - **API Token**: Your JIRA API token or password
4. Click "Connect"

Your credentials will be stored in browser localStorage for future sessions.

## Quick Test

### Test Single Ticket Generation

1. Navigate to "Single Ticket" from the menu
2. Enter a test ticket key (e.g., "PROJ-123")
3. Click "Generate Description"
4. Review the generated description
5. Optionally edit it
6. Click "Preview Update" to see what would change
7. Click "Update JIRA" to commit (or skip if just testing)

## Features Overview

| Feature | Route | Description |
|---------|-------|-------------|
| **Single Ticket** | `/single-ticket` | Generate descriptions for individual tickets |
| **Task Breakdown** | `/task-breakdown` | Break stories into tasks |
| **Story Coverage** | `/story-coverage` | Analyze task coverage and identify gaps |
| **PRD Story Sync** | `/prd-sync` | Sync stories from PRD documents |
| **Jobs** | `/jobs` | Monitor background job processing |
| **Settings** | `/settings` | Manage authentication and configuration |

## Common Workflows

### Single Ticket Backfill

1. Navigate to "Single Ticket"
2. Enter ticket key (e.g., `PROJ-123`)
3. Select LLM provider/model (optional)
4. Click "Generate Description"
5. Edit if needed
6. Click "Preview Update" → "Update JIRA"

### Task Breakdown

1. Navigate to "Task Breakdown"
2. Enter story key(s) and epic key
3. Click "Generate Tasks"
4. Review, edit, add, or remove tasks
5. Click "Preview All" → "Create All in JIRA"

### Story Coverage Analysis

1. Navigate to "Story Coverage"
2. Enter story key
3. Optionally include test cases
4. Enable "Run in background" for long analyses
5. Click "Analyze Coverage"
6. Review gaps and suggestions
7. Apply updates or create new tasks

### PRD Story Sync

1. Navigate to "PRD Story Sync"
2. Enter epic key (reads PRD URL from epic) or PRD URL directly
3. Select LLM provider/model
4. Choose existing ticket action (skip/update/error)
5. Enable "Run in background" for large PRDs
6. Click "Sync Stories from PRD"
7. Review generated stories
8. Toggle "Preview mode" off and sync again to create tickets

## Background Jobs

For long-running operations, enable "Run in background":

- **Single Ticket Generation** - Complex tickets
- **Task Breakdown** - Multiple stories
- **Story Coverage Analysis** - Stories with many tasks
- **PRD Story Sync** - Large PRD documents

When enabled:
- Operation starts immediately
- Job status card shows real-time progress
- Continue working while job runs
- Results automatically displayed on completion
- Cancel jobs if needed

Monitor all jobs at `/jobs`.

## Troubleshooting

### "Connection failed" error

**Solution**: Ensure the backend API is running:
```bash
# Check if API is accessible
curl http://localhost:8000/health
```

### Authentication modal keeps appearing

**Solution**: 
1. Verify credentials are correct
2. Test API directly: `curl http://localhost:8000/health`
3. Clear browser localStorage and try again
4. Check Settings → Clear Credentials

### No LLM models available

**Solution**: 
1. Ensure API has LLM provider API keys configured
2. Go to Settings → Refresh Models
3. Check API logs for errors
4. Verify network connectivity

### Changes not appearing in JIRA

**Solution**:
1. Ensure you clicked "Update JIRA" (not just "Preview")
2. Check JIRA permissions
3. Verify API has write access to JIRA
4. Check job status if running in background

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Files will be in the `dist/` directory. Serve with any static file server (nginx, Apache, etc.).

## Next Steps

1. ✅ Start the development server
2. ✅ Log in with your credentials
3. ✅ Try generating a description for a test ticket
4. ✅ Explore other features
5. ✅ Try PRD Story Sync with an epic key or PRD URL
6. ✅ Check out A/B testing (expand "View Prompts")

## Additional Resources

- **Full Documentation**: [README.md](./README.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Augment Backend**: [https://github.com/deptz/augment](https://github.com/deptz/augment)
- **API Documentation**: http://localhost:8000/docs (or your configured API URL)
