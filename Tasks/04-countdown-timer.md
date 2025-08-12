# Task 04: Countdown Timer Component

## 📋 Task Information
- **ID**: 04
- **Title**: Countdown Timer Component
- **Priority**: High
- **Status**: pending
- **Dependencies**: [03]
- **Estimated Time**: 8 hours

## 📝 Description
Create a beautiful, prominent countdown timer that displays days, hours, minutes, and seconds until the girlfriend's birthday, with elegant animations and responsive design using the established color palette.

## 🔍 Details

### Core Functionality
1. **Time Calculation**
   - Calculate time difference to target birthday
   - Handle timezone considerations
   - Account for leap years and month variations
   - Real-time updates every second

2. **Display Format**
   - Days: Large prominent display
   - Hours: 24-hour format
   - Minutes: 60-minute format
   - Seconds: 60-second format with smooth transitions

3. **Special States**
   - Birthday reached (00:00:00:00)
   - Celebration animation when countdown ends
   - Past birthday handling
   - Loading state while calculating

### Visual Design
1. **Layout Structure**
   ```
   ┌─────────────────────────────────────┐
   │           COUNTDOWN TO              │
   │        [Girlfriend's Name]          │
   │           BIRTHDAY                  │
   │                                     │
   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
   │  │ 045 │ │ 12  │ │ 34  │ │ 56  │   │
   │  │DAYS │ │HOURS│ │MINS │ │SECS │   │
   │  └─────┘ └─────┘ └─────┘ └─────┘   │
   │                                     │
   │        ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥             │
   └─────────────────────────────────────┘
   ```

2. **Color Scheme**
   - Background: Pure white with subtle pink gradient
   - Numbers: Charcoal black for readability
   - Labels: Rose gold for elegance
   - Accents: Soft pink for hearts and borders
   - Cards: White with rose gold borders

3. **Typography**
   - Numbers: Large, bold display font (Poppins)
   - Labels: Elegant serif (Playfair Display)
   - Title: Beautiful script or serif font

### Animations and Effects
1. **Number Transitions**
   - Smooth flip animation when numbers change
   - Stagger effect for different time units
   - Bounce effect on significant changes

2. **Background Effects**
   - Floating hearts animation
   - Subtle sparkle effects
   - Gradient color shifts

3. **Special Celebrations**
   - Confetti explosion when countdown reaches zero
   - Heart burst animation
   - Color celebration effects

### Responsive Design
1. **Mobile (320px - 768px)**
   - Stacked layout for time units
   - Smaller font sizes
   - Touch-friendly spacing

2. **Tablet (768px - 1024px)**
   - 2x2 grid layout
   - Medium font sizes
   - Balanced spacing

3. **Desktop (1024px+)**
   - Horizontal layout
   - Large, prominent display
   - Maximum visual impact

### Technical Implementation
1. **React Component Structure**
   ```typescript
   interface CountdownTimerProps {
     targetDate: Date;
     girlfriendName: string;
     onCountdownEnd?: () => void;
   }
   ```

2. **Custom Hooks**
   - `useCountdown`: Main countdown logic
   - `useInterval`: Reliable interval management
   - `useAnimation`: Animation state management

3. **Performance Optimization**
   - Memoized calculations
   - Efficient re-rendering
   - Cleanup on unmount

## 🧪 Test Strategy

### Functionality Testing
- [ ] Accurate time calculations
- [ ] Real-time updates every second
- [ ] Timezone handling correct
- [ ] Birthday reached state works

### Visual Testing
- [ ] Responsive design on all devices
- [ ] Animations smooth and performant
- [ ] Color palette correctly applied
- [ ] Typography scales properly

### Edge Case Testing
- [ ] Past birthday handling
- [ ] Leap year calculations
- [ ] Browser tab inactive behavior
- [ ] Network connectivity issues

### Performance Testing
- [ ] No memory leaks
- [ ] Smooth 60fps animations
- [ ] Efficient re-rendering
- [ ] Battery usage optimized

## 🔧 MCP Tools Required

### Context7
- React hooks best practices
- date-fns library documentation
- Framer Motion animation patterns
- Responsive design techniques
- Performance optimization strategies

### Playwright MCP
- Component interaction testing
- Visual regression testing
- Cross-browser compatibility
- Mobile device testing

### Sequential Thinking
- Animation timing optimization
- Performance vs. visual appeal balance
- User experience flow decisions

## ✅ Acceptance Criteria

### Core Functionality
- [ ] Countdown calculates time accurately
- [ ] Updates every second without lag
- [ ] Handles timezone correctly
- [ ] Shows correct time until birthday

### Visual Design
- [ ] Matches design system colors
- [ ] Typography hierarchy clear
- [ ] Responsive on all screen sizes
- [ ] Animations enhance experience

### User Experience
- [ ] Loading state while calculating
- [ ] Smooth number transitions
- [ ] Celebration when countdown ends
- [ ] Accessible to screen readers

### Performance
- [ ] No memory leaks detected
- [ ] Smooth animations at 60fps
- [ ] Efficient re-rendering
- [ ] Works in background tabs

### Code Quality
- [ ] TypeScript types complete
- [ ] Component well-documented
- [ ] Reusable and configurable
- [ ] Error handling implemented

## 🔗 GitHub Integration
- **Issue**: Create issue for countdown timer component
- **Branch**: `feature/task-04-countdown-timer`
- **PR**: Create PR with countdown implementation

## 📁 Files to Create/Modify
- `src/components/countdown/CountdownTimer.tsx`
- `src/components/countdown/TimeUnit.tsx`
- `src/components/countdown/FloatingHearts.tsx`
- `src/hooks/useCountdown.ts`
- `src/hooks/useInterval.ts`
- `src/lib/dateUtils.ts`
- `src/types/countdown.ts`
- `src/app/page.tsx` (integrate countdown)

## 🎯 Success Metrics
- Countdown displays accurate time remaining
- Animations smooth and delightful
- Responsive design works perfectly
- Performance optimized for all devices
- User testing shows positive emotional response

---

**Next Task**: 05-basic-layout.md  
**Previous Task**: 03-design-system.md  
**Estimated Total Time**: 8 hours  
**Complexity**: High
