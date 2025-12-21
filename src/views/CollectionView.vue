<template>
  <div class="collection-view">
    <!-- Snow Effect (Global for Collection) -->
    <SnowCanvas />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">컬렉션을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchCollections">다시 시도</button>
    </div>

    <!-- Empty State: Goal Setup CTA -->
    <div v-else-if="!hasAnyData" class="empty-cta-fullpage">
      <SnowCanvas />
      <div class="cta-card">
        <div class="cta-icon-wrapper">
          <AppIcon name="house" :size="64" weight="duotone" :color="brandAccent" />
        </div>
        <h3 class="cta-title">아직 드림홈 목표가 없어요</h3>
        <p class="cta-description">
          목표를 설정하고 저축을 시작하면<br>
          여기서 집짓기 여정을 확인할 수 있어요!
        </p>
        <button class="btn btn-primary" @click="goToPropertySearch">
          <AppIcon name="magnifyingGlass" :size="20" weight="bold" />
          <span>매물 둘러보기</span>
        </button>
        <p class="cta-hint">매물을 선택하고 저축 목표를 설정해보세요</p>
      </div>
    </div>

    <!-- Main Collection Gallery -->
    <main v-else class="collection-container">
      <!-- Hero CrystalBall: Currently Selected -->
      <section class="hero-crystal-section">
        <h1 class="collection-title">
          나의 드림홈 컬렉션
        </h1>
        
        <div class="main-crystal-container" @click="goToJourney">
          <transition name="crystal-swap" mode="out-in">
            <CrystalBall 
              :key="selectedKey" 
              :themeCode="selectedThemeCode"
              class="clickable-crystal"
            />
          </transition>
        </div>
        
        <p class="selected-name">{{ selectedDisplayName }}</p>
      </section>
      
      <!-- Grid of Mini CrystalBalls -->
      <section class="mini-crystals-section">
        <h2 class="section-subtitle">저장된 컬렉션</h2>
        
        <div class="mini-crystals-grid">
          <!-- In Progress Item (shown first if exists) -->
          <div
            v-if="inProgress"
            class="mini-crystal-item in-progress-item"
            :class="{ active: selectedIndex === -1 }"
            @click="selectInProgress"
            role="button"
            tabindex="0"
          >
            <div class="mini-crystal-wrapper">
              <CrystalBall class="mini-crystal" :themeCode="inProgress.themeCode" />
              <div class="progress-badge">
                <span class="progress-dot"></span>
                진행 중
              </div>
            </div>
            <span class="mini-crystal-label">{{ inProgress.propertyName }}</span>
          </div>

          <!-- Completed Collections -->
          <div
            v-for="(item, index) in collections"
            :key="item.collectionId"
            class="mini-crystal-item"
            :class="{ active: index === selectedIndex }"
            @click="selectCrystal(index)"
            role="button"
            tabindex="0"
          >
            <div class="mini-crystal-wrapper">
              <CrystalBall class="mini-crystal" :themeCode="item.themeCode" />
            </div>
            <span class="mini-crystal-label">{{ item.propertyName }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
/**
 * CollectionView
 * 
 * 사용자의 드림홈 컬렉션을 표시하는 갤러리 화면.
 * 완성된 컬렉션과 진행 중인 드림홈을 모두 표시합니다.
 * 
 * @호출부 router (path: /collection)
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import SnowCanvas from '../components/SnowCanvas.vue'
import CrystalBall from '../components/CrystalBall.vue'
import { BRAND_ACCENT } from '@/constants/colors'
import { useCollectionStore } from '@/stores/collectionStore'

const router = useRouter()
const collectionStore = useCollectionStore()
const { collections, inProgress, isLoading, error } = storeToRefs(collectionStore)

// ============================================
// State
// ============================================

const selectedIndex = ref(-1)
const brandAccent = BRAND_ACCENT

// ============================================
// Computed
// ============================================

/** 데이터가 하나라도 있는지 */
const hasAnyData = computed(() => {
  return (collections.value && collections.value.length > 0) || inProgress.value
})

/** 선택된 아이템의 고유 키 */
const selectedKey = computed(() => {
  if (selectedIndex.value === -1 && inProgress.value) {
    return `in-progress-${inProgress.value.dreamHomeId}`
  }
  return collections.value[selectedIndex.value]?.collectionId ?? 'empty'
})

/** 선택된 아이템의 테마 코드 */
const selectedThemeCode = computed(() => {
  if (selectedIndex.value === -1 && inProgress.value) {
    return inProgress.value.themeCode
  }
  return collections.value[selectedIndex.value]?.themeCode ?? 'CLASSIC'
})

/** 선택된 아이템의 표시 이름 */
const selectedDisplayName = computed(() => {
  if (selectedIndex.value === -1 && inProgress.value) {
    return `${inProgress.value.propertyName} (진행 중)`
  }
  return collections.value[selectedIndex.value]?.propertyName ?? '컬렉션을 선택하세요'
})

// ============================================
// Methods
// ============================================

async function fetchCollections() {
  await collectionStore.fetchCollections()

  if (error.value) {
    return
  }

  if (inProgress.value) {
    selectedIndex.value = -1
  } else if (collections.value.length > 0) {
    selectedIndex.value = 0
  } else {
    selectedIndex.value = -1
  }
}

function selectInProgress() {
  selectedIndex.value = -1
}

function selectCrystal(index) {
  selectedIndex.value = index
}

function goToPropertySearch() {
  router.push('/properties')
}

function goToJourney() {
  if (selectedIndex.value === -1 && inProgress.value) {
    router.push({
      path: `/collection/${inProgress.value.dreamHomeId}/journey`,
      query: { mode: 'active' }
    })
    return
  }
  
  const item = collections.value[selectedIndex.value]
  if (item?.collectionId) {
    router.push(`/collection/${item.collectionId}/journey`)
  }
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  fetchCollections()
})
</script>

