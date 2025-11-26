<template>
  <component
    :is="iconComponent"
    :weight="computedWeight"
    :size="size"
    :color="computedColor"
    :class="['app-icon', { 'app-icon--inactive': !active }, customClass]"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: null
  },
  weight: {
    type: String,
    default: null, // null이면 자동으로 active 상태에 따라 결정
    validator: (value) => !value || ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'].includes(value)
  },
  active: {
    type: Boolean,
    default: false
  },
  isMajorCta: {
    type: Boolean,
    default: false // true면 active 시 #FF7F50 사용
  },
  customClass: {
    type: String,
    default: ''
  }
})

const { isNight } = useTheme()

// 아이콘 컴포넌트 동적 로드
const iconComponent = computed(() => {
  const iconName = `Ph${props.name.charAt(0).toUpperCase() + props.name.slice(1)}`
  return iconName
})

// Weight 자동 계산: inactive = duotone, active = fill
const computedWeight = computed(() => {
  if (props.weight) return props.weight
  return props.active ? 'fill' : 'duotone'
})

// 색상 자동 계산
const computedColor = computed(() => {
  // 직접 색상 지정 시
  if (props.color) return props.color

  // Active 상태
  if (props.active) {
    // 주요 CTA는 #FF7F50
    if (props.isMajorCta) return '#FF7F50'
    // 보조는 테마 색상
    return isNight.value ? '#F9F8F6' : '#2C2420'
  }

  // Inactive 상태: 테마 색상 (CSS에서 opacity 적용)
  return isNight.value ? '#F9F8F6' : '#2C2420'
})
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-icon--inactive {
  opacity: 0.8;
}
</style>
