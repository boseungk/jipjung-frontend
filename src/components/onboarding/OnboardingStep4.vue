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
        <span class="area-text">{{ area.sido }} {{ area.sigungu }}</span>
        <button @click="removeArea(index)" class="remove-btn" type="button">×</button>
      </div>
    </div>

    <!-- Area Selector -->
    <div v-if="localAreas.length < 3" class="area-selector">
      <select v-model="selectedSido" class="area-select">
        <option value="">시/도 선택</option>
        <option v-for="sido in sidoList" :key="sido" :value="sido">
          {{ sido }}
        </option>
      </select>

      <select
        v-model="selectedSigungu"
        :disabled="!selectedSido"
        class="area-select"
      >
        <option value="">구/군 선택</option>
        <option v-for="sigungu in sigunguList" :key="sigungu" :value="sigungu">
          {{ sigungu }}
        </option>
      </select>

      <button
        @click="addArea"
        :disabled="!selectedSido || !selectedSigungu"
        class="add-btn"
        type="button"
      >
        추가
      </button>
    </div>

    <div v-else class="max-areas-message">
      최대 3개 지역까지 선택하셨습니다
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedSido = ref('')
const selectedSigungu = ref('')

// 시/도 목록
const sidoList = [
  '서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시',
  '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
  '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전라남도',
  '경상북도', '경상남도', '제주특별자치도'
]

// 시/도별 구/군 맵
const sigunguMap = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기도': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '인천광역시': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '부산광역시': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
  '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
  '세종특별자치시': ['세종시'],
  '강원특별자치도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
  '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
  '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
  '전북특별자치도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
  '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경상북도': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
  '경상남도': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
  '제주특별자치도': ['서귀포시', '제주시']
}

const sigunguList = computed(() => {
  return sigunguMap[selectedSido.value] || []
})

const localAreas = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

function addArea() {
  if (selectedSido.value && selectedSigungu.value && localAreas.value.length < 3) {
    // 중복 체크
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
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--showroom-text-day, #3E2723);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

html[data-theme="night"] .step-title {
  color: var(--showroom-text-night, #FFFFFF);
}

.step-description {
  text-align: center;
  font-size: 1.0625rem;
  color: var(--showroom-text-secondary-day, #6D4C41);
  margin-bottom: 2rem;
  line-height: 1.6;
}

html[data-theme="night"] .step-description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
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
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  border-radius: 24px;
  font-size: 0.9375rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

html[data-theme="night"] .area-chip {
  background: var(--showroom-accent-night, #D4A574);
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
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50%;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.area-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.area-select {
  flex: 1;
  min-width: 160px;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 2px solid rgba(93, 64, 55, 0.15);
  border-radius: 10px;
  background: #EEF0F2;
  color: var(--showroom-text-day, #5D4037);
  transition: all 0.25s ease;
  cursor: pointer;
}

.area-select:focus {
  outline: none;
  border-color: var(--showroom-accent-day, #D4A574);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.area-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="night"] .area-select {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  border-color: rgba(245, 237, 227, 0.2);
}

html[data-theme="night"] .area-select:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.add-btn {
  padding: 0.625rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="night"] .add-btn {
  background: var(--showroom-accent-night, #D4A574);
}

.max-areas-message {
  text-align: center;
  padding: 1rem;
  font-size: 0.9375rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .max-areas-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

@media (max-width: 640px) {
  .area-selector {
    flex-direction: column;
  }

  .area-select {
    min-width: 100%;
  }
}
</style>
