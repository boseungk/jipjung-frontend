/**
 * usePropertyFilters Composable
 * 
 * 매물 필터 UI의 로컬 상태 관리와 비즈니스 로직을 담당합니다.
 * PropertyFilters.vue에서 분리하여 테스트 용이성과 재사용성을 높입니다.
 * 
 * @example
 * const { localFilters, localSort, applyFilters, resetFilters } = usePropertyFilters()
 */

import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import {
    PRICE_PRESETS,
    AREA_PRESETS,
    formatPriceLabel,
    formatAreaLabel
} from '@/constants/filterPresets'

/**
 * 필터 기본값
 */
const DEFAULT_FILTERS = {
    sido: '',
    sigungu: '',
    priceMin: null,
    priceMax: null,
    areaMin: null,
    areaMax: null,
    propertyType: null,
    favoritesOnly: false,
    keyword: ''
}

const DEFAULT_SORT = {
    sortBy: 'createdAt',
    sortOrder: 'desc'
}

export function usePropertyFilters() {
    const propertyStore = usePropertyStore()
    const { filters, sortBy, sortOrder, filteredProperties, properties } = storeToRefs(propertyStore)

    // 로컬 필터 상태 (Store 반영 전 임시 상태)
    const localFilters = ref({ ...DEFAULT_FILTERS })
    const localSort = ref({ ...DEFAULT_SORT })

    // 사용 가능한 시/군/구 옵션 (현재 데이터 기반)
    const availableSigunguOptions = computed(() => {
        const values = (properties.value || [])
            .map((p) => p?.sigungu)
            .filter(Boolean)
        return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ko'))
    })

    // 필터링된 결과 수 (실시간)
    const filteredCount = computed(() => filteredProperties.value.length)

    // 활성 필터 태그 목록 (UI 표시용)
    const activeFilterTags = computed(() => {
        const tags = []
        const f = filters.value

        if (f.sigungu) {
            tags.push({ key: 'sigungu', label: f.sigungu, value: f.sigungu })
        }
        if (f.priceMin !== null || f.priceMax !== null) {
            const minLabel = f.priceMin !== null ? formatPriceLabel(f.priceMin) : ''
            const maxLabel = f.priceMax !== null ? formatPriceLabel(f.priceMax) : ''
            const label = f.priceMin !== null && f.priceMax !== null
                ? `${minLabel}~${maxLabel}`
                : f.priceMin !== null
                    ? `${minLabel} 이상`
                    : `${maxLabel} 이하`
            tags.push({ key: 'price', label, value: { min: f.priceMin, max: f.priceMax } })
        }
        if (f.areaMin !== null || f.areaMax !== null) {
            const minLabel = f.areaMin !== null ? formatAreaLabel(f.areaMin) : ''
            const maxLabel = f.areaMax !== null ? formatAreaLabel(f.areaMax) : ''
            const label = f.areaMin !== null && f.areaMax !== null
                ? `${minLabel}~${maxLabel}`
                : f.areaMin !== null
                    ? `${minLabel} 이상`
                    : `${maxLabel} 이하`
            tags.push({ key: 'area', label, value: { min: f.areaMin, max: f.areaMax } })
        }
        if (f.propertyType) {
            tags.push({ key: 'propertyType', label: f.propertyType, value: f.propertyType })
        }
        if (f.favoritesOnly) {
            tags.push({ key: 'favoritesOnly', label: '관심 매물', value: true })
        }

        return tags
    })

    // 활성 필터 개수
    const activeFilterCount = computed(() => activeFilterTags.value.length)

    // 선택된 지역 라벨
    const selectedRegionLabel = computed(() => {
        return filters.value.sigungu || '전체 지역'
    })

    // 선택된 가격 라벨
    const selectedPriceLabel = computed(() => {
        const { priceMin, priceMax } = filters.value
        if (priceMin === null && priceMax === null) return '가격'

        // 프리셋과 일치하는지 확인
        const matchedPreset = PRICE_PRESETS.find(
            p => p.min === priceMin && p.max === priceMax
        )
        if (matchedPreset) return matchedPreset.label

        // 커스텀 범위
        const minLabel = priceMin !== null ? formatPriceLabel(priceMin) : ''
        const maxLabel = priceMax !== null ? formatPriceLabel(priceMax) : ''
        if (priceMin !== null && priceMax !== null) return `${minLabel}~${maxLabel}`
        if (priceMin !== null) return `${minLabel}+`
        return `~${maxLabel}`
    })

    /**
     * Store의 현재 값으로 로컬 상태 동기화
     */
    function syncFromStore() {
        localFilters.value = {
            sido: filters.value.sido || '',
            sigungu: filters.value.sigungu || '',
            priceMin: filters.value.priceMin,
            priceMax: filters.value.priceMax,
            areaMin: filters.value.areaMin,
            areaMax: filters.value.areaMax,
            propertyType: filters.value.propertyType,
            favoritesOnly: filters.value.favoritesOnly || false,
            keyword: filters.value.keyword || ''
        }
        localSort.value = {
            sortBy: sortBy.value || 'createdAt',
            sortOrder: sortOrder.value || 'desc'
        }
    }

    /**
     * 프리셋 활성 여부 확인
     */
    function isPricePresetActive(preset) {
        return localFilters.value.priceMin === preset.min &&
            localFilters.value.priceMax === preset.max
    }

    function isAreaPresetActive(preset) {
        return localFilters.value.areaMin === preset.min &&
            localFilters.value.areaMax === preset.max
    }

    /**
     * 프리셋 적용
     */
    function applyPricePreset(preset) {
        localFilters.value.priceMin = preset.min
        localFilters.value.priceMax = preset.max
    }

    function applyAreaPreset(preset) {
        localFilters.value.areaMin = preset.min
        localFilters.value.areaMax = preset.max
    }

    /**
     * 필터 적용 (Store에 반영)
     */
    async function applyFilters() {
        propertyStore.updateFilters(localFilters.value)
        propertyStore.updateSort(localSort.value.sortBy, localSort.value.sortOrder)
        await propertyStore.fetchProperties({ page: 1 })
    }

    /**
     * 필터 초기화
     */
    async function resetAllFilters() {
        propertyStore.resetFilters()
        localSort.value = { ...DEFAULT_SORT }
        propertyStore.updateSort('createdAt', 'desc')
        await propertyStore.fetchProperties({ page: 1 })
    }

    /**
     * 개별 필터 제거
     */
    async function removeFilter(key) {
        const updates = {}

        switch (key) {
            case 'sigungu':
                updates.sigungu = null
                break
            case 'price':
                updates.priceMin = null
                updates.priceMax = null
                break
            case 'area':
                updates.areaMin = null
                updates.areaMax = null
                break
            case 'propertyType':
                updates.propertyType = null
                break
            case 'favoritesOnly':
                updates.favoritesOnly = false
                break
        }

        propertyStore.updateFilters(updates)
        await propertyStore.fetchProperties({ page: 1 })
    }

    // 시/도 변경 시 시/군/구 초기화
    watch(
        () => localFilters.value.sido,
        (next, prev) => {
            if (prev && next !== prev) {
                localFilters.value.sigungu = ''
            }
        }
    )

    return {
        // State
        localFilters,
        localSort,

        // Computed
        availableSigunguOptions,
        filteredCount,
        activeFilterTags,
        activeFilterCount,
        selectedRegionLabel,
        selectedPriceLabel,

        // Constants (re-export for convenience)
        PRICE_PRESETS,
        AREA_PRESETS,

        // Methods
        syncFromStore,
        isPricePresetActive,
        isAreaPresetActive,
        applyPricePreset,
        applyAreaPreset,
        applyFilters,
        resetAllFilters,
        removeFilter
    }
}
