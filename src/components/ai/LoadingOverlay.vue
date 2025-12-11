<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="loading-overlay">
        <div class="loading-content">
          <!-- Animated Icon -->
          <div class="loading-icon">
            <span class="icon-emoji">{{ currentIcon }}</span>
          </div>

          <!-- Loading Message -->
          <p class="loading-message">{{ currentMessage }}</p>

          <!-- Sub Message (rotating) -->
          <p class="loading-submessage">{{ subMessage }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// ============================================================================
// Props
// ============================================================================

const props = defineProps({
  /** Whether the overlay is visible */
  isVisible: {
    type: Boolean,
    default: false
  },
  /** Loading type for contextual messages */
  type: {
    type: String,
    default: 'analyzing',
    validator: (v) => ['analyzing', 'judging', 'confirming', 'image'].includes(v)
  }
})

// ============================================================================
// Constants
// ============================================================================

const MESSAGES = {
  analyzing: {
    icon: '🔍',
    main: '지출 분석 중...',
    subs: ['영수증 살펴보는 중...', '금액 확인 중...', '어디 보자...']
  },
  image: {
    icon: '📷',
    main: '이미지 분석 중...',
    subs: ['영수증 읽는 중...', '글씨 파악 중...', '정보 추출 중...']
  },
  confirming: {
    icon: '✏️',
    main: '준비 중...',
    subs: ['데이터 확인 중...', '잠시만요...', '거의 다 됐어...']
  },
  judging: {
    icon: '⚖️',
    main: '판결 내리는 중...',
    subs: ['변명 검토 중...', '음... 그렇군...', '경험치 계산 중...']
  }
}

// ============================================================================
// State
// ============================================================================

const subMessageIndex = ref(0)
let intervalId = null

// ============================================================================
// Computed
// ============================================================================

const currentConfig = computed(() => MESSAGES[props.type] || MESSAGES.analyzing)

const currentIcon = computed(() => currentConfig.value.icon)

const currentMessage = computed(() => currentConfig.value.main)

const subMessage = computed(() => {
  const subs = currentConfig.value.subs
  return subs[subMessageIndex.value % subs.length]
})

// ============================================================================
// Methods
// ============================================================================

const startRotation = () => {
  stopRotation()
  subMessageIndex.value = 0
  intervalId = setInterval(() => {
    subMessageIndex.value++
  }, 2000)
}

const stopRotation = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// ============================================================================
// Watchers & Lifecycle
// ============================================================================

watch(() => props.isVisible, (visible) => {
  if (visible) {
    startRotation()
  } else {
    stopRotation()
  }
}, { immediate: true })

onUnmounted(() => {
  stopRotation()
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

/* Animated Icon */
.loading-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.icon-emoji {
  font-size: 2.5rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Messages */
.loading-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.loading-submessage {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  min-height: 1.25rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
