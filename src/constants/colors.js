// Global brand color constants to avoid hex duplication across components and styles
export const BRAND_ACCENT = '#FF7F50'           // Living Coral
export const BRAND_ACCENT_SECONDARY = '#FF6347' // Deeper coral for gradients
export const BRAND_ACCENT_TERTIARY = '#FF6B6B'  // Soft coral for gradients/hover

// Chart palette aligned to showroom day/night tokens for consistent theming
export const CHART_PALETTE = {
  day: {
    text: '#2C2420',                     // matches --showroom-text-day
    muted: '#6D5D4F',                    // muted text for axes/labels
    grid: 'rgba(0, 0, 0, 0.08)',         // subtle grid on light background
    surface: '#F5EDE3',                  // matches --showroom-card-bg-day
    track: '#E8E0D5',                    // light track for radial gauges
  },
  night: {
    text: '#F5EDE3',                     // matches --showroom-text-night
    muted: 'rgba(245, 237, 227, 0.75)',  // softer labels on dark background
    grid: 'rgba(255, 255, 255, 0.14)',   // visible grid on dark surface
    surface: '#4a4540',                  // matches --showroom-card-bg-night
    track: 'rgba(255, 255, 255, 0.12)',  // subtle track for radial gauges
  }
}
