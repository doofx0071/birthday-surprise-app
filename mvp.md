# MVP Development Plan
## Birthday Surprise Web Application

## 🎯 MVP Strategy: 3-Phase Approach

### **Phase 1: Core MVP (Week 1-2)**
*Goal: Get the essential surprise working perfectly*

#### ✅ **Must-Have Features:**
1. **Beautiful Countdown Timer**
   - Large, prominent display (Days, Hours, Minutes, Seconds)
   - White/pink/black theme
   - Responsive design
   - Real-time updates

2. **Basic Message Submission**
   - Simple form with text input (max 500 chars)
   - Name and email collection
   - Basic validation
   - Thank you confirmation

3. **Landing Page**
   - Hero section with countdown
   - Call-to-action for message submission
   - Mobile-responsive layout
   - Basic animations

4. **Email Collection System**
   - Store contributor emails
   - Basic database setup
   - Form validation

#### 🛠 **Technical Implementation:**
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Supabase (database + auth)
- **Deployment**: Vercel
- **Styling**: Custom white/pink/black theme

#### 📋 **Week 1-2 Tasks:**
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS with custom color palette
- [ ] Create countdown timer component
- [ ] Build message submission form
- [ ] Set up Supabase database
- [ ] Deploy to Vercel
- [ ] Test on mobile devices

---

### **Phase 2: Enhanced Experience (Week 3-4)**
*Goal: Add the wow-factor features*

#### ✅ **Enhanced Features:**
1. **File Upload System**
   - Image uploads (JPG, PNG, WebP)
   - Video uploads (MP4, WebM)
   - Drag-and-drop interface
   - File size validation
   - Preview functionality

2. **Interactive Memory Map**
   - World map with custom markers
   - Location detection/input
   - Clickable pins showing messages
   - Beautiful popup cards
   - Mobile-optimized interactions

3. **Memory Gallery**
   - Grid layout for all submissions
   - Filter by type (text, photo, video)
   - Smooth animations
   - Video playback

4. **Email Notification System**
   - Automated birthday emails
   - Beautiful email templates
   - Scheduled sending at midnight
   - Personalized content

#### 🛠 **Technical Implementation:**
- **File Storage**: Supabase Storage + Cloudinary
- **Maps**: Mapbox GL JS
- **Email**: Resend + React Email
- **Animations**: Framer Motion

#### 📋 **Week 3-4 Tasks:**
- [ ] Implement file upload with Supabase Storage
- [ ] Integrate Mapbox for interactive map
- [ ] Add location capture functionality
- [ ] Build memory gallery component
- [ ] Set up email service with templates
- [ ] Create automated email scheduling
- [ ] Add advanced animations

---

### **Phase 3: Polish & Launch (Week 5-6)**
*Goal: Perfect everything for the big day*

#### ✅ **Final Features:**
1. **Admin Dashboard**
   - View all submissions
   - Monitor email delivery
   - User analytics
   - Content moderation

2. **Advanced Polish**
   - Micro-interactions
   - Loading states
   - Error handling
   - Performance optimization

3. **Email Templates**
   - Birthday notification design
   - Reminder emails
   - Thank you confirmations

4. **Testing & Optimization**
   - Cross-browser testing
   - Performance optimization
   - Mobile testing
   - Email delivery testing

#### 📋 **Week 5-6 Tasks:**
- [ ] Build admin dashboard
- [ ] Design beautiful email templates
- [ ] Comprehensive testing across devices
- [ ] Performance optimization
- [ ] Final deployment
- [ ] Share URL with family and friends

---

## 🚀 **Recommended Tech Stack**

### **Frontend:**
```javascript
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Mapbox GL JS
```

### **Backend & Services:**
```javascript
- Supabase (Database + Auth + Storage)
- Resend (Email service)
- React Email (Email templates)
- Cloudinary (Image optimization)
```

### **Development Tools & MCP:**
```javascript
- Context7 MCP (Latest documentation access)
- Playwright MCP (Browser testing & automation)
- Supabase MCP (Database operations)
- Sequential Thinking MCP (Complex problem solving)
- GitHub API (Repository management)
```

### **Version Control & Workflow:**
```javascript
- GitHub (Repository hosting)
- Git Flow (Branching strategy)
- GitHub Issues (Task tracking)
- Pull Requests (Code review)
- GitHub Actions (CI/CD)
```

