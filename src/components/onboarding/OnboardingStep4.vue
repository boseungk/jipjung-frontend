<template>
  <div class="onboarding-step">
    <h2 class="step-title">희망 지역을 선택하세요</h2>
    <p class="step-description">최대 3곳까지 선택 가능합니다</p>

    <!-- Selected Areas -->
    <div v-if="localAreas.length > 0" class="selected-areas">
      <div
        v-for="(area, index) in localAreas"
        :key="`${area.sido}-${area.sigungu}`"
        class="area-chip"
      >
        <span class="area-text">{{ formatRegion(area) }}</span>
        <button 
          @click="removeArea(index)" 
          class="remove-btn" 
          type="button"
          :aria-label="`${formatRegion(area)} 제거`"
        >
          <PhX :size="16" weight="bold" />
        </button>
      </div>
    </div>

    <!-- Area Selector -->
    <div v-if="localAreas.length < VALIDATION.PREFERRED_AREAS.MAX" class="area-selector">
      <CustomDropdown
        v-model="selectedSido"
        :options="sidoOptions"
        placeholder="시/도 선택"
        label="시/도 선택"
        class="area-dropdown"
      />

      <CustomDropdown
        v-model="selectedSigungu"
        :options="sigunguOptions"
        :disabled="!selectedSido"
        placeholder="구/군 선택"
        label="구/군 선택"
        class="area-dropdown"
      />

      <button
        @click="addArea"
        :disabled="!selectedSido || !selectedSigungu"
        class="add-btn"
        type="button"
      >
        추가
      </button>
    </div>

    <div v-else class="max-areas-message" role="status">
      {{ VALIDATION.PREFERRED_AREAS.SUCCESS_MAX }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhX } from '@phosphor-icons/vue'
import CustomDropdown from '@/components/common/CustomDropdown.vue'
import { 
  SIDO_LIST, 
  getSigunguList, 
  formatRegion 
} from '@/constants/regions'
import { VALIDATION } from '@/constants/onboardingConstants'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedSido = ref('')
const selectedSigungu = ref('')

// Convert arrays to dropdown options format
const sidoOptions = computed(() => {
  return SIDO_LIST.map(sido => ({
    value: sido,
    label: sido
  }))
})

const sigunguOptions = computed(() => {
  if (!selectedSido.value) return []
  const sigunguList = getSigunguList(selectedSido.value)
  return sigunguList.map(sigungu => ({
    value: sigungu,
    label: sigungu
  }))
})

const localAreas = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

function addArea() {
  if (selectedSido.value && selectedSigungu.value && localAreas.value.length < VALIDATION.PREFERRED_AREAS.MAX) {
    // Check for duplicates
    const isDuplicate = localAreas.value.some(
      area => area.sido === selectedSido.value && area.sigungu === selectedSigungu.value
    )

    if (!isDuplicate) {
      localAreas.value = [
        ...localAreas.value,
        {
          sido: selectedSido.value,
          sigungu: selectedSigungu.value
        }
      ]
      selectedSido.value = ''
      selectedSigungu.value = ''
    }
  }
}

function removeArea(index) {
  localAreas.value = localAreas.value.filter((_, i) => i !== index)
}
</script>

<style scoped>
.onboarding-step {
  text-align: center;
  padding: 1rem 0;
  max-width: 650px;
  margin: 0 auto;
}

.step-title {
  text-align: center;
  font-size: var(--onboarding-font-title-size);
  font-weight: var(--onboarding-font-title-weight);
  letter-spacing: var(--onboarding-font-title-spacing);
  color: var(--onboarding-text-primary);
  margin-bottom: 1rem;
}

.step-description {
  text-align: center;
  font-size: var(--onboarding-font-body-size);
  font-weight: var(--onboarding-font-body-weight);
  color: var(--onboarding-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.selected-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
  min-height: 48px;
}

.area-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--onboarding-primary);
  color: white;
  border-radius: var(--onboarding-radius-full);
  font-size: 0.9375rem;
  font-weight: 600;
  box-shadow: var(--onboarding-shadow-floating);
  animation: chip-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes chip-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.area-text {
  line-height: 1;
}

.remove-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--onboarding-transition-fast);
  padding: 0;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.15);
}

.area-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.area-dropdown {
  flex: 1;
  min-width: 160px;
}

.add-btn {
  padding: 0.625rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--onboarding-radius-md);
  cursor: pointer;
  
  /* Coral button with glow */
  background: var(--onboarding-primary);
  color: white;
  box-shadow: var(--onboarding-shadow-glow);
  
  transition: var(--onboarding-transition-bounce);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--onboarding-shadow-glow-strong);
}

.add-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.max-areas-message {
  text-align: center;
  padding: 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--onboarding-text-secondary);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .step-title {
    font-size: 1.625rem;
  }
  
  .step-description {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .area-selector {
    flex-direction: column;
  }

  .area-dropdown {
    min-width: 100%;
  }
  
  .add-btn {
    width: 100%;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .area-chip {
    animation: none;
  }
  
  .add-btn,
  .remove-btn {
    transition: none;
  }
}
</style>
