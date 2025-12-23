<template>
  <section class="landing-ai-demo" ref="sectionRef">
    <div class="landing-ai-demo__sticky" ref="stickyRef">
      <!-- Section Title -->
      <h2 class="landing-ai-demo__title">
        AI 관리사 레제를 만나보세요
      </h2>

      <!-- Character Display -->
      <div class="landing-ai-demo__character-wrapper" ref="characterRef">
        <img
          :src="currentMoodImage"
          :alt="`레제 - ${currentMood.label}`"
          class="landing-ai-demo__character"
          :class="{ 'is-mood-changed': isMoodChanging }"
        />
      </div>

      <!-- Speech Bubble -->
      <div class="landing-ai-demo__speech-bubble">
        {{ currentMood.speech }}
      </div>

      <!-- Mood Indicator Dots -->
      <div class="landing-ai-demo__mood-dots">
        <span
          v-for="(mood, index) in MOODS"
          :key="mood.id"
          class="landing-ai-demo__mood-dot"
          :class="{ 'is-active': currentMoodIndex === index }"
        />
      </div>

      <!-- Final CTA -->
      <button 
        class="landing-hero__cta landing-ai-demo__cta"
        :class="{ 'landing-hero__cta--glow': isNight }"
        @click="handleStartClick"
      >
        지금 시작하기 →
      </button>
    </div>
  </section>
</template>

<script setup>
/**
 * LandingAiDemo.vue
 * AI 관리사 캐릭터의 감정 변화 기능 체험
 * 
 * 기능:
 * - 스크롤 진행률에 따른 5가지 감정 순환
 * - 감정 변화 시 bounce + glow 애니메이션
 * - 감정별 대사 표시
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useTheme } from '@/composables/useTheme'

// Character Images
import normalImg from '@/assets/images/characters/normal.webp'
import curiousImg from '@/assets/images/characters/curious.webp'
import strictImg from '@/assets/images/characters/strict.webp'
import confuseImg from '@/assets/images/characters/confuse.webp'
import upsetImg from '@/assets/images/characters/upset.webp'

// Constants
const MOODS = [
  {
    id: 'NORMAL',
    label: '일반',
    image: normalImg,
    speech: '안녕하세요! 오늘 지출을 확인해볼까요?'
  },
  {
    id: 'CURIOUS',
    label: '궁금',
    image: curiousImg,
    speech: '흠, 이 지출은 뭔가요? 자세히 볼게요.'
  },
  {
    id: 'STRICT',
    label: '엄격',
    image: strictImg,
    speech: '이 지출은 좀 과한 것 같아요...'
  },
  {
    id: 'CONFUSED',
    label: '혼란',
    image: confuseImg,
    speech: '잠깐, 이게 맞나요? 다시 확인해볼게요.'
  },
  {
    id: 'UPSET',
    label: '놀람',
    image: upsetImg,
    speech: '50,000원 커피라니요?! 저축 목표를 다시 생각해봐요!'
  }
]

// Emits
const emit = defineEmits(['start-click'])

// Composables
const { isNight } = useTheme()

// Refs
const sectionRef = ref(null)
const stickyRef = ref(null)
const characterRef = ref(null)
const currentMoodIndex = ref(0)
const isMoodChanging = ref(false)

// Computed
const currentMood = computed(() => MOODS[currentMoodIndex.value])

const currentMoodImage = computed(() => currentMood.value.image)

/**
 * 스크롤 진행률 기반 감정 변경
 */
function updateMood(progress) {
  const clamped = Math.min(1, Math.max(0, progress))
  const newMoodIndex = Math.min(
    MOODS.length - 1,
    Math.floor(clamped * MOODS.length)
  )

  if (newMoodIndex !== currentMoodIndex.value) {
    currentMoodIndex.value = newMoodIndex
  }
}

/**
 * CTA 버튼 클릭 핸들러
 */
function handleStartClick() {
  emit('start-click')
}

/**
 * 감정 변화 애니메이션 트리거
 */
watch(currentMoodIndex, () => {
  isMoodChanging.value = true
  
  // Bounce 효과 (CSS 기반)
  if (characterRef.value) {
    const wrapper = characterRef.value
    wrapper.style.transform = 'scale(1.1)'
    
    setTimeout(() => {
      wrapper.style.transform = 'scale(1)'
    }, 250)
  }

  // Glow 효과 제거
  setTimeout(() => {
    isMoodChanging.value = false
  }, 800)
})

let scrollTrigger = null
let resizeTimer = null

function initScrollTrigger() {
  if (typeof window === 'undefined') return
  if (!sectionRef.value || !stickyRef.value) return

  if (!gsap.core.globals().ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger)
  }

  scrollTrigger?.kill()

  const scrollLength = window.innerHeight * (MOODS.length - 1)
  scrollTrigger = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: `+=${scrollLength}`,
    pin: stickyRef.value,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => updateMood(self.progress)
  })

  updateMood(scrollTrigger.progress || 0)
  ScrollTrigger.refresh()
}

function handleResize() {
  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
  }

  resizeTimer = window.setTimeout(() => {
    initScrollTrigger()
  }, 150)
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  initScrollTrigger()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  scrollTrigger?.kill()
  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.landing-ai-demo__character-wrapper {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
