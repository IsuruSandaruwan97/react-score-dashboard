# Christmas Theme Configuration

This project includes a festive Christmas theme that can be enabled via environment variables.

## How to Enable

1. Set the environment variable in your `.env` or `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_THEME=xmas
   \`\`\`

2. Restart your development server or rebuild your production app.

## What Changes

When the Christmas theme is enabled (`NEXT_PUBLIC_THEME=xmas`), the following changes occur:

### Color Scheme
- **Primary**: Christmas Red (`#dc2626`)
- **Secondary**: Christmas Green (`#16a34a`)
- **Accent**: Gold (`#eab308`)
- Dark background with warm red undertones instead of purple/cyan

### Visual Elements
- Floating Christmas decorations (🎄, 🎁, ⛄, 🔔, ⭐, 🎅) on the sides of pages
- Christmas lights effect across the top navigation bar
- Gold shimmer effects on cards
- Festive glow effects with red, green, and gold colors
- Christmas emoji decorations in navigation and footer

### Animations
- `christmas-lights`: Rotating red/green/gold glow effect
- `gold-shimmer`: Sparkling gold shimmer animation
- `christmas-glow`: Pulsing festive glow with Christmas colors
- `festive-gradient`: Animated gradient with red, green, and gold
- `bell-swing`: Swinging animation for decorative elements
- `candy-cane-border`: Animated red and white stripe pattern

### Components Affected
- Navigation header (adds Christmas decorations and lights effect)
- Footer (adds festive glow and holiday message)
- All pages receive floating Christmas ornaments
- Cards and interactive elements use festive color schemes

## CSS Classes Available

### Christmas-Specific Classes
- `.christmas-lights` - Animated Christmas light effect
- `.christmas-glow` - Pulsing red/green/gold glow
- `.gold-shimmer` - Gold sparkle effect
- `.festive-gradient` - Animated red/green/gold gradient
- `.candy-cane-border` - Red and white animated stripes
- `.bell-swing` - Swinging animation
- `.holly-decoration` - Adds decorative holly emoji
- `.christmas-sparkle` - Animated sparkle effect

### Usage Example
\`\`\`tsx
<div className="christmas-lights">Content with lights effect</div>
<div className="christmas-glow hover-lift">Festive glowing card</div>
\`\`\`

## Disabling the Theme

To return to the default esports theme:
1. Remove or comment out the `NEXT_PUBLIC_THEME` variable
2. Or set it to any value other than `xmas`:
   \`\`\`
   NEXT_PUBLIC_THEME=
   \`\`\`
3. Restart your server

## Technical Details

- Theme detection is handled by `lib/theme-config.ts`
- Christmas decorations component: `components/christmas-decorations.tsx`
- CSS theme classes defined in `app/globals.css`
- Theme class is applied to the `<html>` element in `app/layout.tsx`
- Components check theme status using `isChristmasTheme()` helper function

## Performance

The Christmas theme adds:
- Minimal JavaScript (only theme detection logic)
- CSS animations that use GPU acceleration
- SVG decorations rendered as Unicode emojis (no image downloads)
- No impact on initial page load time
