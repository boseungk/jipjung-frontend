/**
 * SSAFYHome - Main Entry Point
 * Initialize all components and effects
 */

import { ShowroomApp } from './core/ShowroomApp.js';
import { SnowEffect } from './effects/SnowEffect.js';

/**
 * Initialize the application when DOM is ready
 */
function initApp() {
  // Initialize showroom application
  const app = new ShowroomApp({
    svgPath: './figure.svg',
    defaultTheme: 'day',
    defaultColorTheme: 'warm-beige',
    themeTogglePosition: 'top-right',
    colorThemePosition: 'top-left'
  });

  app.init();

  // Initialize snow effect
  const snow = new SnowEffect('snow-canvas', {
    count: 150
  });

  // Store instances globally for debugging (optional)
  window.showroomApp = app;
  window.snowEffect = snow;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
