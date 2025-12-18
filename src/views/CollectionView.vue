<template>
  <div class="collection-view">
    <!-- Snow Effect (Global for Collection) -->
    <SnowCanvas />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">컬렉션을 불러오는 중...</p>
    </div>

    <!-- Main Collection Gallery -->
    <main v-else class="collection-container">
      <!-- Hero CrystalBall: Currently Selected -->
      <section v-if="collections.length > 0" class="hero-crystal-section">
        <h1 class="collection-title">
          <AppIcon name="magicWand" :size="32" weight="fill" :color="brandAccent" />
          나의 드림홈 컬렉션
          <AppIcon name="magicWand" :size="32" weight="fill" :color="brandAccent" />
        </h1>
        
        <div class="main-crystal-container" @click="goToJourney">
          <transition name="crystal-swap" mode="out-in">
            <CrystalBall :key="selectedIndex" />
          </transition>
        </div>
        
        <p class="selected-name">{{ selectedCollection?.propertyName || '집 이름 없음' }}</p>
        <p class="selected-info">{{ selectedCollection?.location }} · {{ formatCompletedAt(selectedCollection?.completedAt) }}</p>
        
        <button v-if="selectedCollection" class="journey-btn" @click="goToJourney">
          🎬 저축 여정 보기
        </button>
      </section>
      
      <!-- Grid of Mini CrystalBalls -->
      <section class="mini-crystals-section">
        <h2 class="section-subtitle">컬렉션</h2>
        
        <div class="mini-crystals-grid">
          <!-- 진행 중인 드림홈 (가장 먼저 표시) -->
          <div
            v-if="inProgressHome"
            class="mini-crystal-item in-progress"
            @click="goToInProgressJourney"
            role="button"
            tabindex="0"
            aria-label="진행 중인 드림홈 여정 보기"
            @keydown.enter="goToInProgressJourney"
            @keydown.space.prevent="goToInProgressJourney"
          >
            <div class="mini-crystal-wrapper">
              <CrystalBall class="mini-crystal" />
              <span class="progress-badge">{{ inProgressHome.currentPhase }}/{{ inProgressHome.totalPhases }}</span>
            </div>
            <span class="mini-crystal-label">{{ inProgressHome.propertyName }}</span>
            <span class="mini-crystal-sublabel">🏗️ 진행 중 · {{ inProgressHome.location }}</span>
          </div>

          <!-- 완성된 컬렉션 목록 -->
          <div
            v-for="(item, index) in collections"
            :key="item.collectionId"
            class="mini-crystal-item"
            :class="{ active: index === selectedIndex }"
            @click="selectCrystal(index)"
            role="button"
            tabindex="0"
            :aria-label="`${item.propertyName} 선택`"
            @keydown.enter="selectCrystal(index)"
            @keydown.space.prevent="selectCrystal(index)"
          >
            <div class="mini-crystal-wrapper">
              <CrystalBall class="mini-crystal" />
              <span v-if="item.isMainDisplay" class="main-badge">⭐</span>
            </div>
            <span class="mini-crystal-label">{{ item.propertyName || item.houseName }}</span>
            <span class="mini-crystal-sublabel">{{ item.location }}</span>
          </div>
        </div>
        
        <!-- Empty State: 완성된 컬렉션도 없고 진행 중도 없을 때만 표시 -->
        <div v-if="!inProgressHome && collections.length === 0" class="empty-state">
          <div class="empty-icon">
            <AppIcon name="house" :size="64" />
          </div>
          <template v-if="activeGoalExists">
            <p class="empty-text">진행 중인 드림홈을 불러올 수 없어요</p>
            <p class="empty-subtext">잠시 후 다시 시도해주세요</p>
          </template>
          <template v-else>
            <p class="empty-text">아직 시작 전이에요!</p>
            <p class="empty-subtext">첫 드림홈을 설정하고 저축 여정을 시작해볼까요? 🏠✨</p>
            <router-link to="/" class="start-btn">드림홈 설정하기 →</router-link>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SnowCanvas from '../components/SnowCanvas.vue'
import CrystalBall from '../components/CrystalBall.vue'
import { BRAND_ACCENT } from '@/constants/colors'
import { collectionService } from '@/api/services/collectionService'

const router = useRouter()

// State
const isLoading = ref(true)
const collections = ref([])
const activeGoalExists = ref(false)
const inProgressData = ref(null)
const selectedIndex = ref(0)

const brandAccent = BRAND_ACCENT

// Computed
const selectedCollection = computed(() => collections.value[selectedIndex.value] || null)
const inProgressHome = computed(() => inProgressData.value)

// Methods
const fetchCollections = async () => {
  try {
    isLoading.value = true
    const response = await collectionService.getCollections()
    collections.value = response.collections || []
    activeGoalExists.value = response.activeGoalExists || false
    inProgressData.value = response.inProgress || null
    
    // 대표 컬렉션이 있으면 선택
    const mainIndex = collections.value.findIndex(c => c.isMainDisplay)
    if (mainIndex >= 0) {
      selectedIndex.value = mainIndex
    }
  } catch (error) {
    console.error('컬렉션 조회 실패:', error)
    collections.value = []
    inProgressData.value = null
  } finally {
    isLoading.value = false
  }
}

const selectCrystal = (index) => {
  selectedIndex.value = index
}

const goToJourney = () => {
  const collection = selectedCollection.value
  if (collection?.collectionId) {
    router.push(`/collection/${collection.collectionId}/journey`)
  }
}

const goToInProgressJourney = () => {
  router.push('/collection/in-progress/journey')
}

const formatCompletedAt = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 완공`
}

// Lifecycle
onMounted(() => {
  fetchCollections()
})
</script>

<style scoped>
.collection-view {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--showroom-accent-day, #D4A574);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--showroom-text-day, #5D4037);
  font-size: 1rem;
}

html[data-theme="night"] .loading-text {
  color: var(--showroom-text-night, #F5EDE3);
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
  margin-bottom: 6rem;
}

.collection-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--showroom-text-day, #5D4037);
  transition: color var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, cubic-bezier(0.4, 0, 0.2, 1));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

html[data-theme="night"] .collection-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.main-crystal-container {
  width: 100%;
  max-width: var(--crystal-ball-size, 350px);
  height: var(--crystal-ball-size, 350px);
  aspect-ratio: 1 / 1;
  margin: 0 auto 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.main-crystal-container:hover {
  transform: scale(1.02);
}

.selected-name {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--showroom-accent-day, #D4A574);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .selected-name {
  color: var(--showroom-accent-night, #D4A574);
}

.selected-info {
  font-size: 0.9375rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 1.5rem;
}

html[data-theme="night"] .selected-info {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.journey-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #D4A574 0%, #B8956F 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.journey-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
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
  margin-bottom: 3rem;
  color: var(--showroom-text-day, #5D4037);
  transition: color var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, cubic-bezier(0.4, 0, 0.2, 1));
}

html[data-theme="night"] .section-subtitle {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Mini Crystals Grid */
.mini-crystals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 160px));
  gap: 2.5rem 2rem;
  margin: 0 auto;
  justify-content: center;
  max-width: 800px;
}

.mini-crystal-item {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.mini-crystal-item:hover {
  transform: translateY(-8px) scale(1.03);
}

.mini-crystal-item:focus {
  outline: none;
}

/* Mini Crystal Wrapper */
.mini-crystal-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 0.75rem;
  position: relative;
  border-radius: 50%;
  overflow: visible;
}

.main-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 1.25rem;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

/* Apply mini size to CrystalBall via CSS variable override */
.mini-crystal-wrapper :deep(.room-container) {
  --crystal-ball-size: 120px;
  width: var(--crystal-ball-size);
  height: var(--crystal-ball-size);
}

/* Active state - circular golden border */
.mini-crystal-item.active .mini-crystal-wrapper::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--showroom-accent-day, #D4A574);
  box-shadow: 0 0 20px var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .mini-crystal-item.active .mini-crystal-wrapper::after {
  border-color: var(--showroom-accent-night, #D4A574);
  box-shadow: 0 0 30px var(--showroom-accent-night, #D4A574);
}

.mini-crystal-item:hover .mini-crystal-wrapper {
  filter: brightness(1.1);
}

html[data-theme="night"] .mini-crystal-item:hover .mini-crystal-wrapper {
  filter: brightness(1.2);
}

/* Mini Crystal Labels */
.mini-crystal-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  margin: 0 auto;
}

html[data-theme="night"] .mini-crystal-label {
  color: var(--showroom-text-night, #F5EDE3);
}

.mini-crystal-sublabel {
  display: block;
  font-size: 0.75rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-top: 0.25rem;
}

html[data-theme="night"] .mini-crystal-sublabel {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* 진행 중 드림홈 아이템 스타일 */
.mini-crystal-item.in-progress {
  position: relative;
}

.mini-crystal-item.in-progress .mini-crystal-wrapper {
  animation: in-progress-pulse 2s ease-in-out infinite;
}

@keyframes in-progress-pulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.02); filter: brightness(1.08); }
}

.mini-crystal-item.in-progress .mini-crystal-wrapper::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px dashed var(--showroom-accent-day, #D4A574);
  animation: in-progress-border-rotate 4s linear infinite;
}

@keyframes in-progress-border-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

html[data-theme="night"] .mini-crystal-item.in-progress .mini-crystal-wrapper::after {
  border-color: var(--showroom-accent-night, #D4A574);
}

.progress-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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
  margin-bottom: 1.5rem;
  opacity: 0.6;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .empty-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.empty-subtext {
  font-size: 1rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 1.5rem;
}

html[data-theme="night"] .empty-subtext {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.start-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-accent-day, #D4A574);
  border: 2px solid var(--showroom-accent-day, #D4A574);
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.start-btn:hover {
  background: var(--showroom-accent-day, #D4A574);
  color: white;
}

html[data-theme="night"] .start-btn {
  color: var(--showroom-accent-night, #D4A574);
  border-color: var(--showroom-accent-night, #D4A574);
}

html[data-theme="night"] .start-btn:hover {
  background: var(--showroom-accent-night, #D4A574);
  color: #1A1A2E;
}

/* Responsive */
@media (max-width: 767px) {
  .collection-container {
    padding: 3rem 1.5rem;
  }

  .collection-title {
    font-size: 1.75rem;
  }

  .section-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  .mini-crystals-grid {
    grid-template-columns: repeat(2, 130px);
    gap: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .collection-title {
    font-size: 1.5rem;
    flex-wrap: wrap;
  }

  .mini-crystals-grid {
    grid-template-columns: repeat(2, 110px);
    gap: 1.5rem 1rem;
  }

  .mini-crystal-wrapper {
    width: 100px;
    height: 100px;
  }

  .mini-crystal-wrapper :deep(.room-container) {
    --crystal-ball-size: 100px;
  }
}
</style>
