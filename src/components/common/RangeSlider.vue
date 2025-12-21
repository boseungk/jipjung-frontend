<template>
  <div class="range-slider" :class="{ disabled }">
    <div class="slider-header" v-if="showLabels">
      <span class="slider-value min-value">{{ formatValue(modelMin) }}</span>
      <span class="slider-value max-value">{{ formatValue(modelMax) }}</span>
    </div>
    
    <div class="slider-container" ref="sliderRef">
      <div class="slider-track"></div>
      <div 
        class="slider-fill" 
        :style="fillStyle"
      ></div>
      
      <!-- Min thumb -->
      <div 
        class="slider-thumb min-thumb"
        :style="{ left: minThumbPosition + '%' }"
        @mousedown="startDrag('min', $event)"
        @touchstart.prevent="startDrag('min', $event)"
      >
        <div class="thumb-tooltip" v-if="isDragging === 'min'">
          {{ formatValue(modelMin) }}
        </div>
      </div>
      
      <!-- Max thumb -->
      <div 
        class="slider-thumb max-thumb"
        :style="{ left: maxThumbPosition + '%' }"
        @mousedown="startDrag('max', $event)"
        @touchstart.prevent="startDrag('max', $event)"
      >
        <div class="thumb-tooltip" v-if="isDragging === 'max'">
          {{ formatValue(modelMax) }}
        </div>
      </div>
    </div>
    
    <div class="slider-range-labels" v-if="showRangeLabels">
      <span>{{ formatValue(min) }}</span>
      <span>{{ formatValue(max) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  modelMin: { type: Number, default: null },
  modelMax: { type: Number, default: null },
  formatValue: { type: Function, default: (v) => v },
  showLabels: { type: Boolean, default: true },
  showRangeLabels: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelMin', 'update:modelMax', 'change'])

const sliderRef = ref(null)
const isDragging = ref(null)

// 실제 표시할 min/max 값 (null이면 범위 끝값 사용)
const effectiveMin = computed(() => props.modelMin ?? props.min)
const effectiveMax = computed(() => props.modelMax ?? props.max)

// 썸 위치 계산 (%)
const minThumbPosition = computed(() => {
  return ((effectiveMin.value - props.min) / (props.max - props.min)) * 100
})

const maxThumbPosition = computed(() => {
  return ((effectiveMax.value - props.min) / (props.max - props.min)) * 100
})

// 채워진 영역 스타일
const fillStyle = computed(() => ({
  left: minThumbPosition.value + '%',
  width: (maxThumbPosition.value - minThumbPosition.value) + '%'
}))

// 드래그 로직
function startDrag(thumb, event) {
  if (props.disabled) return
  isDragging.value = thumb
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(event) {
  if (!isDragging.value || !sliderRef.value) return
  
  const rect = sliderRef.value.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  
  let percentage = (clientX - rect.left) / rect.width
  percentage = Math.max(0, Math.min(1, percentage))
  
  let value = props.min + percentage * (props.max - props.min)
  value = Math.round(value / props.step) * props.step
  value = Math.max(props.min, Math.min(props.max, value))
  
  if (isDragging.value === 'min') {
    // Min은 max보다 클 수 없음
    value = Math.min(value, effectiveMax.value - props.step)
    emit('update:modelMin', value)
  } else {
    // Max는 min보다 작을 수 없음
    value = Math.max(value, effectiveMin.value + props.step)
    emit('update:modelMax', value)
  }
}

function stopDrag() {
  if (isDragging.value) {
    emit('change', { min: effectiveMin.value, max: effectiveMax.value })
  }
  isDragging.value = null
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.range-slider {
  width: 100%;
  padding: 0.5rem 0;
  user-select: none;
}

.range-slider.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

html[data-theme="night"] .slider-value {
  color: var(--showroom-text-night);
  background: rgba(255, 255, 255, 0.1);
}

.slider-container {
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

html[data-theme="night"] .slider-track {
  background: rgba(255, 255, 255, 0.15);
}

.slider-fill {
  position: absolute;
  height: 6px;
  background: linear-gradient(90deg, var(--brand-accent), #FF6347);
  border-radius: 3px;
}

.slider-thumb {
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border: 3px solid var(--brand-accent);
  border-radius: 50%;
  cursor: grab;
  transform: translateX(-50%);
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  z-index: 2;
}

.slider-thumb:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.4);
}

.slider-thumb:active {
  cursor: grabbing;
  transform: translateX(-50%) scale(1.15);
}

html[data-theme="night"] .slider-thumb {
  background: #2a2a2a;
  border-color: var(--brand-accent);
}

.thumb-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--brand-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.thumb-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--brand-accent);
}

.slider-range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
}

html[data-theme="night"] .slider-range-labels {
  color: var(--showroom-text-night);
}
</style>