<style scoped>
.collection-view {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: var(--showroom-bg-day);
  transition: background var(--theme-switch-duration, 0.45s) ease;
}

html[data-theme="night"] .collection-view {
  background: var(--showroom-bg-night);
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  padding: 2rem;
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

.loading-text,
.error-text {
  color: var(--showroom-text-day, #5D4037);
  font-size: 1rem;
  text-align: center;
}

html[data-theme="night"] .loading-text,
html[data-theme="night"] .error-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Empty CTA Full Page */
.empty-cta-fullpage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;
  padding: 2rem;
}

.cta-card {
  background: var(--bento-card-bg, #ffffff);
  border: 1px solid var(--bento-card-border, #e5e7eb);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 12px 36px -22px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
}

html[data-theme="night"] .cta-card {
  background: var(--showroom-card-bg-night, #20242a);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 42px -20px rgba(0, 0, 0, 0.5);
}

.cta-icon-wrapper {
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cta-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bento-card-title, #1f2937);
  margin-bottom: 1rem;
}

html[data-theme="night"] .cta-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.cta-description {
  font-size: 1rem;
  color: var(--bento-text-muted, #6b7280);
  line-height: 1.6;
  margin-bottom: 2rem;
}

html[data-theme="night"] .cta-description {
  color: rgba(245, 237, 227, 0.7);
}



.cta-hint {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
  margin-top: 1.5rem;
}

html[data-theme="night"] .cta-hint {
  color: rgba(245, 237, 227, 0.6);
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
  transition: color var(--theme-switch-duration, 0.45s) ease;
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
  margin: 0 auto 2rem;
  cursor: pointer;
}

.clickable-crystal {
  transition: transform 0.3s ease;
}

.main-crystal-container:hover .clickable-crystal {
  transform: scale(1.02);
}

.selected-name {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-accent-day, #D4A574);
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
}

.mini-crystal-item:hover {
  transform: translateY(-12px) scale(1.05);
}

.mini-crystal-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  border-radius: 50%;
  overflow: visible;
}

.mini-crystal-wrapper :deep(.room-container) {
  --crystal-ball-size: 120px;
  width: var(--crystal-ball-size);
  height: var(--crystal-ball-size);
}

.progress-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bento-card-bg, #ffffff);
  color: var(--bento-text, #1f2937);
  font-size: 0.625rem;
  font-weight: 700;
  padding: 3px 8px 3px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

html[data-theme="night"] .progress-badge {
  background: rgba(32, 36, 42, 0.95);
  color: var(--showroom-text-night, #F5EDE3);
}

.progress-dot {
  width: 6px;
  height: 6px;
  background: var(--brand-accent, #FF7F50);
  border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 4px var(--brand-accent, #FF7F50);
}

@keyframes dot-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 4px var(--brand-accent, #FF7F50);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
    box-shadow: 0 0 8px var(--brand-accent, #FF7F50);
  }
}

.in-progress-item .mini-crystal-wrapper {
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 127, 80, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 127, 80, 0); }
}

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

.mini-crystal-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .mini-crystal-label {
  color: var(--showroom-text-night, #F5EDE3);
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
