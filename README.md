# Augment UI

A Vue.js 3 frontend application for the [Augment](https://github.com/deptz/augment) API. Generate, manage, and optimize JIRA ticket with AI-powered assistance using multiple LLM providers to streamline project management workflows.

**Augment UI** is the frontend/UI component of the Augment project, providing an intuitive interface for interacting with the Augment backend API.

## ✨ Features

- **Single Ticket Backfill** - Generate AI-powered descriptions for individual JIRA tickets
- **Task Breakdown** - Break down stories into detailed, actionable tasks with dependency management
- **Story Coverage Analysis** - Analyze how well tasks cover story requirements and identify gaps with optional additional context for focused analysis
- **PRD Story Sync** - Sync story tickets from PRD documents to JIRA with bulk operations and existing ticket linking
- **Bulk Story Updates** - Update multiple story tickets in JIRA simultaneously
- **Existing Ticket Detection** - Automatically detect and link existing JIRA tickets from PRD documents
- **Story Editing & Sync** - Edit stories locally and sync changes back to JIRA
- **A/B Testing** - Compare different prompts and models to optimize generation quality
- **Prompt Visibility** - View and copy the exact prompts sent to LLMs
- **Background Job Processing** - Run long-running operations asynchronously with real-time progress tracking

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/deptz/augment-ui.git
cd augment-ui

# Install dependencies
npm install

# Configure environment (optional)
cp env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`. See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

## 📋 Prerequisites

- Node.js 16+ and npm
- Access to [Augment API](https://github.com/deptz/augment) (default: `http://localhost:8000`)
- JIRA API credentials

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and set your API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

See `env.example` for all available configuration options.

## 📖 Usage

### First Time Setup

1. Start the application (`npm run dev`)
2. Enter your JIRA API credentials in the authentication modal (if `VITE_AUTO_AUTH_MODAL` is enabled)
   - If authentication is disabled, you can still authenticate manually via Settings
3. Credentials are stored in browser localStorage for future sessions

### Workflow Pattern

All features follow a consistent preview-first workflow:

1. **Generate** → AI generates content in preview mode (no JIRA updates)
2. **Review & Edit** → Review and modify the generated content
3. **Preview** → See what changes will be made to JIRA
4. **Commit** → Apply changes to JIRA

### Feature Guides

- **Single Ticket Backfill** - Navigate to "Single Ticket", enter ticket key, generate, review, and commit
- **Task Breakdown** - Navigate to "Task Breakdown", enter story/epic keys, generate tasks, review/edit dependencies, and bulk create tasks efficiently using async mode for large batches
- **Story Coverage Analysis** - Navigate to "Story Coverage", analyze a story with optional additional context, review gaps and suggestions, apply updates
- **PRD Story Sync** - Navigate to "PRD Story Sync", enter epic key or PRD URL, review generated stories with existing ticket metadata, edit stories, bulk update, and sync to JIRA with async mode support
- **Background Jobs** - Navigate to "Jobs" to monitor and manage long-running operations

#### Task Breakdown Features

When working with Task Breakdown, you can efficiently manage and create tasks:

- **Bulk Task Creation**: Create multiple tasks at once using the bulk creation endpoint for improved performance
- **Async Mode Support**: Enable "Run in background" for large task batches to avoid timeouts and improve UX
- **Dependency Management**: Manage task dependencies through an intuitive interface
  - **Dependency Selection**: Use the multi-select dropdown to choose which tasks the current task depends on
  - **Automatic Resolution**: The system automatically uses task IDs (when available) for accurate dependency tracking, falling back to task summaries when needed
  - **Real-time Updates**: Dependency options update automatically when task summaries are modified
  - **JIRA Integration**: When creating tasks in JIRA, dependencies are resolved to JIRA ticket keys for already-created tasks, ensuring proper linking

#### PRD Story Sync Features

The PRD Story Sync feature includes advanced capabilities for managing stories:

- **UUID-Based Row Matching**: Ensures exact PRD table row matching when creating stories
  - UUIDs are generated during dry run/preview mode for each story
  - UUIDs are automatically preserved and passed when creating stories in JIRA
  - Enables precise matching instead of fuzzy matching, preventing incorrect row associations
  - UUID badge displayed in story cards for transparency and debugging
  - Click-to-copy UUID functionality when story has a JIRA key

- **Existing Ticket Detection**: Automatically detects existing JIRA tickets linked in PRD documents
  - Shows ticket source (PRD table, JIRA API, or newly created)
  - Displays action taken (created, updated, or skipped)
  - Indicates if ticket was updated during sync
  - Clickable JIRA key badges that open tickets in new tabs

- **Bulk Operations**: 
  - Bulk update multiple stories at once using the "Bulk Update" button
  - Updates all stories with JIRA keys simultaneously
  - Supports async processing for large batches

- **Story Editing & Sync**:
  - Edit stories locally with full test case support
  - UUIDs are preserved when editing stories
  - When editing existing stories with JIRA keys, option to sync changes back to JIRA
  - Automatic confirmation prompts for JIRA updates

- **Existing Ticket Actions**: Configure how to handle existing tickets:
  - **Skip**: Don't create or update (default)
  - **Update**: Update existing tickets with new information
  - **Error**: Return an error if ticket already exists

For detailed usage instructions, see [QUICK_START.md](QUICK_START.md).

## ⚙️ Configuration

### API Base URL

Set the API base URL in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### LLM Provider and Model

The application supports multiple LLM providers:
- **OpenAI** (GPT models)
- **Anthropic** (Claude models)
- **Google** (Gemini models)

Default selection priority:
1. User's last selection (stored in cookies)
2. Environment variables (`VITE_DEFAULT_LLM_PROVIDER`, `VITE_DEFAULT_LLM_MODEL`)
3. Backend API defaults

Example `.env` configuration:
```env
VITE_DEFAULT_LLM_PROVIDER=openai
VITE_DEFAULT_LLM_MODEL=gpt-4
```

**Note:** Provider and model names must exactly match what your backend API returns. Check your API's `/models` endpoint for available options.

### Development Server Hosts

Configure allowed hosts for the Vite dev server:
```env
VITE_ALLOWED_HOSTS=example.com,subdomain.example.com
```

### Authentication Modal Behavior

Control whether the authentication modal appears automatically:

```env
# Enable/disable automatic authentication modal popup
# When set to false, the auth modal will not appear automatically on app load
# or on 401 errors. The modal will only appear when user manually clears
# credentials in settings. App will function without authentication (optional auth mode)
# Default: true (maintains current behavior)
VITE_AUTO_AUTH_MODAL=true
```

**Behavior when `VITE_AUTO_AUTH_MODAL=false`:**
- Modal does NOT appear automatically on app load
- Modal does NOT appear on 401 errors (credentials cleared silently)
- Modal DOES appear when user manually clears credentials in settings
- App functions without authentication (optional auth mode)

This is useful for development environments or when authentication is optional.

## 🔒 Security

- The application uses HTTP Basic Authentication for API access
- Credentials are stored in browser localStorage
- **Always use HTTPS in production environments**
- Never commit `.env` files with actual credentials to version control
- Console logging is disabled in production builds to prevent information leakage
- Error messages are sanitized to avoid exposing sensitive data

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly. See [SECURITY.md](SECURITY.md) for details on how to report security issues.

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🐳 Docker

### Run from Docker Hub

You can run **Augment UI** directly from a published Docker image without installing Node.js:

```bash
# Run a specific version
docker run --rm -p 8080:80 pujitriwibowo/augment-ui:0.1.0

# Or use the latest tag
docker run --rm -p 8080:80 pujitriwibowo/augment-ui:latest
```

Then open `http://localhost:8080` in your browser.

> **Note on environment:** This is a static SPA built with [Vite](https://vite.dev/), so all `VITE_*` variables (like `VITE_API_BASE_URL`) are **baked in at build time**, not read at container runtime.  
> The images on Docker Hub are built with `VITE_API_BASE_URL=http://localhost:8000`, which means the UI in your browser will call the Augment API at `http://localhost:8000`.

Make sure your Augment backend is reachable at that URL from the user’s browser (for local dev, run the backend on your machine at `http://localhost:8000`).

#### Custom environment for your own image

All frontend configuration lives in `VITE_*` variables (see `env.example`). To build an image that talks to a different Augment API URL or uses different defaults, pass build-time arguments:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://augment-api.yourdomain.com \
  --build-arg VITE_ENVIRONMENT=production \
  --build-arg VITE_DEFAULT_LLM_PROVIDER=openai \
  --build-arg VITE_DEFAULT_LLM_MODEL=gpt-4o \
  -t your-org/augment-ui:custom .
```

These values are wired into the built static assets; setting `-e VITE_API_BASE_URL=...` on `docker run` **will not** change them at runtime.


## 🛠️ Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management for Vue 3
- **Vue Router** - Official router for Vue.js
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Vitest** - Fast unit test framework

## 📁 Project Structure

```
augment-ui/
├── src/
│   ├── api/              # API client and endpoint definitions
│   ├── components/       # Reusable Vue components
│   ├── composables/      # Vue composables
│   ├── views/            # Page-level components
│   ├── stores/           # Pinia state management
│   ├── types/            # TypeScript type definitions
│   └── router/           # Vue Router configuration
├── tests/                # Test files
├── public/               # Static assets
└── dist/                 # Production build output
```

## 🐛 Troubleshooting

### Cannot connect to API
- Ensure the backend API is running on the configured URL
- Check CORS configuration if accessing from a different origin
- Verify authentication credentials

### Authentication fails
- Clear credentials in Settings and re-enter
- Verify credentials work with the API directly
- Check API server logs for authentication errors

### LLM models not loading
- Ensure API has valid LLM provider API keys configured
- Check network connectivity
- Try refreshing models in Settings

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the O'Saasy License - see the [LICENSE](LICENSE.md) file for details.

## 🔗 Related Projects

- **[Augment](https://github.com/deptz/augment)** - The backend API that powers Augment UI

## 📞 Support

- Open an issue on [GitHub](https://github.com/deptz/augment-ui/issues) for bug reports or feature requests
- Refer to the [Augment API documentation](https://github.com/deptz/augment) at your configured API endpoint (default: `http://localhost:8000/docs`)
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our code of conduct
