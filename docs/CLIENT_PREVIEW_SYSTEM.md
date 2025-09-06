# 🎭 Client Preview System Documentation

## Overview

The Client Preview System provides administrators with a comprehensive view of what visitors experience on the public website, both in the current state and after the countdown ends. This system enables real-time preview, simulation, and content management based on countdown status.

## 🎯 Features Implemented

### 1. **Admin Client Preview Route** (`/admin/client-preview`)
- **Live Preview**: Shows exactly what the public website looks like right now
- **Post-Countdown Simulation**: Previews what visitors will see after September 8, 2025
- **Toggle Interface**: Easy switching between current and simulated views
- **Fullscreen Mode**: Immersive preview experience
- **Real-time Updates**: Reflects current countdown status and message approval changes

### 2. **Countdown-Based Content Revelation**
- **Before Countdown Ends**:
  - ✅ Countdown timer prominently displayed
  - ✅ Message submission form available
  - ❌ Memory Gallery hidden with "coming soon" message
  - ❌ Memory Map hidden with "coming soon" message
  - 📝 Informative messages about content revelation

- **After Countdown Ends** (September 8, 2025 at midnight Philippine time):
  - 🎉 Countdown shows celebration message
  - ✅ Message submission form still available
  - ✅ Memory Gallery revealed with approved messages only
  - ✅ Memory Map revealed with approved message locations only
  - ✨ Celebratory animations and effects

### 3. **Message Approval Integration**
- **Approved Messages Only**: Gallery and Map show only `is_approved = true` messages
- **Real-time Updates**: Changes in approval status immediately reflect in preview
- **Statistics Dashboard**: Shows approved vs pending vs rejected message counts
- **Content Visibility**: Clear indication of what content will be visible to public

### 4. **Admin Preview Features**
- **Statistics Panel**: Real-time data on message approval status
- **Preview Controls**: Toggle between current and post-countdown views
- **Countdown Status**: Live countdown display with exact time remaining
- **Content Indicators**: Visual feedback on what content is currently visible
- **Fullscreen Preview**: Distraction-free preview experience

## 🏗️ Technical Architecture

### Core Components

#### 1. **Countdown Status Hook** (`src/hooks/useCountdownStatus.ts`)
```typescript
// Main hook for countdown status
useCountdownStatus(options?: UseCountdownStatusOptions): CountdownStatus

// Content revelation hook
useContentReveal(simulateComplete?: boolean): {
  shouldRevealContent: boolean
  isLoading: boolean
  countdownStatus: CountdownStatus
}

// Admin preview hook
useAdminPreview(): {
  current: { status, shouldRevealContent }
  simulated: { status, shouldRevealContent }
  isLoading: boolean
}
```

#### 2. **Content Reveal Wrapper** (`src/components/reveal/ContentRevealWrapper.tsx`)
- Conditionally shows/hides content based on countdown status
- Displays beautiful "coming soon" messages when content is hidden
- Supports force reveal for admin preview
- Customizable messages for different content types

#### 3. **Admin Preview Components**
- **ClientPreviewFrame**: Full website preview with simulation support
- **PreviewControls**: Toggle controls and countdown status display
- **PreviewStats**: Real-time statistics about message approval

### API Endpoints

#### Message Statistics (`/api/admin/messages/stats`)
```typescript
GET /api/admin/messages/stats
Response: {
  total: number
  approved: number
  pending: number
  rejected: number
  withMedia: number
  countries: number
}
```

### Database Integration

#### Message Filtering
- **Gallery**: Only shows `is_approved = true AND is_visible = true` messages
- **Map**: Only shows approved messages with valid coordinates
- **Real-time**: Uses Supabase real-time subscriptions for live updates

## 🎨 User Experience

### Public Website Behavior

#### Current State (Before Countdown)
1. **Countdown Timer**: Prominently displayed with time remaining
2. **Message Form**: Fully functional for new submissions
3. **Gallery Section**: Hidden with beautiful "coming soon" message
4. **Map Section**: Hidden with informative preview message
5. **Navigation**: All sections accessible but content conditionally shown

#### Post-Countdown State (After September 8, 2025)
1. **Countdown Display**: Shows "Birthday has arrived!" celebration
2. **Message Form**: Still available for continued submissions
3. **Gallery Section**: Fully revealed with all approved messages
4. **Map Section**: Interactive map with all approved message locations
5. **Celebratory Effects**: Enhanced animations and visual effects

### Admin Preview Experience

#### Current Client View
- Shows exactly what visitors see right now
- Real-time countdown updates
- Hidden content sections with "coming soon" messages
- Live statistics on content that will be revealed

#### Post-Countdown View
- Simulates the birthday day experience
- Shows all approved content as it will appear
- Celebration mode countdown display
- Full gallery and map functionality

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_BIRTHDAY_DATE=2025-09-08T00:00:00+08:00
NEXT_PUBLIC_GIRLFRIEND_NAME="Gracela Elmera C. Betarmos"
NEXT_PUBLIC_TIMEZONE=Asia/Manila
```

### Countdown Logic
- **Birthday Date**: September 8, 2025 at midnight Philippine time
- **Timezone**: Asia/Manila (UTC+8)
- **Trigger**: Automatic content revelation when countdown reaches zero
- **Fallback**: Manual simulation mode for testing

## 🚀 Deployment Considerations

### Performance Optimizations
- **Lazy Loading**: Content components only load when revealed
- **Caching**: Countdown status cached with appropriate TTL
- **Real-time Updates**: Efficient WebSocket connections for live data
- **Image Optimization**: Progressive loading for gallery content

### Security Features
- **Admin Authentication**: Required for preview access
- **Content Filtering**: Only approved messages visible to public
- **Rate Limiting**: API endpoints protected against abuse
- **CSRF Protection**: Form submissions secured

### Monitoring & Analytics
- **Countdown Tracking**: Monitor countdown completion events
- **Content Revelation**: Track when content becomes visible
- **User Engagement**: Analytics on gallery and map interactions
- **Performance Metrics**: Load times and user experience data

## 📱 Responsive Design

### Mobile Experience
- **Touch-Friendly**: All preview controls optimized for mobile
- **Responsive Layout**: Adapts to all screen sizes
- **Performance**: Optimized for mobile networks
- **Accessibility**: Full keyboard and screen reader support

### Cross-Browser Compatibility
- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Fallbacks**: Graceful degradation for older browsers
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🔮 Future Enhancements

### Planned Features
- **Email Preview**: Preview birthday notification emails
- **Analytics Dashboard**: Detailed engagement metrics
- **A/B Testing**: Test different countdown messages
- **Social Sharing**: Preview social media sharing cards
- **Performance Monitoring**: Real-time performance metrics

### Extensibility
- **Plugin System**: Easy addition of new preview modes
- **Custom Themes**: Preview with different visual themes
- **Multi-language**: Preview in different languages
- **Time Zone Testing**: Test countdown in different time zones

## 📞 Support & Maintenance

### Troubleshooting
- **Countdown Issues**: Check timezone configuration
- **Content Not Revealing**: Verify approval status in database
- **Preview Errors**: Check admin authentication and permissions
- **Performance Issues**: Monitor API response times and database queries

### Maintenance Tasks
- **Regular Testing**: Verify countdown accuracy
- **Content Auditing**: Review approved message quality
- **Performance Monitoring**: Track system performance metrics
- **Security Updates**: Keep dependencies and security measures current
