/**
 * SSAFYHome - Showroom Application
 * Main application class for the Crystal Ball Showroom
 */

export class ShowroomApp {
  constructor(options = {}) {
    this.options = {
      svgPath: options.svgPath || './figure.svg',
      defaultTheme: options.defaultTheme || 'day',
      defaultColorTheme: options.defaultColorTheme || 'warm-beige',
      themeTogglePosition: options.themeTogglePosition || 'top-right',
      colorThemePosition: options.colorThemePosition || 'top-left',
      ...options
    };

    this.lightingEffects = null;
    this.themeToggle = null;
    this.colorThemeManager = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Load furniture SVG
      await this.loadFurnitureSVG();

      // Initialize theme controls
      this.initThemeToggle();
      this.initColorTheme();

      // Initialize showroom concept
      this.initShowroom();

      console.log('Showroom app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize showroom app:', error);
    }
  }

  /**
   * Load the furniture SVG file
   */
  async loadFurnitureSVG() {
    try {
      const response = await fetch(this.options.svgPath);

      if (!response.ok) {
        throw new Error(`SVG file not found: ${response.status}`);
      }

      const svgContent = await response.text();
      const wrapper = document.getElementById('furniture-svg-wrapper');

      if (!wrapper) {
        throw new Error('furniture-svg-wrapper element not found');
      }

      // Insert SVG content
      wrapper.innerHTML = svgContent;

      // Configure SVG
      const svg = wrapper.querySelector('svg');
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
      }

      // Initialize lighting effects
      this.initLightingEffects();

      // Show all furniture immediately (no scroll animation)
      this.showAllFurniture();
    } catch (error) {
      console.error('Error loading SVG:', error);
      this.showSVGError(error.message);
    }
  }

  /**
   * Show error message when SVG fails to load
   */
  showSVGError(message) {
    const wrapper = document.getElementById('furniture-svg-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        <div class="loading" style="opacity: 1;">
          <p style="color: #d97979;">⚠️ SVG 파일을 불러올 수 없습니다</p>
          <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">
            figure.svg 파일이 올바른 위치에 있는지 확인해주세요
          </p>
          <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 0.5rem;">
            ${message}
          </p>
        </div>
      `;
    }
  }

  /**
   * Show all furniture layers with GSAP animation
   */
  showAllFurniture() {
    const furnitureLayers = document.querySelectorAll(
      '[id^="background"], [id^="sofa"], [id^="tables"], [id^="lamp"], [id^="reze"]'
    );

    furnitureLayers.forEach((layer) => {
      if (typeof gsap !== 'undefined') {
        gsap.to(layer, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        });
      } else {
        layer.style.opacity = '1';
      }
    });
  }

  /**
   * Initialize lighting effects
   */
  initLightingEffects() {
    const container = document.querySelector('.room-container');
    if (!container) return;

    // Lighting is primarily handled by CSS
    // This method is kept for future enhancements
  }

  /**
   * Initialize theme toggle control
   */
  initThemeToggle() {
    if (typeof ThemeToggle === 'undefined') {
      console.warn('ThemeToggle class not found');
      return;
    }

    this.themeToggle = new ThemeToggle({
      autoMode: false,
      defaultTheme: this.options.defaultTheme,
      position: this.options.themeTogglePosition,
      showTooltip: true,
    });

    // Listen for theme changes
    window.addEventListener('themechange', (e) => {
      if (this.lightingEffects) {
        this.lightingEffects.toggle(e.detail.isNight);
      }
    });
  }

  /**
   * Initialize color theme manager
   */
  initColorTheme() {
    if (typeof ColorThemeManager === 'undefined') {
      console.warn('ColorThemeManager class not found');
      return;
    }

    this.colorThemeManager = new ColorThemeManager({
      defaultTheme: this.options.defaultColorTheme,
      position: this.options.colorThemePosition,
      showLabels: true,
    });

    // Listen for color theme changes
    window.addEventListener('colorthemechange', (e) => {
      console.log(`Color theme changed to: ${e.detail.themeName}`);
    });
  }

  /**
   * Initialize showroom concept
   */
  initShowroom() {
    const container = document.querySelector('.room-container');
    if (container) {
      container.classList.add('showroom-stand');
      this.addShowroomElements(container);
    }
    document.documentElement.classList.add('concept-showroom');
  }

  /**
   * Add showroom-specific lighting elements
   */
  addShowroomElements(container) {
    // Add showroom-specific lighting elements
    const ambientLight = document.createElement('div');
    ambientLight.className = 'showroom-ambient-light';
    container.appendChild(ambientLight);

    const windowLight = document.createElement('div');
    windowLight.className = 'showroom-window';
    container.appendChild(windowLight);

    const lampGlow = document.createElement('div');
    lampGlow.className = 'showroom-lamp-glow';
    container.appendChild(lampGlow);
  }

  /**
   * Destroy the application and clean up
   */
  destroy() {
    // Remove event listeners
    // Clean up resources
    this.lightingEffects = null;
    this.themeToggle = null;
    this.colorThemeManager = null;
  }
}
