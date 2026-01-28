# Fluid Clamp Generator

> A Chrome extension for generating CSS `clamp()` values with intelligent mobile-to-desktop scaling

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Why This Extension?

Creating fluid, responsive designs with CSS `clamp()` is powerful but mathematically complex. This extension solves three critical problems:

1. **Automatic Mobile Scaling** - Enter your desktop size, get the perfect mobile size calculated automatically based on property type
2. **Smart Presets** - Different scaling ratios for text vs spacing (padding/margin) that follow design best practices
3. **Instant CSS Output** - Get production-ready `clamp()` values with one click

### The Problem It Solves

Manual `clamp()` calculation requires:
- Viewport width ranges (mobile to desktop)
- Minimum and maximum values
- Complex linear interpolation math: `slope = (max - min) / (maxVW - minVW)`
- Calculating the y-intercept for the formula

**This extension does all of it instantly.**

## ✨ Features

- **🧮 Intelligent Scaling** - Automatically calculates mobile sizes from desktop values
- **📐 Property-Specific Presets** - Optimized scaling for text and spacing
- **⚙️ Advanced Configuration** - Customize scaling ratios and viewport breakpoints
- **🎨 Beautiful UI** - Clean, modern interface with smooth interactions
- **💾 Persistent Settings** - All configurations saved across sessions
- **🖱️ Mouse Wheel Support** - Quickly adjust values with scroll
- **📋 One-Click Copy** - Click the output to copy to clipboard

## 🚀 Installation

### From Chrome Web Store (Recommended)
*Coming soon*

### Manual Installation
1. Download or clone this repository
   ```bash
   git clone https://github.com/yourusername/fluid-clamp-generator.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the extension directory
6. Pin the extension to your toolbar for easy access

## 📖 How to Use

### Basic Usage

1. **Click the extension icon** in your Chrome toolbar
2. **Enter your desktop size** (e.g., `72` for 72px font size)
   - Mobile size is automatically calculated
3. **Select property type**:
   - **Text** - For font sizes (optimized text scaling)
   - **Spacing** - For padding, margins, gaps (optimized spacing scaling)
4. **Click the output** to copy the `clamp()` value
5. **Paste into your CSS** - Done! 🎉

### Example Output
```css
font-size: clamp(14px, -10.40px + 3.76vw, 72px);
```

This creates fluid typography that:
- Starts at 14px on 320px viewports (mobile)
- Scales smoothly up to 72px on 1440px viewports (desktop)
- Uses perfect linear interpolation in between

## ⚙️ Advanced Configuration

Click the **toggle switch** (top-right) to access advanced settings:

### Custom Scaling Ratios
Configure how aggressively sizes scale down on mobile:

| Setting | Description | Example |
|---------|-------------|---------|
| **Min Value** | Size on smallest viewport | `14px` |
| **Min VP** | Smallest viewport width | `16px` |
| **Max Value** | Size on largest viewport | `72px` |
| **Max VP** | Largest viewport width | `72px` |

### Custom Viewport Breakpoints
Set your project's mobile and desktop breakpoints:

| Setting | Default | Purpose |
|---------|---------|---------|
| **Min Width** | `320px` | Mobile viewport |
| **Max Width** | `1440px` | Desktop viewport |

**Pro Tip:** Clear all inputs to reset to defaults instantly.

## 🎨 Default Presets

The extension comes with carefully crafted defaults based on responsive design best practices:

### Text Scaling
```
Mobile (320px): 14-16px
Desktop (1440px): 54-72px
Ratio: ~60-70% reduction on mobile
```

### Spacing Scaling
```
Mobile (320px): 15-20px
Desktop (1440px): 55-100px
Ratio: ~70-80% reduction on mobile
```

These ratios ensure:
- ✅ Text remains readable on small screens
- ✅ Spacing doesn't collapse too much on mobile
- ✅ Smooth, natural scaling across all viewports

## 🧠 How It Works

### The Math Behind It

The extension uses linear interpolation to calculate fluid values:

```javascript
// 1. Calculate slope
slope = (maxPx - minPx) / (maxVW - minVW)

// 2. Calculate viewport-based value
vwValue = slope × 100

// 3. Calculate y-intercept
intercept = minPx - (slope × minVW)

// 4. Generate clamp
clamp(minPx, intercept + vwValue×vw, maxPx)
```

### Intelligent Mobile Sizing

When you enter a desktop size, the extension:

1. Identifies the property type (text or spacing)
2. Calculates appropriate mobile size using preset ratios
3. Applies the scaling algorithm
4. Generates the final `clamp()` value

This ensures your designs scale naturally without manual calculations.

## 🎯 Use Cases

### Typography
```css
h1 { font-size: clamp(32px, 1.60px + 4.82vw, 96px); }
h2 { font-size: clamp(24px, 0.80px + 3.68vw, 72px); }
p  { font-size: clamp(16px, 8.00px + 1.27vw, 32px); }
```

### Spacing
```css
section { padding: clamp(20px, -16.00px + 5.71vw, 100px); }
.container { gap: clamp(15px, -5.36px + 3.23vw, 60px); }
.card { margin: clamp(10px, -3.57px + 2.14vw, 40px); }
```

### Components
```css
.button {
  padding: clamp(12px, 3.20px + 1.39vw, 28px) 
           clamp(24px, 6.40px + 2.79vw, 56px);
  font-size: clamp(14px, 8.00px + 0.95vw, 24px);
}
```

## 🛠️ Technical Details

### Built With
- Vanilla JavaScript (no dependencies)
- Chrome Extension Manifest V3
- Chrome Storage API for persistence

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Any Chromium-based browser

### Permissions
- `storage` - To save your preferences

### File Structure
```
fluid-clamp-generator/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.css          # Styling
├── popup.js           # Core logic
├── icon.png          # Extension icon (128×128)
└── README.md         # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- [ ] Add more property type presets (border-radius, box-shadow blur, etc.)
- [ ] Export/import custom configurations
- [ ] Dark/light theme toggle
- [ ] Copy as SCSS/PostCSS/Tailwind format
- [ ] Visual preview of scaling
- [ ] History of generated clamps

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Tips & Tricks

### Quick Workflow
1. Keep the extension pinned to your toolbar
2. Use mouse wheel to quickly adjust values
3. Toggle advanced config only when needed
4. Reset to defaults by clearing all inputs

### Best Practices
- **Text:** Use aggressive scaling (default presets work great)
- **Spacing:** Be conservative - too little padding on mobile hurts UX
- **Testing:** Always test on real devices, not just DevTools
- **Accessibility:** Ensure minimum text size is at least 14-16px

### Common Pitfalls to Avoid
❌ Setting minimum text size below 14px (readability issues)
❌ Using same ratios for text and spacing (they need different scaling)
❌ Forgetting to test at breakpoint boundaries (320px, 1440px)
✅ Use the defaults first, customize only if needed

## 🐛 Known Issues

None currently. [Report an issue](https://github.com/yourusername/fluid-clamp-generator/issues)

## 📫 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/fluid-clamp-generator/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/yourusername/fluid-clamp-generator/discussions)

## 🙏 Acknowledgments

- Inspired by the need for better responsive design tooling
- Built with ❤️ for the web development community

---

**Made with 💙 by [Sakibur Rahman]**

⭐ Star this repo if it helps your workflow!
