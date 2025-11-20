/**
 * ColorThemeManager Class
 * SSAFYHome - 색상 테마 관리 시스템
 *
 * 4가지 색상 테마를 제공하고 전환할 수 있습니다:
 * - Warm Beige: 따뜻한 베이지/우드톤 (기본)
 * - Olive Green: 차분한 올리브/그린 (Clay 스타일)
 * - Cool Gray: 세련된 그레이/화이트
 * - Sky Blue: 모던 블루/크림
 */

class ColorThemeManager {
  /**
   * @param {Object} options - 옵션 설정
   */
  constructor(options = {}) {
    // 설정
    this.options = {
      defaultTheme: options.defaultTheme || 'warm-beige',
      position: options.position || 'top-left', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
      storageKey: options.storageKey || 'ssafyhome-color-theme',
      showLabels: options.showLabels !== false,
      ...options
    };

    // 상태
    this.currentTheme = this.options.defaultTheme;
    this.pickerElement = null;

    // 테마 정의
    this.themes = {
      'warm-beige': {
        name: 'Beige',
        emoji: '🏠',
        color: '#F5EDE3',
        description: '따뜻한 베이지'
      },
      'olive-green': {
        name: 'Olive',
        emoji: '🌿',
        color: '#fcfbf8',
        description: '차분한 올리브'
      },
      'cool-gray': {
        name: 'Gray',
        emoji: '🌫️',
        color: '#F5F6F8',
        description: '세련된 그레이'
      },
      'sky-blue': {
        name: 'Blue',
        emoji: '☁️',
        color: '#F0F9FF',
        description: '모던 블루'
      }
    };

    // 초기화
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.loadSavedTheme();
    this.createPicker();
    this.applyTheme(this.currentTheme, false); // 애니메이션 없이 즉시 적용
  }

  /**
   * 색상 선택기 UI 생성
   */
  createPicker() {
    // 이미 존재하는지 확인
    if (document.getElementById('color-theme-picker')) {
      this.pickerElement = document.getElementById('color-theme-picker');
      this.bindPickerEvents();
      return;
    }

    // Picker container
    const picker = document.createElement('div');
    picker.id = 'color-theme-picker';
    picker.className = 'color-theme-picker';

    // 위치 설정
    this.setPosition(picker);

    // 각 테마별 버튼 생성
    Object.entries(this.themes).forEach(([themeKey, themeData]) => {
      const swatch = document.createElement('button');
      swatch.className = 'theme-swatch';
      swatch.dataset.theme = themeKey;
      swatch.setAttribute('aria-label', `${themeData.description} 테마로 변경`);
      swatch.setAttribute('title', themeData.description);

      if (themeKey === this.currentTheme) {
        swatch.classList.add('active');
      }

      swatch.innerHTML = `
        <span class="swatch-bg" style="background: ${themeData.color}"></span>
        ${this.options.showLabels ? `
          <span class="swatch-label">${themeData.emoji}</span>
        ` : ''}
      `;

      picker.appendChild(swatch);
    });

    document.body.appendChild(picker);
    this.pickerElement = picker;

    this.bindPickerEvents();
    this.addStyles();
  }

  /**
   * Picker 위치 설정
   */
  setPosition(element) {
    const positions = {
      'top-left': { top: '2rem', left: '2rem' },
      'top-right': { top: '2rem', right: '2rem' },
      'bottom-left': { bottom: '2rem', left: '2rem' },
      'bottom-right': { bottom: '2rem', right: '2rem' }
    };

    const pos = positions[this.options.position] || positions['top-left'];
    Object.assign(element.style, pos);
  }

