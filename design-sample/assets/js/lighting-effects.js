/**
 * LightingEffects Class
 * SSAFYHome - 조명 효과 시스템
 *
 * Day/Night 모드에 따라 다양한 조명 효과를 생성하고 관리합니다.
 * - Spotlight: 위에서 아래로 비추는 스포트라이트
 * - Glow: 하단에서 퍼지는 글로우 효과
 * - Sparkles: 반짝이는 파티클 효과
 * - Light Beams: 빛 줄기 효과
 */

class LightingEffects {
  /**
   * @param {HTMLElement|string} container - 조명을 추가할 컨테이너 (요소 또는 ID)
   * @param {string} type - 조명 타입: 'spotlight', 'glow', 'sparkles', 'beams', 'all'
   * @param {Object} options - 옵션 설정
   */
  constructor(container, type = 'all', options = {}) {
    // 컨테이너 설정
    if (typeof container === 'string') {
      this.container = document.getElementById(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('LightingEffects: Container not found');
      return;
    }

    // 설정
    this.type = type;
    this.options = {
      sparkleCount: options.sparkleCount || 20,
      beamCount: options.beamCount || 5,
      autoStart: options.autoStart !== false,
      intensity: options.intensity || 1.0,
      ...options
    };

    // 조명 요소 배열
    this.lights = [];
    this.sparkles = [];
    this.beams = [];

    // 초기화
    this.init();
  }

  /**
   * 초기화 - 선택한 타입에 따라 조명 생성
   */
  init() {
    // 컨테이너에 position 설정 (없으면)
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    // 타입별 조명 생성
    if (this.type === 'all' || this.type === 'spotlight') {
      this.createSpotlight();
    }

    if (this.type === 'all' || this.type === 'glow') {
      this.createGlow();
    }

    if (this.type === 'all' || this.type === 'sparkles') {
      this.createSparkles();
    }

    if (this.type === 'all' || this.type === 'beams') {
      this.createLightBeams();
    }

    // 자동 시작
    if (this.options.autoStart) {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'day';
      this.toggle(currentTheme === 'night');
    }
  }

  /**
   * 스포트라이트 생성 (위에서 아래로)
   */
  createSpotlight() {
    const spotlight = document.createElement('div');
    spotlight.className = 'room-spotlight';
    spotlight.style.opacity = '0';
    spotlight.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    this.container.appendChild(spotlight);
    this.lights.push(spotlight);

    return spotlight;
  }

  /**
   * 글로우 효과 생성 (하단에서 퍼짐)
   */
  createGlow() {
    const glow = document.createElement('div');
    glow.className = 'room-glow';
    glow.style.opacity = '0';
    glow.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

    this.container.appendChild(glow);
    this.lights.push(glow);

    // GSAP가 있으면 펄스 애니메이션 추가
    if (typeof gsap !== 'undefined') {
      gsap.to(glow, {
        opacity: 0.7,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true
      });
    }

    return glow;
  }

  /**
   * 반짝이는 파티클 생성
   */
  createSparkles() {
    const colors = ['gold', 'silver', 'green'];
    const count = this.options.sparkleCount;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkle.className = `sparkle ${color}`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 3}s`;
      sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;

      this.container.appendChild(sparkle);
      this.sparkles.push(sparkle);
    }

    return this.sparkles;
  }

  /**
   * 빛 줄기 생성
   */
  createLightBeams() {
    const count = this.options.beamCount;
    const width = 100 / (count + 1);

    for (let i = 0; i < count; i++) {
      const beam = document.createElement('div');
      beam.className = 'light-beam';
      beam.style.left = `${width * (i + 1)}%`;
      beam.style.opacity = '0';
      beam.style.animationDelay = `${i * 0.3}s`;

      this.container.appendChild(beam);
      this.beams.push(beam);
    }

    return this.beams;
  }

  /**
   * 조명 켜기/끄기
   * @param {boolean} isNight - true면 조명 켜기, false면 끄기
   */
  toggle(isNight) {
    const opacity = isNight ? (0.9 * this.options.intensity) : 0;

    // 스포트라이트와 글로우
    this.lights.forEach(light => {
      light.style.opacity = opacity;
    });

    // 빛 줄기
    this.beams.forEach(beam => {
      beam.style.opacity = isNight ? (0.5 * this.options.intensity) : 0;
    });

    // 반짝이 (CSS 애니메이션은 html[data-theme="night"]로 제어됨)
    // 추가 제어가 필요하면 여기서 처리
  }

  /**
   * 조명 강도 조절
   * @param {number} intensity - 0.0 ~ 1.0
   */
  setIntensity(intensity) {
    this.options.intensity = Math.max(0, Math.min(1, intensity));
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'day';
    this.toggle(currentTheme === 'night');
  }

  /**
   * 애니메이션 재생/일시정지
   * @param {boolean} play - true면 재생, false면 일시정지
   */
  setAnimation(play) {
    if (typeof gsap === 'undefined') return;

    this.lights.forEach(light => {
      const animation = gsap.getById(light);
      if (animation) {
        play ? animation.play() : animation.pause();
      }
    });
  }

  /**
   * 특정 위치에 임시 스포트라이트 생성
   * @param {number} x - X 좌표 (%)
   * @param {number} y - Y 좌표 (%)
   * @param {number} duration - 지속 시간 (초)
   */
  flashSpotlight(x = 50, y = 50, duration = 2) {
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.left = `${x}%`;
    flash.style.top = `${y}%`;
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.width = '200px';
    flash.style.height = '200px';
    flash.style.borderRadius = '50%';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 70%)';
    flash.style.opacity = '0';
    flash.style.pointerEvents = 'none';
    flash.style.filter = 'blur(20px)';
    flash.style.zIndex = '100';

    this.container.appendChild(flash);

    // GSAP 애니메이션
    if (typeof gsap !== 'undefined') {
      gsap.timeline()
        .to(flash, {
          opacity: 1,
          scale: 1.5,
          duration: duration * 0.3,
          ease: 'power2.out'
        })
        .to(flash, {
          opacity: 0,
          scale: 2,
          duration: duration * 0.7,
          ease: 'power2.in',
          onComplete: () => flash.remove()
        });
    } else {
      // Fallback to CSS animation
      flash.style.transition = `all ${duration}s ease-out`;
      setTimeout(() => flash.style.opacity = '1', 10);
      setTimeout(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'translate(-50%, -50%) scale(2)';
      }, duration * 300);
      setTimeout(() => flash.remove(), duration * 1000);
    }
  }

  /**
   * 폭죽 효과 (해금 시 사용)
   */
  fireworks() {
    const count = 30;
    const colors = ['gold', 'silver', 'green'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.className = `sparkle ${color}`;
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.position = 'absolute';
      particle.style.zIndex = '1000';

      this.container.appendChild(particle);

      if (typeof gsap !== 'undefined') {
        const angle = (Math.PI * 2 * i) / count;
        const distance = 100 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.timeline()
          .to(particle, {
            x: x,
            y: y,
            opacity: 1,
            scale: 1.5,
            duration: 0.8,
            ease: 'power2.out'
          })
          .to(particle, {
            opacity: 0,
            y: y + 50,
            duration: 0.6,
            ease: 'power2.in',
            onComplete: () => particle.remove()
          });
      } else {
        setTimeout(() => particle.remove(), 1400);
      }
    }
  }

  /**
   * 모든 조명 효과 제거
   */
  destroy() {
    // 일반 조명
    this.lights.forEach(light => light.remove());
    this.lights = [];

    // 반짝이
    this.sparkles.forEach(sparkle => sparkle.remove());
    this.sparkles = [];

    // 빛 줄기
    this.beams.forEach(beam => beam.remove());
    this.beams = [];
  }

  /**
   * 정적 메서드: 요소에 빠르게 조명 추가
   * @param {string} containerId - 컨테이너 ID
   * @param {string} type - 조명 타입
   */
  static quickAdd(containerId, type = 'all') {
    return new LightingEffects(containerId, type, { autoStart: true });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightingEffects;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LightingEffects = LightingEffects;
}
