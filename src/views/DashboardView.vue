<template>
  <div class="dashboard-container">
    <!-- Background Effects -->
    <div class="winter-gradient"></div>
    <div class="mouse-light-effect" :style="mouseStyle"></div>
    <div class="rising-light-container"></div>
    
    <!-- Header -->
    <header class="header">
      <h1>🏠 라이프스타일 쇼룸</h1>
      <p>당신의 저축을 아름다운 공간으로 전시하세요</p>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Glass Sphere Showroom -->
      <section class="showroom-section">
        <GlassSphere />
      </section>

      <!-- Dashboard Widgets -->
      <section class="widgets-section">
        <!-- Price Card -->
        <div class="widget-card price-card">
          <div class="amount">₩500만</div>
          <div class="label">목표 저축 금액</div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
          <div class="widget-card info-item">
            <div class="icon">🏠</div>
            <div class="value">85%</div>
            <div class="label">달성률</div>
          </div>
          <div class="widget-card info-item">
            <div class="icon">📅</div>
            <div class="value">127일</div>
            <div class="label">진행 기간</div>
          </div>
          <div class="widget-card info-item">
            <div class="icon">💰</div>
            <div class="value">₩425만</div>
            <div class="label">현재 저축액</div>
          </div>
          <div class="widget-card info-item">
            <div class="icon">🎯</div>
            <div class="value">₩75만</div>
            <div class="label">남은 금액</div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-container">
          <button class="experience-btn">
            <span>💫</span>
            <span>체험하기</span>
          </button>
        </div>
      </section>
    </main>

    <ThemeToggle />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import GlassSphere from '@/components/showroom/GlassSphere.vue'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'

const mouseStyle = ref({
  '--mouse-x': '50%',
  '--mouse-y': '50%'
})

const handleMouseMove = (e) => {
  const x = (e.clientX / window.innerWidth) * 100
  const y = (e.clientY / window.innerHeight) * 100
  mouseStyle.value = {
    '--mouse-x': `${x}%`,
    '--mouse-y': `${y}%`
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.header {
  text-align: center;
  padding: 2rem;
  z-index: 10;
  position: relative;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.125rem;
  opacity: 0.8;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.showroom-section {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.widgets-section {
  max-width: 700px;
  margin: 0 auto;
}

/* Widget Styles (Neumorphism/Glassmorphism) */
.widget-card {
  padding: 1.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  text-align: center;
}

/* Day Mode Widgets */
:global([data-theme="day"]) .widget-card {
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
}

/* Night Mode Widgets */
:global([data-theme="night"]) .widget-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.price-card {
  margin-bottom: 2rem;
  padding: 2rem;
}

.price-card .amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--showroom-accent-day);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item .icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.info-item .value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-item .label {
  font-size: 0.875rem;
  opacity: 0.7;
}

.cta-container {
  text-align: center;
}

.experience-btn {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  background: linear-gradient(145deg, var(--showroom-accent-day), #b88a5c);
  color: white;
  box-shadow: 5px 5px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.experience-btn:hover {
  transform: translateY(-2px);
}
</style>