  /**
   * 이벤트 바인딩
   */
  bindPickerEvents() {
    const swatches = this.pickerElement.querySelectorAll('.theme-swatch');

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const theme = swatch.dataset.theme;
        this.applyTheme(theme, true);
      });

      // 키보드 접근성
      swatch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const theme = swatch.dataset.theme;
          this.applyTheme(theme, true);
        }
      });
    });
  }

  /**
   * 스타일 추가
   */
  addStyles() {
    if (document.getElementById('color-theme-picker-styles')) return;

    const style = document.createElement('style');
    style.id = 'color-theme-picker-styles';
    style.textContent = `
      .color-theme-picker {
        position: fixed;
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--showroom-card-bg-day, #F5EDE3);
        border-radius: 24px;
        box-shadow:
          8px 8px 16px var(--showroom-shadow-dark-day, #D4C8BD),
          -8px -8px 16px var(--showroom-shadow-light-day, #FFFFFF);
        z-index: 9998;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      html[data-theme="night"] .color-theme-picker {
        /* Tactile Glassmorphism */
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.1);
        border-left-color: rgba(255, 255, 255, 0.05);
        box-shadow:
          0 8px 24px rgba(0, 0, 0, 0.35),
          0 4px 12px rgba(0, 0, 0, 0.25);
      }

      .theme-swatch {
        position: relative;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid transparent;
        background: var(--showroom-card-bg-day, #F5EDE3);
        box-shadow:
          4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
          -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 0;
      }

      html[data-theme="night"] .theme-swatch {
        /* Tactile Glassmorphism */
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.08);
        border-left-color: rgba(255, 255, 255, 0.04);
        box-shadow:
          0 6px 16px rgba(0, 0, 0, 0.3),
          0 3px 8px rgba(0, 0, 0, 0.2);
      }

      html[data-theme="night"] .theme-swatch:hover {
        background: rgba(255, 255, 255, 0.08);
        border-top-color: rgba(255, 255, 255, 0.12);
        box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.35),
          0 4px 10px rgba(0, 0, 0, 0.25),
          0 0 20px var(--showroom-glow-night, rgba(212, 165, 116, 0.4));
      }

      html[data-theme="night"] .theme-swatch:active {
        /* Pressed Glass */
        background: rgba(0, 0, 0, 0.2);
        border-top-color: rgba(0, 0, 0, 0.1);
        box-shadow:
          inset 3px 3px 10px rgba(0, 0, 0, 0.5),
          inset -2px -2px 6px rgba(255, 255, 255, 0.03);
        transform: translateY(2px) scale(0.92);
      }

      .theme-swatch.active {
        border-color: var(--showroom-accent-day, #D4A574);
        transform: scale(1.1);
      }

      html[data-theme="night"] .theme-swatch.active {
        border-color: var(--showroom-accent-night, #D4A574);
      }

      .swatch-bg {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }

      .swatch-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--showroom-text-day, #5D4037);
        pointer-events: none;
        margin-top: 2px;
      }

      html[data-theme="night"] .swatch-label {
        color: var(--showroom-text-night, #F5EDE3);
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .color-theme-picker {
          gap: 0.5rem;
          padding: 0.75rem;
          top: 1rem !important;
          left: 1rem !important;
        }

        .theme-swatch {
          width: 52px;
          height: 52px;
        }

        .swatch-bg {
          width: 28px;
          height: 28px;
        }

        .swatch-label {
          font-size: 0.7rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 테마 적용
   * @param {string} themeName - 테마 이름
   * @param {boolean} animate - 애니메이션 여부
   */
  applyTheme(themeName, animate = true) {
    if (!this.themes[themeName]) {
      console.warn(`ColorThemeManager: Theme "${themeName}" not found`);
      return;
    }

    this.currentTheme = themeName;

    // HTML 속성 설정
    document.documentElement.setAttribute('data-color-theme', themeName);

    // 활성 swatch 업데이트
    this.updateActiveSwatches();

    // localStorage 저장
    this.saveTheme();

    // 커스텀 이벤트 발생
    this.triggerThemeChange(animate);
  }

  /**
   * 활성 swatch 업데이트
   */
  updateActiveSwatches() {
    const swatches = this.pickerElement.querySelectorAll('.theme-swatch');

    swatches.forEach(swatch => {
      if (swatch.dataset.theme === this.currentTheme) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  }

  /**
   * 테마 저장
   */
  saveTheme() {
    try {
      localStorage.setItem(this.options.storageKey, this.currentTheme);
    } catch (e) {
      console.warn('ColorThemeManager: Failed to save theme to localStorage', e);
    }
  }

  /**
   * 저장된 테마 로드
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(this.options.storageKey);
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme;
      }
    } catch (e) {
      console.warn('ColorThemeManager: Failed to load theme from localStorage', e);
    }
  }

  /**
   * 커스텀 이벤트 발생
   * @param {boolean} animate - 애니메이션 여부
   */
  triggerThemeChange(animate = true) {
    const themeData = this.themes[this.currentTheme];

    const event = new CustomEvent('colorthemechange', {
      detail: {
        theme: this.currentTheme,
        themeName: themeData.name,
        themeColor: themeData.color,
        themeDescription: themeData.description,
        animate: animate
      },
      bubbles: true,
      cancelable: true
    });

    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  /**
   * 현재 테마 가져오기
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * 현재 테마 데이터 가져오기
   */
  getThemeData() {
    return this.themes[this.currentTheme];
  }

  /**
   * 프로그래밍 방식으로 테마 설정
   * @param {string} themeName - 테마 이름
   */
  setTheme(themeName) {
    this.applyTheme(themeName, true);
  }

  /**
   * Picker 표시/숨김
   * @param {boolean} show - true면 표시, false면 숨김
   */
  togglePicker(show) {
    if (this.pickerElement) {
      this.pickerElement.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Picker 제거
   */
  destroy() {
    if (this.pickerElement) {
      this.pickerElement.remove();
    }

    const styles = document.getElementById('color-theme-picker-styles');
    if (styles) {
      styles.remove();
    }
  }

  /**
   * 정적 메서드: 빠른 초기화
   * @param {Object} options - 옵션
   */
  static init(options = {}) {
    return new ColorThemeManager(options);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorThemeManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ColorThemeManager = ColorThemeManager;
}
