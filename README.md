# Augment UI

A modern Vue.js 3 frontend application for the [Augment](https://github.com/deptz/augment) API. Generate, manage, and optimize JIRA ticket descriptions with AI-powered assistance using multiple LLM providers.

**Augment UI** is the frontend/UI component of the Augment project, providing an intuitive interface for interacting with the Augment backend API.

## ✨ Features

- **Single Ticket Backfill** - Generate AI-powered descriptions for individual JIRA tickets
- **Task Breakdown** - Break down stories into detailed, actionable tasks
- **Story Coverage Analysis** - Analyze how well tasks cover story requirements and identify gaps
- **PRD Story Sync** - Sync story tickets from PRD documents to JIRA
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
2. Enter your JIRA API credentials in the authentication modal
3. Credentials are stored in browser localStorage for future sessions

### Workflow Pattern

All features follow a consistent preview-first workflow:

1. **Generate** → AI generates content in preview mode (no JIRA updates)
2. **Review & Edit** → Review and modify the generated content
3. **Preview** → See what changes will be made to JIRA
4. **Commit** → Apply changes to JIRA

### Feature Guides

- **Single Ticket Backfill** - Navigate to "Single Ticket", enter ticket key, generate, review, and commit
- **Task Breakdown** - Navigate to "Task Breakdown", enter story/epic keys, generate tasks, review/edit, and bulk create
- **Story Coverage Analysis** - Navigate to "Story Coverage", analyze a story, review gaps and suggestions, apply updates
- **PRD Story Sync** - Navigate to "PRD Story Sync", enter epic key or PRD URL, review generated stories, sync to JIRA
- **Background Jobs** - Navigate to "Jobs" to monitor and manage long-running operations

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
