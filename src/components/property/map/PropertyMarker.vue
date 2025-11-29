<template>
    <div class="property-marker-wrapper">
        <!-- 이 컴포넌트는 실제로는 렌더링되지 않습니다 -->
        <!-- CustomOverlay가 DOM을 직접 생성하기 때문에 -->
        <!-- 이 파일은 마커 관련 타입 정의 및 유틸리티 목적으로만 사용됩니다 -->
    </div>
</template>

<script setup>
/**
 * PropertyMarker.vue
 *
 * 매물 마커 컴포넌트 (래퍼)
 * 실제 마커는 useKakaoMap composable에서 CustomOverlay로 생성됩니다.
 * 이 컴포넌트는 향후 마커 관련 로직 확장을 위한 플레이스홀더입니다.
 */

import { computed } from 'vue'
import { MARKER_EMOJIS } from '@/constants/properties'
import { MARKER_COLORS } from '@/constants/kakaoMaps'

const props = defineProps({
    property: {
        type: Object,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    },
    isAffordable: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['click', 'hover', 'leave'])

// Computed
const emoji = computed(() => {
    return MARKER_EMOJIS[props.property.propertyType] || MARKER_EMOJIS['아파트']
})

const borderColor = computed(() => {
    if (props.isSelected) {
        return MARKER_COLORS.selected
    } else if (props.isAffordable) {
        return MARKER_COLORS.affordable
    } else {
        return MARKER_COLORS.expensive
    }
})

const markerClasses = computed(() => {
    const classes = ['property-marker']
    if (props.isSelected) classes.push('selected')
    if (props.isAffordable) classes.push('affordable')
    else classes.push('expensive')
    return classes
})

// Methods
function handleClick() {
    emit('click', props.property.id)
}

function handleHover() {
    emit('hover', props.property.id)
}

function handleLeave() {
    emit('leave', props.property.id)
}

// Expose for testing
defineExpose({
    emoji,
    borderColor,
    markerClasses
})
</script>

<style scoped>
/**
 * 이 스타일은 실제로 사용되지 않습니다.
 * 마커 스타일은 KakaoMap.vue의 :global() 스타일로 정의됩니다.
 */
.property-marker-wrapper {
    display: none;
}
</style>
