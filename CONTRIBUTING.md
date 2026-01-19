# Contributing to FlowState

Thank you for your interest in contributing to FlowState! 🎮

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

Be respectful, inclusive, and constructive. We're all here to make FlowState better!

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup
```bash
git clone https://github.com/yourusername/flowstate.git
cd flowstate/frontend
npm install
npm run dev
```

### Environment Variables
Create `.env.local` with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 💻 Development Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation

### Commits
Follow conventional commits:
```
feat: add new power-up system
fix: resolve tile rotation bug
docs: update README
refactor: simplify level generator
```

## 🔄 Pull Request Process

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run tests (if available)
5. Create a Pull Request with a clear description

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments where needed
- [ ] Updated documentation if needed
- [ ] No console errors or warnings

## 🎨 Style Guidelines

### TypeScript
- Use strict typing
- Avoid `any` type
- Use interfaces for complex objects

### React
- Functional components with hooks
- Prop types using TypeScript interfaces
- Memoize expensive computations

### CSS
- Use Tailwind CSS classes
- Use CSS variables for theming
- Mobile-first approach

---

Thank you for contributing! 🙏
