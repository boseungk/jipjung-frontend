<template>
  <div class="crystal-ball-hero">
    <!-- Top Message -->
    <h1 class="hero-title"><AppIcon name="magicWand" :size="32" weight="fill" :color="brandAccent" /> 나만의 꿈의 쇼룸 <AppIcon name="magicWand" :size="32" weight="fill" :color="brandAccent" /></h1>
    
    <!-- Crystal Ball Container -->
    <div class="crystal-ball-container">
      <CrystalBall />
    </div>
    
    <!-- Bottom Message -->
    <p class="hero-message">{{ dreamHome.propertyName }}이 완성되어가고 있습니다</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CrystalBall from '../CrystalBall.vue'
import { useDreamHomeStore } from '../../stores/dreamHomeStore'
import { BRAND_ACCENT } from '@/constants/colors'

const dreamHomeStore = useDreamHomeStore()
const dreamHome = computed(() => dreamHomeStore.dreamHomeInfo)
const brandAccent = BRAND_ACCENT
</script>

<style scoped>
.crystal-ball-hero {
  width: 100%;
  padding: 1.5rem 3rem;
  text-align: center;
  margin-bottom: 1rem;
  background: transparent;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* No background - just Crystal Ball */

.hero-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--showroom-text-day, #5D4037);
  transition: color 0.5s ease;
}

html[data-theme="night"] .hero-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.crystal-ball-container {
  width: var(--crystal-ball-size-desktop);
  height: var(--crystal-ball-size-desktop);
  margin: 0 auto;
}

.hero-message {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1.125rem;
  margin-top: 2rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  transition: color 0.5s ease;
}

html[data-theme="night"] .hero-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Responsive */
@media (max-width: 1023px) {
  .crystal-ball-hero {
    min-height: 420px;
    padding: 2rem;
  }
  
  .crystal-ball-container {
    width: var(--crystal-ball-size-tablet);
    height: var(--crystal-ball-size-tablet);
  }
  
  .hero-title {
    font-size: 2rem;
  }
}

@media (max-width: 767px) {
  .crystal-ball-hero {
    min-height: 400px;
    padding: 1.5rem;
  }
  
  .crystal-ball-container {
    width: var(--crystal-ball-size-mobile);
    height: var(--crystal-ball-size-mobile);
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-message {
    font-size: 1rem;
  }
}
</style>
