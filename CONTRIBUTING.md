# Contributing to Augment UI

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to Augment UI.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository: [https://github.com/deptz/augment-ui](https://github.com/deptz/augment-ui)
2. Clone your fork: `git clone https://github.com/yourusername/augment-ui.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Access to [Augment API](https://github.com/deptz/augment) (or run locally)
- Git

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp env.example .env
```

3. Update `.env` with your configuration (see `env.example` for options)

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Project Structure

```
augment-ui/
├── src/
│   ├── api/              # API client and endpoint definitions
│   ├── components/       # Reusable Vue components
│   ├── composables/      # Vue composables
│   ├── views/            # Page-level components
│   ├── stores/           # Pinia state management
│   ├── types/            # TypeScript type definitions
│   ├── router/           # Vue Router configuration
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── tests/                # Test files
├── public/               # Static assets
└── dist/                 # Production build output
```

## Making Changes

### Adding New Features

1. **Define Types**: Add TypeScript types in `src/types/api.ts` if needed
2. **Add API Endpoints**: Add endpoint functions in `src/api/endpoints.ts`
3. **Create Components**: Add reusable components in `src/components/`
4. **Create Views**: Add page components in `src/views/`
5. **Update Router**: Add routes in `src/router/index.ts`
6. **Update Navigation**: Update navigation in `src/App.vue` if needed
7. **Add Tests**: Write tests in `tests/` directory

### Modifying Existing Features

- Follow existing code patterns and structure
- Maintain TypeScript type safety
- Update tests if behavior changes
- Update documentation if needed

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define types in `src/types/` directory
- Avoid `any` types; use proper type definitions
- Use interfaces for object shapes, types for unions/intersections

### Vue Components

- Use Composition API with `<script setup>`
- Use TypeScript for component props and emits
- Follow Vue 3 best practices
- Keep components focused and reusable

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Maintain consistent spacing and colors
- Ensure responsive design (mobile-friendly)

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskPreviewModal.vue`)
- **Files**: Match component/function names
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Code Organization

- Keep functions small and focused
- Extract reusable logic into composables
- Use Pinia stores for shared state
- Group related functionality together

## Testing

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Aim for good test coverage (80%+ for critical paths)
- Test user interactions, not implementation details
- Use Vitest and Vue Test Utils

### Test Structure

- `tests/composables/` - Tests for Vue composables
- `tests/api/` - Tests for API endpoint functions
- `tests/types/` - Type validation tests

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Update README.md or relevant docs if needed
2. **Write Tests**: Add tests for new features or bug fixes
3. **Run Tests**: Ensure all tests pass (`npm test`)
4. **Check Linting**: Fix any linting errors
5. **Commit Changes**: Write clear, descriptive commit messages
6. **Push to Fork**: Push your branch to your fork
7. **Open Pull Request**: Create a PR with a clear description

### Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add task preview modal
fix: Resolve authentication timeout issue
docs: Update API endpoint documentation
test: Add tests for job polling composable
refactor: Simplify task generation logic
```

### Pull Request Description

Include:
- **What**: Description of changes
- **Why**: Reason for the change
- **How**: Brief explanation of implementation
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes are involved

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Node version, OS, browser
- **Screenshots**: If applicable

### Feature Requests

When requesting features, please include:

- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you envision it working
- **Alternatives**: Other solutions you've considered

## Development Workflow

1. **Create Branch**: `git checkout -b feature/your-feature-name`
2. **Make Changes**: Write code, add tests
3. **Test Locally**: Run tests and dev server
4. **Commit**: Write clear commit messages
5. **Push**: Push to your fork
6. **Pull Request**: Open PR with description

## Getting Help

- Check existing issues and pull requests
- Review documentation in README.md
- Ask questions in issue discussions
- Refer to API documentation if backend-related

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉

