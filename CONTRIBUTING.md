# Contributing to Live Meeting Helper

Thank you for your interest in contributing to Live Meeting Helper! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive in all interactions. We welcome contributors of all experience levels. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Getting Started

### Prerequisites

- **Node.js 20+** (Node.js 25+ recommended)
- **pnpm 10+** - Fast, disk space efficient package manager
- **Google Cloud Account** - For Speech-to-Text API
- **Google AI API Key** - For Gemini AI

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/live-meeting-helper.git
   cd live-meeting-helper
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

5. **Verify your setup**:
   ```bash
   pnpm dev
   pnpm lint
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-speaker-diarization`
- `fix/websocket-reconnection`
- `docs/update-readme`
- `refactor/audio-processing`

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines below

3. Run linting:
   ```bash
   pnpm lint
   ```

4. Test your changes locally:
   ```bash
   pnpm dev
   ```

5. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add speaker diarization support"
   ```

### Commit Message Format

Use conventional commit prefixes:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Style

### TypeScript Guidelines

- **TypeScript strict mode** enabled
- **Type hints** on all function parameters and return types
- **React functional components** with hooks
- **Custom hooks** prefixed with `use` (e.g., `useTranscription`)

### Linting

We use ESLint with Next.js configuration:

```bash
# Check for issues
pnpm lint
```

### File Organization

- **Components**: `frontend/src/components/` - React components
- **Hooks**: `frontend/src/hooks/` - Custom React hooks
- **Pages**: `frontend/src/app/` - Next.js App Router pages

## Pull Request Process

1. **Update documentation** if your changes affect usage or APIs

2. **Ensure all checks pass**:
   - Linting (`pnpm lint`)
   - Build (`pnpm build`)

3. **Create a pull request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Link to any related issues

4. **Address review feedback** promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] All linting checks pass
- [ ] Build completes successfully
- [ ] Documentation updated if needed
- [ ] TypeScript types added for new functions

## Reporting Issues

### Bug Reports

When reporting bugs, include:
- Node.js version (`node --version`)
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages and console logs

### Feature Requests

For feature requests:
- Describe the use case
- Explain why existing features don't solve it
- Suggest a possible implementation (optional)

## Project Architecture

Understanding the codebase structure helps when contributing:

```
live-meeting-helper/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── components/      # React components
│   │   │   ├── AIAnswerDisplay.tsx
│   │   │   ├── RecordingControls.tsx
│   │   │   ├── TranscriptDisplay.tsx
│   │   │   └── MicTest.tsx
│   │   └── hooks/           # Custom React hooks
│   │       ├── useAudioRecorder.ts
│   │       └── useTranscription.ts
│   ├── server.js            # Custom Node.js server with WebSocket
│   ├── next.config.ts       # Next.js configuration
│   └── postcss.config.js    # PostCSS/Tailwind configuration
├── docs/                    # Documentation
└── package.json             # Root package.json (workspace)
```

### Key Components

- **server.js**: Custom Node.js server handling WebSocket connections and Google Cloud Speech-to-Text streaming
- **useTranscription**: Hook managing WebSocket connection and transcript state
- **useAudioRecorder**: Hook for browser audio capture via MediaRecorder API
- **AIAnswerDisplay**: Component for streaming AI responses

## Questions?

If you have questions about contributing, feel free to:
- Open a GitHub issue with the `question` label
- Contact me on LinkedIn: <https://www.linkedin.com/in/wszabopeter/>
- Check existing issues and discussions

Thank you for contributing to Live Meeting Helper!

*Peter*
