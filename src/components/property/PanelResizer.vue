<template>
  <div
    class="panel-resizer"
    :class="{ dragging: isDragging }"
    @mousedown="startDrag"
  >
    <div class="resizer-handle">
      <div class="resizer-grip"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const emit = defineEmits(['resize', 'resizeStart', 'resizeEnd'])

const isDragging = ref(false)
const startX = ref(0)

/**
 * 드래그 시작
 */
function startDrag(e) {
  isDragging.value = true
  startX.value = e.clientX

  emit('resizeStart')

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  e.preventDefault()
}

/**
 * 드래그 중
 */
function onDrag(e) {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value
  emit('resize', deltaX)

  e.preventDefault()
}

/**
 * 드래그 종료
 */
function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  emit('resizeEnd')
}

// 컴포넌트 언마운트 시 이벤트 리스너 정리
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})
</script>

<style scoped>
.panel-resizer {
  position: relative;
  width: 8px;
  flex-shrink: 0;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.panel-resizer:hover,
.panel-resizer.dragging {
  background: rgba(66, 133, 244, 0.1);
}

html[data-theme="night"] .panel-resizer:hover,
html[data-theme="night"] .panel-resizer.dragging {
  background: rgba(66, 133, 244, 0.15);
}

.resizer-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

html[data-theme="night"] .resizer-handle {
  background: rgba(58, 53, 48, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.panel-resizer:hover .resizer-handle,
.panel-resizer.dragging .resizer-handle {
  opacity: 1;
}

.resizer-grip {
  width: 4px;
  height: 32px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(66, 133, 244, 0.4) 20%,
    rgba(66, 133, 244, 0.6) 50%,
    rgba(66, 133, 244, 0.4) 80%,
    transparent 100%
  );
  border-radius: 2px;
}

html[data-theme="night"] .resizer-grip {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(66, 133, 244, 0.5) 20%,
    rgba(66, 133, 244, 0.7) 50%,
    rgba(66, 133, 244, 0.5) 80%,
    transparent 100%
  );
}

/* 드래그 중 애니메이션 */
.panel-resizer.dragging .resizer-handle {
  box-shadow: 0 6px 20px rgba(66, 133, 244, 0.3);
}

.panel-resizer.dragging .resizer-grip {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(66, 133, 244, 0.6) 20%,
    rgba(66, 133, 244, 0.8) 50%,
    rgba(66, 133, 244, 0.6) 80%,
    transparent 100%
  );
}

/* GPU 가속 */
.panel-resizer,
.resizer-handle,
.resizer-grip {
  transform: translateZ(0);
}
</style>
