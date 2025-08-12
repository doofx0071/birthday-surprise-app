# Contributing to Birthday Surprise App

Thank you for contributing to this special birthday surprise project! This guide will help you get started with the development workflow and best practices.

## 🎯 Project Overview

This is a birthday surprise web application built with:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **MCP Tools** for development assistance

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/doofx0071/birthday-surprise-app.git
   cd birthday-surprise-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Install recommended VS Code extensions**
   - Open VS Code
   - Install recommended extensions from `.vscode/extensions.json`

## 🔄 Development Workflow

### Branch Strategy (GitFlow)
- `main` - Production ready code
- `develop` - Integration branch  
- `feature/*` - Feature development branches
- `hotfix/*` - Emergency fixes

### Working on a Task

1. **Create an issue** for the task (if not exists)
2. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/task-{id}-{description}
   ```

3. **Use MCP Tools during development**
   - **Context7**: Always get latest documentation before coding
   - **Supabase MCP**: For all database operations
   - **Playwright MCP**: For testing user interactions
   - **Sequential Thinking**: For complex architectural decisions

4. **Follow coding standards**
   - Use TypeScript for all new code
   - Follow ESLint and Prettier configurations
   - Write meaningful commit messages
   - Add tests for new functionality

5. **Test your changes**
   ```bash
   npm run lint          # Check code quality
   npm run type-check     # TypeScript validation
   npm run test           # Unit tests
   npm run test:e2e       # E2E tests with Playwright
   npm run build          # Verify build works
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Link to related issue
   - Describe MCP tools used
   - Request review

## 🎨 Design Guidelines

### Color Palette
- **Pure White**: `#FFFFFF` (backgrounds, cards)
- **Soft Pink**: `#FFB6C1` (accents, buttons, hearts)
- **Rose Gold**: `#E8B4B8` (highlights, borders)
- **Charcoal Black**: `#2D2D2D` (text, contrast)
- **Light Gray**: `#F8F9FA` (subtle backgrounds)

### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Countdown**: Poppins (bold display)

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly interactions
- Accessibility compliance (WCAG 2.1 AA)

## 🔧 MCP Tools Usage

### Context7 MCP
```bash
# Always use before implementing features
Context7: "Next.js 14 App Router best practices"
Context7: "Tailwind CSS responsive design patterns"
Context7: "React Hook Form validation techniques"
```

### Supabase MCP
```bash
# For database operations
Supabase MCP: Create table with RLS policies
Supabase MCP: Set up real-time subscriptions
Supabase MCP: Configure storage buckets
```

### Playwright MCP
```bash
# For testing
Playwright MCP: Test form submission flow
Playwright MCP: Test file upload functionality
Playwright MCP: Test responsive design
```

### Sequential Thinking MCP
```bash
# For complex decisions
Sequential Thinking: Optimize database schema design
Sequential Thinking: Plan user experience flow
Sequential Thinking: Architect email delivery system
```

## 🧪 Testing Guidelines

### Unit Tests
- Test individual components and functions
- Use Jest and React Testing Library
- Aim for >80% code coverage

### Integration Tests
- Test component interactions
- Test API integrations
- Test database operations

### E2E Tests (Playwright)
- Test complete user journeys
- Test across different browsers
- Test mobile responsiveness
- Test accessibility features

## 📝 Code Standards

### TypeScript
- Use strict mode
- Define proper interfaces and types
- Avoid `any` type
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow component composition patterns

### Styling
- Use Tailwind CSS utility classes
- Create reusable component variants
- Maintain consistent spacing and typography
- Ensure accessibility (focus states, contrast)

## 🚀 Deployment

### Preview Deployments
- Automatic preview deployments on PRs
- Test thoroughly before merging

### Production Deployment
- Only deploy from `main` branch
- Ensure all tests pass
- Monitor deployment for issues

## 📊 Task Management

### Task Tracker
- Update `task-tracker.json` when starting/completing tasks
- Mark tasks as "in-progress" when starting
- Mark tasks as "done" when completed and tested

### Progress Tracking
- Use GitHub Issues for task tracking
- Link PRs to issues
- Update task status regularly

## 🎂 Birthday Surprise Guidelines

### Emotional Impact
- Every feature should contribute to the surprise
- Focus on user experience and delight
- Test with real users when possible
- Maintain the element of surprise

### Content Guidelines
- Keep girlfriend's name configurable
- Ensure birthday date is easily changeable
- Make messages family-friendly
- Respect privacy and data protection

## 🆘 Getting Help

### Resources
- Check existing documentation
- Use MCP tools for latest information
- Review similar implementations in codebase
- Ask questions in GitHub issues

### Common Issues
- Environment variable configuration
- MCP tools setup
- Database connection issues
- Deployment problems

## 📋 Checklist for Contributors

Before submitting a PR:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] MCP tools used appropriately
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Mobile responsiveness tested
- [ ] Task tracker updated

---

**Remember**: This is a special birthday surprise project. Every contribution should add to the magic and joy of the final experience! 🎂✨
