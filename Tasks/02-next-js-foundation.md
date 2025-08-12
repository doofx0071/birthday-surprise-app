# Task 02: Next.js Foundation Setup

## 📋 Task Information
- **ID**: 02
- **Title**: Next.js Foundation Setup
- **Priority**: High
- **Status**: pending
- **Dependencies**: [01]
- **Estimated Time**: 6 hours

## 📝 Description
Initialize Next.js 14 project with TypeScript, configure Tailwind CSS, set up project structure, and install core dependencies for the birthday surprise application.

## 🔍 Details

### Next.js Project Initialization
1. **Create Next.js Application**
   ```bash
   npx create-next-app@latest birthday-surprise --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```

2. **Project Structure Setup**
   ```
   src/
   ├── app/
   │   ├── globals.css
   │   ├── layout.tsx
   │   ├── page.tsx
   │   └── loading.tsx
   ├── components/
   │   ├── ui/
   │   ├── countdown/
   │   ├── forms/
   │   └── layout/
   ├── lib/
   │   ├── utils.ts
   │   ├── supabase.ts
   │   └── validations.ts
   ├── hooks/
   ├── types/
   └── styles/
   ```

### Core Dependencies Installation
1. **Frontend Framework & TypeScript**
   ```bash
   npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom
   ```

2. **Styling & Animations**
   ```bash
   npm install tailwindcss@latest postcss autoprefixer framer-motion
   npm install @tailwindcss/forms @tailwindcss/typography
   ```

3. **Forms & Validation**
   ```bash
   npm install react-hook-form @hookform/resolvers zod
   ```

4. **Date & Time Utilities**
   ```bash
   npm install date-fns
   ```

5. **Development Tools**
   ```bash
   npm install -D eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin
   npm install -D @types/node
   ```

### Tailwind CSS Configuration
1. **Custom Color Palette**
   - Primary White: #FFFFFF
   - Soft Pink: #FFB6C1
   - Rose Gold: #E8B4B8
   - Charcoal Black: #2D2D2D
   - Light Gray: #F8F9FA

2. **Custom Animations**
   - Floating hearts
   - Countdown pulse
   - Smooth transitions

### TypeScript Configuration
1. **Strict Type Checking**
2. **Path Aliases**
3. **Import Organization**

### ESLint & Prettier Setup
1. **Code Quality Rules**
2. **Formatting Standards**
3. **Import Sorting**

## 🧪 Test Strategy

### Installation Verification
- [ ] Next.js application starts successfully
- [ ] TypeScript compilation works
- [ ] Tailwind CSS classes apply correctly
- [ ] All dependencies install without errors

### Development Environment Testing
- [ ] Hot reload works properly
- [ ] ESLint catches errors
- [ ] Prettier formats code correctly
- [ ] Build process completes successfully

### Project Structure Validation
- [ ] All directories created correctly
- [ ] Import aliases work
- [ ] TypeScript paths resolve
- [ ] Component structure logical

## 🔧 MCP Tools Required

### Context7
- Next.js 14 App Router documentation
- TypeScript configuration best practices
- Tailwind CSS setup and customization
- React Hook Form integration
- Framer Motion animation guides

### Supabase MCP
- Next.js integration preparation
- TypeScript types setup

### Playwright MCP
- Basic page load testing
- Component rendering verification

### Sequential Thinking
- Project structure optimization
- Dependency management decisions
- Configuration best practices

## ✅ Acceptance Criteria

### Next.js Setup
- [ ] Next.js 14 application created with App Router
- [ ] TypeScript configured with strict mode
- [ ] Application starts on localhost:3000
- [ ] Hot reload functional

### Dependencies
- [ ] All core dependencies installed
- [ ] Package.json scripts configured
- [ ] No dependency conflicts
- [ ] Lock file committed

### Tailwind CSS
- [ ] Custom color palette configured
- [ ] Responsive design utilities available
- [ ] Custom animations defined
- [ ] Forms and typography plugins active

### Code Quality
- [ ] ESLint configuration working
- [ ] Prettier formatting applied
- [ ] TypeScript strict mode enabled
- [ ] Import aliases functional

### Project Structure
- [ ] Logical folder organization
- [ ] Component directories created
- [ ] Utility functions structure
- [ ] Types directory established

## 🔗 GitHub Integration
- **Issue**: Create issue for Next.js foundation setup
- **Branch**: `feature/task-02-nextjs-foundation`
- **PR**: Create PR with foundation implementation

## 📁 Files to Create/Modify
- `package.json`
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `.eslintrc.json`
- `.prettierrc`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/lib/utils.ts`
- `src/types/index.ts`

## 🎯 Success Metrics
- Application builds and runs without errors
- All dependencies properly installed
- TypeScript compilation successful
- Tailwind CSS custom theme working
- Development environment optimized

---

**Next Task**: 03-design-system.md  
**Previous Task**: 01-project-setup.md  
**Estimated Total Time**: 6 hours  
**Complexity**: Medium
