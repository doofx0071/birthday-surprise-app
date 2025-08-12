# Task 09: Interactive Memory Map

## 📋 Task Information
- **ID**: 09
- **Title**: Interactive Memory Map with Location Pins
- **Priority**: High
- **Status**: pending
- **Dependencies**: [08]
- **Estimated Time**: 12 hours

## 📝 Description
Create an interactive world map using Mapbox GL JS that displays beautiful pins showing where birthday messages are coming from, with clickable pins that reveal message previews and contributor information.

## 🔍 Details

### Map Implementation
1. **Mapbox Integration**
   ```typescript
   import mapboxgl from 'mapbox-gl';
   
   const map = new mapboxgl.Map({
     container: 'map-container',
     style: 'mapbox://styles/mapbox/light-v11',
     center: [0, 20], // Centered on world
     zoom: 2,
     projection: 'globe'
   });
   ```

2. **Custom Map Styling**
   - Light, clean map style
   - Custom color scheme matching app theme
   - Subtle country borders
   - Ocean color: soft blue
   - Land color: light gray/white

### Pin System
1. **Custom Pin Design**
   ```
   Heart-shaped pins in pink/rose gold:
   
        ♥
       ♥♥♥
      ♥♥♥♥♥
       ♥♥♥
        ♥
   
   States:
   - Default: Soft pink (#FFB6C1)
   - Hover: Rose gold (#E8B4B8)
   - Active: Darker pink
   - Cluster: Multiple hearts
   ```

2. **Pin Clustering**
   - Group nearby pins when zoomed out
   - Show count in cluster
   - Smooth zoom to expand clusters
   - Maintain visual hierarchy

### Location Data Processing
1. **Coordinate Handling**
   ```typescript
   interface LocationPin {
     id: string;
     latitude: number;
     longitude: number;
     city: string;
     country: string;
     messageCount: number;
     contributors: Contributor[];
   }
   ```

2. **Geocoding Integration**
   - Convert city/country to coordinates
   - Handle location variations
   - Fallback for unknown locations
   - Cache geocoding results

### Interactive Features
1. **Pin Click Behavior**
   ```
   ┌─────────────────────────────────────┐
   │  📍 Messages from New York, USA     │
   │                                     │
   │  👤 Sarah Johnson                   │
   │  "Happy birthday! Can't wait to     │
   │   celebrate with you! 🎉"           │
   │                                     │
   │  👤 Mike Chen                       │
   │  "Hope your special day is amazing! │
   │   Love you lots! ❤️"                │
   │                                     │
   │  📊 2 messages from this location   │
   │  [View All Messages]                │
   └─────────────────────────────────────┘
   ```

2. **Popup Content**
   - Location name and flag
   - Message previews (first 100 chars)
   - Contributor names
   - Message count
   - "View all" link for multiple messages

### Map Controls
1. **Navigation Controls**
   - Zoom in/out buttons
   - Reset to world view
   - Fullscreen toggle
   - Mobile-friendly controls

2. **Filter Options**
   - Show/hide message types
   - Filter by date range
   - Search by location
   - Sort by message count

### Responsive Design
1. **Mobile Optimization**
   - Touch-friendly interactions
   - Optimized pin sizes
   - Simplified controls
   - Gesture support

2. **Desktop Features**
   - Hover effects
   - Keyboard navigation
   - Advanced controls
   - Larger popup content

### Animation System
1. **Pin Animations**
   - Gentle pulse effect
   - Smooth hover transitions
   - Stagger animation on load
   - Celebration effects

2. **Map Transitions**
   - Smooth zoom animations
   - Fly-to location effects
   - Cluster expand/collapse
   - Loading state animations

### Data Integration
1. **Real-time Updates**
   ```typescript
   useEffect(() => {
     const subscription = supabase
       .channel('messages')
       .on('postgres_changes', 
         { event: 'INSERT', schema: 'public', table: 'messages' },
         (payload) => {
           addNewPin(payload.new);
         }
       )
       .subscribe();
     
     return () => subscription.unsubscribe();
   }, []);
   ```

2. **Performance Optimization**
   - Lazy loading of pin data
   - Viewport-based loading
   - Efficient clustering
   - Memory management

## 🧪 Test Strategy

### Map Functionality
- [ ] Map loads correctly
- [ ] Pins display accurately
- [ ] Clustering works properly
- [ ] Interactions responsive

### Location Accuracy
- [ ] Coordinates correct
- [ ] Geocoding accurate
- [ ] Location names proper
- [ ] Country flags correct

### Interactive Features
- [ ] Pin clicks work
- [ ] Popups display correctly
- [ ] Navigation controls functional
- [ ] Mobile gestures work

### Performance Testing
- [ ] Large dataset handling
- [ ] Smooth animations
- [ ] Memory usage optimized
- [ ] Loading times acceptable

## 🔧 MCP Tools Required

### Context7
- Mapbox GL JS documentation
- React Mapbox integration
- Geolocation API usage
- Map styling techniques
- Performance optimization

### Supabase MCP
- Location data queries
- Real-time subscriptions
- Geospatial queries
- Data aggregation

### Playwright MCP
- Map interaction testing
- Pin click testing
- Mobile gesture testing
- Visual regression testing

### Sequential Thinking
- Map UX optimization
- Performance vs. features balance
- Data visualization decisions

## ✅ Acceptance Criteria

### Map Implementation
- [ ] Mapbox map renders correctly
- [ ] Custom styling applied
- [ ] Responsive design working
- [ ] Performance optimized

### Pin System
- [ ] Custom heart pins displayed
- [ ] Clustering functional
- [ ] Hover effects smooth
- [ ] Click interactions work

### Location Features
- [ ] Accurate pin placement
- [ ] Geocoding working
- [ ] Location names correct
- [ ] Country identification accurate

### Interactive Elements
- [ ] Popup content informative
- [ ] Navigation controls functional
- [ ] Filter options working
- [ ] Mobile optimization complete

### Real-time Updates
- [ ] New pins appear automatically
- [ ] Data synchronization working
- [ ] Performance maintained
- [ ] Error handling robust

## 🔗 GitHub Integration
- **Issue**: Create issue for memory map implementation
- **Branch**: `feature/task-09-memory-map`
- **PR**: Create PR with map functionality

## 📁 Files to Create/Modify
- `src/components/map/MemoryMap.tsx`
- `src/components/map/MapPin.tsx`
- `src/components/map/LocationPopup.tsx`
- `src/components/map/MapControls.tsx`
- `src/lib/mapbox.ts`
- `src/lib/geocoding.ts`
- `src/hooks/useMapData.ts`
- `src/types/map.ts`

## 🎯 Success Metrics
- Map loads in <3 seconds
- Smooth interactions on all devices
- Accurate location representation
- High user engagement with pins
- Positive emotional response to map

---

**Next Task**: 10-email-system.md  
**Previous Task**: 08-database-setup.md  
**Estimated Total Time**: 12 hours  
**Complexity**: High
