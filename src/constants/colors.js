// Global brand color constants to avoid hex duplication across components and styles
export const BRAND_ACCENT = '#FF6B3D'           // Flattened warm accent
export const BRAND_ACCENT_SECONDARY = '#FF8557' // Softer gradient stop
export const BRAND_ACCENT_TERTIARY = '#FF9A75'  // Hover/pressed tint

// Chart palette aligned to showroom day/night tokens for consistent theming
export const CHART_PALETTE = {
  day: {
    text: '#1F2937',                     // matches --showroom-text-day
    muted: '#6B7280',                    // muted text for axes/labels
    grid: 'rgba(17, 24, 39, 0.08)',      // subtle grid on light background
    surface: '#ffffff',                  // matches --showroom-card-bg-day
    track: '#E5E7EB',                    // light track for radial gauges
  },
  night: {
    text: '#F5F6F7',                     // matches --showroom-text-night
    muted: 'rgba(245, 246, 247, 0.75)',  // softer labels on dark background
    grid: 'rgba(255, 255, 255, 0.14)',   // visible grid on dark surface
    surface: '#20242a',                  // matches --showroom-card-bg-night
    track: 'rgba(255, 255, 255, 0.12)',  // subtle track for radial gauges
  }
}
