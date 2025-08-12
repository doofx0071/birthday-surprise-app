# 🎂 Birthday Surprise Web Application

A beautiful, emotional birthday surprise web application that brings together family and friends to celebrate your special someone through a countdown timer, message collection system, and interactive memory map.

## ✨ Features

- 🕐 **Beautiful Countdown Timer** - Real-time countdown to the birthday with elegant animations
- 💌 **Message Collection** - Family and friends can submit heartfelt birthday messages
- 📸 **Media Upload** - Support for photos and videos to make memories last
- 🗺️ **Interactive Memory Map** - World map showing where all the love is coming from
- 📧 **Automated Emails** - Birthday notifications sent automatically at midnight
- 🎨 **Elegant Design** - White, pink, and black color scheme for a sophisticated look
- 📱 **Mobile Responsive** - Perfect experience on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Email**: Resend with React Email templates
- **Maps**: Mapbox GL JS
- **Testing**: Playwright, Jest
- **Deployment**: Vercel
- **Development**: MCP Tools (Context7, Playwright MCP, Supabase MCP, Sequential Thinking)

## 🎯 Project Status

**Current Phase**: Phase 1 - Foundation  
**Progress**: 1/15 tasks completed (6.7%)  
**Estimated Completion**: 119 hours total

### 📊 Task Progress
- ✅ **Task 01**: Project Setup and GitHub Repository (COMPLETED)
- ⏳ **Task 02**: Next.js Foundation Setup (NEXT)
- 📋 **Remaining**: 13 tasks across 3 phases

## 🔧 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/doofx0071/birthday-surprise-app.git
cd birthday-surprise-app

# Install dependencies (after Task 02 is completed)
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### Environment Variables
Copy `.env.local.example` to `.env.local` and configure:
- Birthday date and girlfriend's name
- Supabase credentials
- Mapbox access token
- Resend API key for emails

## 🔄 Development Workflow

### MCP Tools Integration
This project uses MCP (Model Context Protocol) tools for enhanced development:

- **Context7**: Latest documentation access
- **Playwright MCP**: Browser testing automation  
- **Supabase MCP**: Database operations
- **Sequential Thinking**: Complex problem solving

### GitHub Workflow
1. Create issue for each task
2. Create feature branch: `feature/task-{id}-{description}`
3. Use MCP tools during development
4. Create Pull Request with proper review
5. Merge after approval and testing

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Emergency fixes

## 📋 Task Management

Tasks are organized using TaskMaster methodology:

### Phase 1: Foundation (29 hours)
- [x] Project Setup and GitHub Repository
- [ ] Next.js Foundation Setup  
- [ ] Design System and Color Palette
- [ ] Countdown Timer Component
- [ ] Basic Layout and Navigation

### Phase 2: Core Features (52 hours)
- [ ] Message Submission Form
- [ ] File Upload System
- [ ] Supabase Database Setup
- [ ] Interactive Memory Map
- [ ] Automated Email System

### Phase 3: Enhancement (38 hours)
- [ ] Memory Gallery Display
- [ ] Admin Dashboard
- [ ] Testing Suite with Playwright
- [ ] Deployment and Optimization
- [ ] Final Polish and Launch

## 🎨 Design System

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

## 🧪 Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright MCP for user interactions
- **Visual Tests**: Playwright for responsive design
- **Accessibility**: WCAG 2.1 AA compliance

## 📚 Documentation

- [`/Tasks`](./Tasks) - Detailed task breakdown and management
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) - Development guidelines
- [`task-tracker.json`](./task-tracker.json) - Real-time task progress

## 🎂 The Vision

This isn't just a web application—it's a digital love letter that will bring tears of joy to your girlfriend's eyes. Every feature is designed to show how much thought, care, and love went into creating something special just for her.

When family and friends from around the world contribute their messages, photos, and videos, and she sees them all displayed on a beautiful interactive map with a countdown that has been building anticipation, it will be a birthday surprise she'll never forget.

## 🤝 Contributing

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on our development process and how to submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Made with Love

Created with love for an amazing birthday surprise. Every line of code is written with the intention of creating joy, connection, and unforgettable memories.

---

**Repository**: https://github.com/doofx0071/birthday-surprise-app  
**Last Updated**: January 12, 2025  
**Status**: In Development 🚧
