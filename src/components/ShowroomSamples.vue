<script setup>
import { PhCalendarBlank, PhTrophy } from '@phosphor-icons/vue'
import { BRAND_ACCENT } from '@/constants/colors'

const brandAccent = BRAND_ACCENT
</script>

<template>
  <div class="showroom-samples">
    <!-- Price Card -->
    <div class="showroom-price">
      <div>
        <div class="amount">₩500만</div>
        <div class="label">목표 저축 금액</div>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="showroom-info">
      <div class="showroom-info-item">
        <div class="icon">
          <AppIcon name="house" :size="20" />
        </div>
        <div class="value">85%</div>
        <div class="label">달성률</div>
      </div>
      <div class="showroom-info-item">
        <div class="icon">
          <PhCalendarBlank :size="20" weight="duotone" />
        </div>
        <div class="value">127일</div>
        <div class="label">진행 기간</div>
      </div>
      <div class="showroom-info-item">
        <div class="icon">
          <AppIcon name="piggyBank" :size="20" />
        </div>
        <div class="value">₩425만</div>
        <div class="label">현재 저축액</div>
      </div>
      <div class="showroom-info-item">
        <div class="icon">
          <PhTrophy :size="20" weight="fill" :color="brandAccent" />
        </div>
        <div class="value">₩75만</div>
        <div class="label">남은 금액</div>
      </div>
    </div>

    <!-- Experience Button -->
    <div class="centered-container">
      <button class="showroom-experience-btn" tabindex="0" aria-label="쇼룸 체험하기">
        <span aria-hidden="true">💫</span>
        <span>체험하기</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.showroom-samples {
  max-width: 700px;
  margin: 3rem auto 0;
}

.centered-container {
  text-align: center;
}

/* Styles imported from concept-2-showroom.css */
/* These classes are defined in the imported CSS files */
</style>
