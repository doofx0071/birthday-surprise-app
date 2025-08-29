# Assets Folder Structure

This folder contains all static assets for the Birthday Surprise application.

## 📁 Folder Organization

### `/images/`
Store all image files (JPG, PNG, WebP, GIF)

- **`/backgrounds/`** - Background images, patterns, textures
- **`/ui/`** - UI-related images, decorative elements, placeholders

### `/icons/`
Store all icon files

- **`/svg/`** - SVG icon files (recommended for scalability)

### `/logos/`
Store all logo variations and brand assets

### `/illustrations/`
Store custom illustrations, graphics, and artwork

## 🎯 Usage in Code

### Next.js Image Component (Recommended)
```jsx
import Image from 'next/image'

// For images
<Image 
  src="/assets/images/backgrounds/hero-bg.jpg" 
  alt="Hero background"
  width={1200}
  height={600}
/>

// For logos
<Image 
  src="/assets/logos/birthday-logo.png" 
  alt="Birthday Surprise Logo"
  width={200}
  height={50}
/>
```

### Direct Path Usage
```jsx
// For SVG icons
<img src="/assets/icons/svg/heart.svg" alt="Heart icon" />

// For illustrations
<img src="/assets/illustrations/birthday-cake.png" alt="Birthday cake" />
```

### CSS Background Images
```css
.hero-section {
  background-image: url('/assets/images/backgrounds/confetti-bg.png');
}
```

## 📝 File Naming Conventions

- Use **kebab-case** for file names: `birthday-cake.png`
- Be descriptive: `admin-dashboard-icon.svg`
- Include size if multiple versions: `logo-small.png`, `logo-large.png`
- Use appropriate extensions: `.svg` for icons, `.png` for images with transparency, `.jpg` for photos

## 🎨 Recommended File Types

- **Icons**: SVG (scalable, small file size)
- **Logos**: SVG or PNG with transparency
- **Photos**: JPG (smaller file size)
- **Graphics with transparency**: PNG
- **Simple animations**: GIF or SVG

## 📏 Image Optimization Tips

1. **Compress images** before adding them
2. **Use appropriate dimensions** - don't use oversized images
3. **Consider WebP format** for better compression
4. **Use SVG for icons** whenever possible
5. **Optimize SVGs** by removing unnecessary code

## 🚀 Quick Start

1. Add your images to the appropriate subfolder
2. Reference them using the `/assets/` path
3. Use Next.js Image component for better performance
4. Follow the naming conventions above

Happy coding! 🎉
