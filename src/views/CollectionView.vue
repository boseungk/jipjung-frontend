<template>
  <div class="collection-view">
    <!-- Snow Effect (Global for Collection) -->
    <SnowCanvas />

    <!-- Main Collection Gallery -->
    <main class="collection-container">
      <!-- Hero CrystalBall: Currently Selected -->
      <section class="hero-crystal-section">
        <h1 class="collection-title">🔮 나의 드림홈 컬렉션 🔮</h1>
        
        <div class="main-crystal-container">
          <transition name="crystal-swap" mode="out-in">
            <CrystalBall :key="selectedIndex" />
          </transition>
        </div>
        
        <p class="selected-name">{{ collections[selectedIndex].name }}</p>
      </section>
      
      <!-- Grid of Mini CrystalBalls -->
      <section class="mini-crystals-section">
        <h2 class="section-subtitle">저장된 컬렉션</h2>
        
        <div class="mini-crystals-grid">
          <div
            v-for="(item, index) in collections"
            :key="index"
            class="mini-crystal-item"
            :class="{ active: index === selectedIndex }"
            @click="selectCrystal(index)"
            role="button"
            tabindex="0"
            :aria-label="`${item.name} 선택`"
            @keydown.enter="selectCrystal(index)"
            @keydown.space.prevent="selectCrystal(index)"
          >
            <div class="mini-crystal-wrapper">
              <CrystalBall class="mini-crystal" />
            </div>
            <span class="mini-crystal-label">{{ item.name }}</span>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="collections.length === 0" class="empty-state">
          <div class="empty-icon">🏠</div>
          <p class="empty-text">아직 저장된 집이 없습니다</p>
          <p class="empty-subtext">마음에 드는 집을 저장해보세요</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SnowCanvas from '../components/SnowCanvas.vue'
import CrystalBall from '../components/CrystalBall.vue'

// Selected crystal index
const selectedIndex = ref(0)

// Sample collection data (placeholder)
const collections = ref([
  { id: 1, name: '서울 강남 오피스텔' },
  { id: 2, name: '부산 해운대 아파트' },
  { id: 3, name: '제주 애월 타운하우스' },
  { id: 4, name: '경기 분당 단독주택' },
  { id: 5, name: '인천 송도 신축빌라' },
  { id: 6, name: '대전 유성 전원주택' }
])

// Select crystal from grid
const selectCrystal = (index) => {
  selectedIndex.value = index
}
</script>

<style scoped>
.collection-view {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* Main Collection Container */
.collection-container {
  width: 100%;
  padding: 4rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Crystal Section */
.hero-crystal-section {
  text-align: center;
  margin-bottom: 8rem;
}

.collection-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--showroom-text-day, #5D4037);
  transition: color 0.5s ease;
}

html[data-theme="night"] .collection-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.main-crystal-container {
  width: 100%;
  max-width: var(--crystal-ball-size, 350px);
  height: var(--crystal-ball-size, 350px);
  aspect-ratio: 1 / 1;
  margin: 0 auto 2rem;
}

.selected-name {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-accent-day, #D4A574);
  transition: color 0.5s ease;
}

html[data-theme="night"] .selected-name {
  color: var(--showroom-accent-night, #D4A574);
}

/* Crystal Swap Transition */
.crystal-swap-enter-active,
.crystal-swap-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.crystal-swap-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.crystal-swap-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* Mini Crystals Section */
.mini-crystals-section {
  text-align: center;
}

.section-subtitle {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 4rem;
  color: var(--showroom-text-day, #5D4037);
  transition: color 0.5s ease;
}

html[data-theme="night"] .section-subtitle {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Mini Crystals Grid */
.mini-crystals-grid {
  display: grid;
  grid-template-columns: repeat(3, 120px);
  gap: 4rem 3.5rem;
  margin: 0 auto;
  justify-content: center;
}

.mini-crystal-item {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.mini-crystal-item:hover {
  transform: translateY(-12px) scale(1.05);
}

.mini-crystal-item:focus {
  outline: none;
}

/* Mini Crystal Wrapper */
.mini-crystal-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

/* Apply mini size to CrystalBall via CSS variable override */
.mini-crystal-wrapper :deep(.room-container) {
  --crystal-ball-size: 120px;
  width: var(--crystal-ball-size);
  height: var(--crystal-ball-size);
}

/* Active state - circular golden border */
.mini-crystal-item.active .mini-crystal-wrapper {
  box-shadow: 0 0 0 2px var(--showroom-accent-day, #D4A574),
              0 0 30px var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .mini-crystal-item.active .mini-crystal-wrapper {
  box-shadow: 0 0 0 2px var(--showroom-accent-night, #D4A574),
              0 0 40px var(--showroom-accent-night, #D4A574);
}

.mini-crystal-item:hover .mini-crystal-wrapper {
  filter: brightness(1.1);
}

html[data-theme="night"] .mini-crystal-item:hover .mini-crystal-wrapper {
  filter: brightness(1.2);
}

/* Mini Crystal Label */
.mini-crystal-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  transition: color 0.3s ease;
}

html[data-theme="night"] .mini-crystal-label {
  color: var(--showroom-text-night, #F5EDE3);
}

.mini-crystal-item:hover .mini-crystal-label {
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .mini-crystal-item:hover .mini-crystal-label {
  color: var(--showroom-accent-night, #D4A574);
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .empty-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.empty-subtext {
  font-size: 0.9375rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .empty-subtext {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Responsive */
@media (max-width: 767px) {
  .collection-container {
    padding: 3rem 2rem;
  }

  .collection-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1.5rem;
    margin-bottom: 3rem;
  }

  .mini-crystals-grid {
    grid-template-columns: repeat(2, 120px);
    gap: 3rem 2rem;
  }
}

@media (max-width: 480px) {
  .collection-title {
    font-size: 1.75rem;
  }

  .mini-crystals-grid {
    grid-template-columns: 120px;
    gap: 2.5rem;
  }
}
</style>