### **Deployment:**
```javascript
- Vercel (Frontend hosting)
- Supabase (Backend infrastructure)
- Custom domain (optional)
```

---

## 📱 **MVP User Journey**

### **For Contributors (Family/Friends):**
1. **Receive URL** → Visit the birthday surprise site
2. **See Countdown** → Feel excitement building up
3. **Submit Message** → Fill form with text, photos, videos
4. **Share Location** → Allow location for memory map
5. **Get Confirmation** → Receive thank you message
6. **Receive Reminder** → Email notification on birthday

### **For Your Girlfriend:**
1. **Visit Site** → See beautiful countdown timer
2. **Anticipation Builds** → Watch countdown decrease daily
3. **Birthday Arrives** → Countdown reaches zero with celebration
4. **Receive Notification** → Email with link to view messages
5. **Explore Messages** → Browse memory gallery and map
6. **Feel Loved** → See all the love from around the world

---

## 🔧 **Development Workflow & Best Practices**

### **GitHub Repository Setup**
1. **Initialize Repository**
   ```bash
   git init
   git remote add origin https://github.com/username/birthday-surprise-app
   ```

2. **Branch Strategy (GitFlow)**
   - `main` - Production ready code
   - `develop` - Integration branch
   - `feature/*` - Feature development
   - `hotfix/*` - Emergency fixes

3. **Issue Templates**
   - Bug Report Template
   - Feature Request Template
   - User Story Template

### **MCP Tools Usage Rules**

#### **🔍 Always Use Context7 MCP For:**
- Getting latest Next.js documentation
- Supabase API references
- Tailwind CSS class references
- React Hook Form usage
- Framer Motion animations
- Mapbox GL JS integration
- Any library/framework documentation

#### **🧪 Always Use Playwright MCP For:**
- End-to-end testing
- Form submission testing
- File upload testing
- Email functionality testing
- Mobile responsiveness testing
- Cross-browser compatibility

#### **🗄️ Always Use Supabase MCP For:**
- Database schema creation
- Table operations
- Authentication setup
- File storage configuration
- Real-time subscriptions
- Edge functions deployment

#### **🧠 Always Use Sequential Thinking MCP For:**
- Complex feature planning
- Debugging difficult issues
- Architecture decisions
- Performance optimization strategies
- User experience improvements

### **Development Workflow**

#### **Before Starting Any Feature:**
1. **Create GitHub Issue**
   ```markdown
   Title: [Feature] Add countdown timer component
   Labels: enhancement, frontend
   Assignee: @yourself
   ```

2. **Use Context7 MCP**
   ```bash
   # Always get latest docs before coding
   Context7: "Next.js 14 countdown timer with TypeScript"
   Context7: "Tailwind CSS animations and transitions"
   ```

3. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/countdown-timer
   ```

#### **During Development:**
1. **Regular Commits**
   ```bash
   git add .
   git commit -m "feat: add countdown timer component with animations"
   ```

2. **Use MCP Tools Continuously**
   - Context7 for documentation
   - Supabase MCP for database operations
   - Sequential Thinking for complex problems

3. **Test with Playwright**
   ```bash
   # Use Playwright MCP for testing
   Playwright: "Test countdown timer updates correctly"
   ```

#### **Before Pull Request:**
1. **Run All Tests**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

2. **Create Pull Request**
   ```markdown
   Title: feat: Add countdown timer component
   Description:
   - Implements real-time countdown
   - Responsive design
   - Smooth animations

   Closes #123
   ```

3. **Request Review**
   - Self-review code
   - Check all acceptance criteria
   - Verify tests pass

## ⚡ **Quick Start Development Order**

### **Day 1: Project Setup & GitHub**
1. **Repository Setup**
   ```bash
   # Create GitHub repository
   # Clone locally
   # Set up branch protection rules
   ```

2. **Initial Project Structure**
   ```bash
   # Use Context7 MCP for Next.js 14 setup
   npx create-next-app@latest birthday-surprise --typescript --tailwind --app
   ```

3. **GitHub Issues Creation**
   - Create issues for all MVP features
   - Set up project board
   - Define milestones

### **Day 2-3: Foundation**
1. **Environment Setup**
   ```bash
   # Use Supabase MCP for setup
   # Configure environment variables
   # Set up database schema
   ```

2. **Basic Layout**
   ```bash
   # Use Context7 MCP for Tailwind CSS
   # Create responsive layout
   # Implement color scheme
   ```

### **Day 4-7: Core Features**
1. **Countdown Timer**
   ```bash
   # Use Context7 MCP for date-fns or similar
   # Implement real-time updates
   # Add animations with Framer Motion
   ```

2. **Message Form**
   ```bash
   # Use Context7 MCP for React Hook Form
   # Use Supabase MCP for database operations
   # Test with Playwright MCP
   ```

### **Day 8-14: Enhanced Features**
1. **File Upload System**
   ```bash
   # Use Supabase MCP for storage setup
   # Use Context7 MCP for file handling
   # Test upload functionality
   ```

2. **Memory Map Integration**
   ```bash
   # Use Context7 MCP for Mapbox documentation
   # Implement location detection
   # Create interactive pins
   ```

### **Day 15-21: Polish & Deploy**
1. **Email System**
   ```bash
   # Use Context7 MCP for Resend documentation
   # Create email templates
   # Set up scheduling
   ```

2. **Final Testing**
   ```bash
   # Use Playwright MCP for comprehensive testing
   # Cross-browser testing
   # Mobile responsiveness
   ```

---

## 🎨 **Design System Preview**

### **Colors:**
- Primary: `#FFFFFF` (Pure White)
- Accent: `#FFB6C1` (Light Pink)
- Secondary: `#E8B4B8` (Rose Gold)
- Text: `#2D2D2D` (Charcoal)
- Background: `#F8F9FA` (Light Gray)

