<template>
  <div class="isometric-hero">
    <!-- Room Container with GLOW BEHIND -->
    <div class="room-container">
      <!-- Ambient Glow Backdrop -->
      <div class="ambient-glow"></div>
      
      <!-- Room Image - TRANSPARENT BACKGROUND with mix-blend-mode -->
      <div class="room-wrapper floating">
        <img 
          src="/figure.svg" 
          alt="Isometric Room" 
          class="room-image"
        />
      </div>
      
      <!-- Dynamic Shadow -->
      <div class="room-shadow"></div>
    </div>
    
    <!-- Bottom Info - NO TITLES, TIGHT SPACING -->
    <div class="room-info">
      <div class="dday-badge">D-{{ daysRemaining }}</div>
      <div class="main-price">₩{{ formatNumber(targetAmount) }}만</div>
      <div class="sub-price">현재 ₩{{ formatNumber(currentAmount) }}만</div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useDreamHomeStore } from '../../stores/dreamHomeStore'
import { formatNumber } from '../../utils/formatters'

const dreamHomeStore = useDreamHomeStore()
const { currentAmount, targetAmount, daysRemaining } = storeToRefs(dreamHomeStore)
</script>

<style scoped>
.isometric-hero {
  width: 100%;
  padding: 1rem 1rem 2rem; /* Increased top/bottom padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0rem;
  background: transparent;
}

/* Room Container */
.room-container {
  position: relative;
  width: 100%;
  max-width: 650px;
  padding: 2rem 1rem 1rem;
}

/* Ambient Glow */
.ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 220, 0.4) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

html[data-theme="night"] .ambient-glow {
  background: radial-gradient(
    circle,
    rgba(212, 165, 116, 0.5) 0%,
    rgba(212, 165, 116, 0.2) 40%,
    transparent 70%
  );
  filter: blur(70px);
}

/* Room Wrapper */
.room-wrapper {
  position: relative;
  width: 100%;
  margin: 0 auto;
  z-index: 10;
}

/* Floating Animation */
.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Room Image */
.room-image {
  width: 100%;
  height: auto;
  display: block;
  mix-blend-mode: multiply;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

html[data-theme="night"] .room-image {
  mix-blend-mode: screen;
  opacity: 0.95;
}

/* Dynamic Shadow */
.room-shadow {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  height: 30px;
  background: radial-gradient(
    ellipse,
    rgba(0, 0, 0, 0.35),
    rgba(0, 0, 0, 0.15),
    transparent
  );
  filter: blur(18px);
  animation: shadowPulse 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes shadowPulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateX(-50%) scale(0.92);
    opacity: 0.5;
  }
}

/* Room Info */
.room-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  margin-top: -0.5rem;
}

/* D-Day Badge */
.dday-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  background: var(--showroom-card-bg-day, #F5EDE3);
  color: var(--showroom-text-day, #5D4037);
  font-weight: 700;
  font-size: 0.9375rem;
  border-radius: 20px;
  box-shadow: 
    4px 4px 10px var(--showroom-shadow-dark-day, #D4C8BD),
    -3px -3px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="night"] .dday-badge {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-text-night, #F5EDE3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Main Price */
.main-price {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--showroom-text-day, #5D4037);
  letter-spacing: -0.02em;
  margin: 0.2rem 0;
}

html[data-theme="night"] .main-price {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Sub Price */
.sub-price {
  font-size: 1rem;
  font-weight: 500;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .sub-price {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* MOBILE OPTIMIZATION */
@media (max-width: 767px) {
  .isometric-hero {
    padding: 0rem 0.5rem 0.5rem; /* Reduced top padding */
  }

  .room-container {
    padding: 0.5rem 0.5rem 0rem; /* Much smaller padding */
    max-width: 100%;
  }

  /* Smaller glow on mobile */
  .ambient-glow {
    width: 100%;
    height: 100%;
    filter: blur(40px);
  }

  /* Reduce room info spacing */
  .room-info {
    gap: 0.3rem;
    margin-top: -0.25rem;
  }

  .dday-badge {
    padding: 0.3rem 0.875rem;
    font-size: 0.875rem;
  }

  .main-price {
    font-size: 1.875rem; /* Smaller on mobile */
  }

  .sub-price {
    font-size: 0.875rem;
  }
}

/* Extra small devices */
@media (max-width: 374px) {
  .main-price {
    font-size: 1.625rem;
  }
  
  .sub-price {
    font-size: 0.8125rem;
  }
}
</style>
