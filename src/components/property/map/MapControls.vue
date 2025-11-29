<template>
    <div class="map-controls">
        <!-- 필터 버튼 -->
        <button v-if="showFilter" class="control-btn filter-btn" @click="emit('filter')" title="필터">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
        </button>

        <!-- 현재 위치 버튼 -->
        <button
            v-if="showCurrentLocation"
            class="control-btn location-btn"
            @click="handleCurrentLocation"
            title="현재 위치"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        </button>

        <!-- 리셋 버튼 -->
        <button
            v-if="showReset"
            class="control-btn reset-btn"
            @click="emit('reset')"
            title="지도 초기화"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
            </svg>
        </button>

        <!-- 전체 보기 버튼 -->
        <button
            v-if="showFitBounds"
            class="control-btn fit-bounds-btn"
            @click="emit('fitBounds')"
            title="전체 보기"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    showFilter: {
        type: Boolean,
        default: true
    },
    showCurrentLocation: {
        type: Boolean,
        default: true
    },
    showReset: {
        type: Boolean,
        default: true
    },
    showFitBounds: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['filter', 'currentLocation', 'reset', 'fitBounds'])

const loadingLocation = ref(false)

/**
 * 현재 위치 가져오기
 */
function handleCurrentLocation() {
    if (loadingLocation.value) return

    loadingLocation.value = true

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                emit('currentLocation', { lat: latitude, lng: longitude })
                loadingLocation.value = false
            },
            (error) => {
                console.error('Failed to get current location:', error)
                alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
                loadingLocation.value = false
            }
        )
    } else {
        alert('이 브라우저는 위치 서비스를 지원하지 않습니다.')
        loadingLocation.value = false
    }
}
</script>

<style scoped>
.map-controls {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 100;
}

/* Control Button Base (Glassmorphism) */
.control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
}

/* Day Mode */
html[data-theme='day'] .control-btn {
    background: var(--nav-btn-bg-day);
    backdrop-filter: blur(var(--nav-btn-blur-day));
    -webkit-backdrop-filter: blur(var(--nav-btn-blur-day));
    border: 1px solid var(--nav-btn-border-day);
    box-shadow: var(--nav-btn-shadow-day);
    color: var(--showroom-text-day);
}

html[data-theme='day'] .control-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: var(--nav-btn-shadow-day-hover);
}

html[data-theme='day'] .control-btn:active {
    transform: translateY(1px) scale(0.97);
    opacity: 0.8;
    box-shadow: var(--nav-btn-press-shadow-day);
}

/* Night Mode */
html[data-theme='night'] .control-btn {
    background: var(--nav-btn-bg-night);
    backdrop-filter: blur(var(--nav-btn-blur-night));
    -webkit-backdrop-filter: blur(var(--nav-btn-blur-night));
    border: 1px solid var(--nav-btn-border-night);
    box-shadow: var(--nav-btn-shadow-night);
    color: var(--showroom-text-night);
}

html[data-theme='night'] .control-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: var(--nav-btn-shadow-night-hover);
}

html[data-theme='night'] .control-btn:active {
    background: rgba(0, 0, 0, 0.3);
    transform: translateY(1px) scale(0.97);
    opacity: 0.8;
    box-shadow: var(--nav-btn-press-shadow-night);
}

/* Button Icons */
.control-btn svg {
    transition: transform 0.2s ease;
}

.control-btn:hover svg {
    transform: scale(1.1);
}

/* Filter Button Accent */
.filter-btn:hover {
    color: #ff7f50;
    /* Living Coral */
}

/* Current Location Button Accent */
.location-btn:hover {
    color: #4285f4;
}

/* Reset Button Accent */
.reset-btn:hover {
    color: #ef5350;
}

/* Fit Bounds Button Accent */
.fit-bounds-btn:hover {
    color: #66bb6a;
}

/* 반응형 */
@media (max-width: 768px) {
    .map-controls {
        top: 0.5rem;
        left: 0.5rem;
        gap: 0.375rem;
    }

    .control-btn {
        width: 40px;
        height: 40px;
    }

    .control-btn svg {
        width: 18px;
        height: 18px;
    }
}
</style>
