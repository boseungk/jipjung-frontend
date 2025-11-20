/**
 * ThemeToggle Class
 * SSAFYHome - Day/Night 테마 전환 시스템
 *
 * 사용자가 Day/Night 모드를 전환할 수 있는 토글 버튼을 제공합니다.
 * - localStorage에 선택한 테마 저장
 * - 시간대별 자동 테마 전환 (옵션)
 * - 커스텀 이벤트로 다른 컴포넌트와 연동
 * - 키보드 접근성 지원
 */

class ThemeToggle {
  /**
   * @param {Object} options - 옵션 설정
   */
  constructor(options = {}) {
    // 설정
    this.options = {
      autoMode: options.autoMode || false, // 시간대별 자동 전환
      autoModeTime: options.autoModeTime || { start: 6, end: 18 }, // 낮 시간: 6시~18시
      defaultTheme: options.defaultTheme || 'day',
      position: options.position || 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      storageKey: options.storageKey || 'ssafyhome-theme',
      showTooltip: options.showTooltip !== false,
      ...options
    };

    // 상태
    this.currentTheme = this.options.defaultTheme;
    this.toggleButton = null;
    this.sunIcon = null;
    this.moonIcon = null;

    // 초기화
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.loadSavedTheme();
    this.createToggleButton();
    this.applyTheme(this.currentTheme, false); // 애니메이션 없이 즉시 적용

    if (this.options.autoMode) {
      this.setupAutoMode();
    }
  }

  /**
   * 토글 버튼 생성
   */
  createToggleButton() {
    // 이미 존재하는지 확인
    if (document.getElementById('night-toggle')) {
      this.toggleButton = document.getElementById('night-toggle');
      this.sunIcon = document.getElementById('sun-icon');
      this.moonIcon = document.getElementById('moon-icon');
      this.bindEvents();
      return;
    }

    // 토글 버튼 컨테이너
    const toggle = document.createElement('div');
    toggle.id = 'night-toggle';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', '낮/밤 모드 전환');

    // 위치 설정
    this.setPosition(toggle);

    // 해 아이콘 (Day 모드)
    const sunIcon = this.createSunIcon();
    sunIcon.id = 'sun-icon';
    sunIcon.classList.add('toggle-icon', this.currentTheme === 'day' ? 'visible' : 'hidden');

    // 달 아이콘 (Night 모드)
    const moonIcon = this.createMoonIcon();
    moonIcon.id = 'moon-icon';
    moonIcon.classList.add('toggle-icon', this.currentTheme === 'night' ? 'visible' : 'hidden');

    toggle.appendChild(sunIcon);
    toggle.appendChild(moonIcon);

    // 툴팁 (옵션)
    if (this.options.showTooltip) {
      const tooltip = document.createElement('div');
      tooltip.className = 'theme-tooltip';
      tooltip.textContent = this.currentTheme === 'day' ? '밤 모드로 전환' : '낮 모드로 전환';
      toggle.appendChild(tooltip);
    }

    document.body.appendChild(toggle);

    this.toggleButton = toggle;
    this.sunIcon = sunIcon;
    this.moonIcon = moonIcon;

    this.bindEvents();
    this.addStyles();
  }

  /**
   * 위치 설정
   */
  setPosition(element) {
    element.style.position = 'fixed';
    element.style.zIndex = '9999';

    const positions = {
      'top-right': { top: '2rem', right: '2rem' },
      'top-left': { top: '2rem', left: '2rem' },
      'bottom-right': { bottom: '2rem', right: '2rem' },
      'bottom-left': { bottom: '2rem', left: '2rem' }
    };

    const pos = positions[this.options.position] || positions['top-right'];
    Object.assign(element.style, pos);
  }

  /**
   * 해 아이콘 생성
   */
  createSunIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    svg.innerHTML = `
      <circle cx="12" cy="12" r="5" stroke="#FFB300" stroke-width="2" fill="#FFD54F"/>
      <path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.5 3.5L19.07 4.93M4.93 19.07L3.5 20.5M20.5 20.5L19.07 19.07M4.93 4.93L3.5 3.5" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/>
    `;