### **Typography:**
- Headings: Elegant serif font
- Body: Clean sans-serif
- Countdown: Bold, large display font

### **Components:**
- Floating hearts animation
- Smooth hover effects
- Card-based layouts
- Gradient backgrounds

## 📦 **Dependencies Installation Guide**

### **Core Dependencies**
```bash
# Frontend Framework & TypeScript
npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom

# Styling & Animations
npm install tailwindcss@latest postcss autoprefixer framer-motion

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Date & Time
npm install date-fns

# Maps
npm install mapbox-gl @types/mapbox-gl

# Email Templates
npm install react-email @react-email/components

# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# File Upload & Media
npm install react-dropzone

# Development Tools
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin
```

### **Testing Dependencies**
```bash
# Playwright for E2E Testing
npm install -D @playwright/test

# Jest for Unit Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### **MCP Tools Setup**

#### **Context7 MCP Configuration**
```json
{
  "mcpServers": {
    "context7": {
      "command": "context7-mcp",
      "args": ["--api-key", "your-api-key"]
    }
  }
}
```

#### **Supabase MCP Configuration**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "supabase-mcp",
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

#### **Playwright MCP Configuration**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "playwright-mcp",
      "args": ["--headless", "false"]
    }
  }
}
```

### **Environment Variables Setup**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

RESEND_API_KEY=your-resend-api-key

# Birthday Configuration
NEXT_PUBLIC_BIRTHDAY_DATE=2024-12-25T00:00:00Z
NEXT_PUBLIC_GIRLFRIEND_NAME=YourGirlfriendName
```

### **GitHub Repository Configuration**

#### **Branch Protection Rules**
```yaml
# .github/branch-protection.yml
protection_rules:
  main:
    required_status_checks:
      - "build"
      - "test"
      - "lint"
    enforce_admins: false
    required_pull_request_reviews:
      required_approving_review_count: 1
    restrictions: null
```

#### **Issue Templates**
```markdown
# .github/ISSUE_TEMPLATE/feature_request.md
---
name: Feature Request
about: Suggest a new feature for the birthday surprise app
title: '[Feature] '
labels: enhancement
assignees: ''
---

## Feature Description
Brief description of the feature

## User Story
As a [user type], I want [functionality] so that [benefit]

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## MCP Tools Needed
- [ ] Context7 for documentation
- [ ] Supabase MCP for database
- [ ] Playwright for testing
```

#### **Pull Request Template**
```markdown
# .github/pull_request_template.md
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## MCP Tools Used
- [ ] Context7 for documentation
- [ ] Supabase MCP for database operations
- [ ] Playwright for testing
- [ ] Sequential Thinking for complex logic

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### **Automated Workflows**

#### **GitHub Actions CI/CD**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

This comprehensive setup ensures you're using all MCP tools effectively while following GitHub best practices for a professional development workflow! 🚀

This MVP approach ensures you have a working surprise ready quickly, then enhances it with amazing features that will make her birthday unforgettable! 🎉