    return svg;
  }

  /**
   * 달 아이콘 생성
   */
  createMoonIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    svg.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#5D4037" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;

    return svg;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 클릭 이벤트
    this.toggleButton.addEventListener('click', () => this.toggle());

    // 키보드 접근성
    this.toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * 스타일 추가
   */
  addStyles() {
    if (document.getElementById('theme-toggle-styles')) return;

    const style = document.createElement('style');
    style.id = 'theme-toggle-styles';
    style.textContent = `
      #night-toggle {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 2px solid rgba(129, 199, 132, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
        transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      #night-toggle:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 20px rgba(129, 199, 132, 0.4);
        border-color: rgba(129, 199, 132, 0.5);
      }

      #night-toggle:active {
        transform: translateY(-2px) scale(1.02);
      }

      .toggle-icon {
        position: absolute;
        transition: opacity 400ms ease-in-out, transform 400ms ease-in-out;
      }

      .toggle-icon.hidden {
        opacity: 0;
        transform: scale(0.8) rotate(-90deg);
        pointer-events: none;
      }

      .toggle-icon.visible {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      .theme-tooltip {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 300ms ease;
      }

      #night-toggle:hover .theme-tooltip {
        opacity: 1;
      }

      /* Night mode button - Tactile Glassmorphism */
      html[data-theme="night"] #night-toggle {
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.12);
        border-left-color: rgba(255, 255, 255, 0.06);
        box-shadow:
          0 8px 24px rgba(0, 0, 0, 0.4),
          0 4px 12px rgba(0, 0, 0, 0.3);
      }

      html[data-theme="night"] #night-toggle:hover {
        background: rgba(255, 255, 255, 0.08);
        border-top-color: rgba(255, 255, 255, 0.15);
        box-shadow:
          0 12px 32px rgba(0, 0, 0, 0.45),
          0 6px 16px rgba(0, 0, 0, 0.35),
          0 0 30px var(--showroom-glow-night, rgba(129, 199, 132, 0.3));
      }

      html[data-theme="night"] #night-toggle:active {
        background: rgba(0, 0, 0, 0.2);
        border-top-color: rgba(0, 0, 0, 0.1);
        box-shadow:
          inset 4px 4px 12px rgba(0, 0, 0, 0.5),
          inset -2px -2px 8px rgba(255, 255, 255, 0.03);
        transform: translateY(2px) scale(0.98);
      }

      /* Responsive */
      @media (max-width: 768px) {
        #night-toggle {
          width: 56px;
          height: 56px;
          top: 1.5rem !important;
          right: 1.5rem !important;
        }

        .theme-tooltip {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 테마 전환
   */
  toggle() {
    const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
    this.applyTheme(newTheme, true);
    this.saveTheme();
  }

  /**
   * 테마 적용
   * @param {string} theme - 'day' 또는 'night'
   * @param {boolean} animate - 애니메이션 여부
   */
  applyTheme(theme, animate = true) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    // 아이콘 업데이트
    if (this.sunIcon && this.moonIcon) {
      if (theme === 'night') {
        this.sunIcon.classList.remove('visible');
        this.sunIcon.classList.add('hidden');
        this.moonIcon.classList.remove('hidden');
        this.moonIcon.classList.add('visible');
      } else {
        this.moonIcon.classList.remove('visible');
        this.moonIcon.classList.add('hidden');
        this.sunIcon.classList.remove('hidden');
        this.sunIcon.classList.add('visible');
      }
    }

    // 툴팁 업데이트
    if (this.options.showTooltip) {
      const tooltip = this.toggleButton.querySelector('.theme-tooltip');
      if (tooltip) {
        tooltip.textContent = theme === 'day' ? '밤 모드로 전환' : '낮 모드로 전환';
      }
    }

    // 커스텀 이벤트 발생
    this.triggerThemeChange(animate);
  }

  /**
   * 테마 저장
   */
  saveTheme() {
    try {
      localStorage.setItem(this.options.storageKey, this.currentTheme);
    } catch (e) {
      console.warn('ThemeToggle: Failed to save theme to localStorage', e);
    }
  }

  /**
   * 저장된 테마 로드
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(this.options.storageKey);
      if (savedTheme === 'day' || savedTheme === 'night') {
        this.currentTheme = savedTheme;
      }
    } catch (e) {
      console.warn('ThemeToggle: Failed to load theme from localStorage', e);
    }
  }

  /**
   * 시간대별 자동 모드 설정
   */
  setupAutoMode() {
    const checkTime = () => {
      const hour = new Date().getHours();
      const { start, end } = this.options.autoModeTime;
      const shouldBeDay = hour >= start && hour < end;
      const autoTheme = shouldBeDay ? 'day' : 'night';

      // 저장된 테마가 없으면 자동으로 설정
      const savedTheme = localStorage.getItem(this.options.storageKey);
      if (!savedTheme && this.currentTheme !== autoTheme) {
        this.applyTheme(autoTheme, true);
      }
    };

    checkTime();

    // 1시간마다 체크
    setInterval(checkTime, 60 * 60 * 1000);
  }

  /**
   * 커스텀 이벤트 발생
   * @param {boolean} animate - 애니메이션 여부
   */
  triggerThemeChange(animate = true) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: this.currentTheme,
        isNight: this.currentTheme === 'night',
        isDay: this.currentTheme === 'day',
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
   * 프로그래밍 방식으로 테마 설정
   * @param {string} theme - 'day' 또는 'night'
   */
  setTheme(theme) {
    if (theme === 'day' || theme === 'night') {
      this.applyTheme(theme, true);
      this.saveTheme();
    }
  }

  /**
   * 토글 버튼 제거
   */
  destroy() {
    if (this.toggleButton) {
      this.toggleButton.remove();
    }

    const styles = document.getElementById('theme-toggle-styles');
    if (styles) {
      styles.remove();
    }
  }

  /**
   * 정적 메서드: 빠른 초기화
   * @param {Object} options - 옵션
   */
  static init(options = {}) {
    return new ThemeToggle(options);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeToggle;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ThemeToggle = ThemeToggle;
}
