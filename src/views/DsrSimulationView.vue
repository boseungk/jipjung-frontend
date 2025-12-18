<template>
  <div class="dsr-simulation-view">
    <AuroraBackground />
    <DsrSimulationHeader @back="goBack" />

    <div class="view-container">
      <DsrSection class="current-status" enterDelay="0ms">
        <DsrCurrentStatusSection />
      </DsrSection>

      <DsrSection class="simulation-form" enterDelay="80ms">
        <DsrSimulationFormSection />
      </DsrSection>

      <DsrSimulationResultSection enterDelay="120ms" />
      <DsrSimulationError />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuroraBackground from '@/components/dsr/AuroraBackground.vue'
import DsrSection from '@/components/dsr/DsrSection.vue'
import DsrSimulationHeader from '@/components/dsr/DsrSimulationHeader.vue'
import DsrCurrentStatusSection from '@/components/dsr/DsrCurrentStatusSection.vue'
import DsrSimulationFormSection from '@/components/dsr/DsrSimulationFormSection.vue'
import DsrSimulationResultSection from '@/components/dsr/DsrSimulationResultSection.vue'
import DsrSimulationError from '@/components/dsr/DsrSimulationError.vue'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.dsr-simulation-view {
  position: relative;
  min-height: 100vh;
  background: var(--showroom-bg-day, #f7f8fa);
  padding-bottom: 2rem;
  overflow-x: hidden;

  --dsr-ink: var(--ink-base, #1f2937);
  --dsr-ink-muted: var(--ink-muted, #6b7280);
  --dsr-subcard-bg: rgba(255, 255, 255, 0.7);
  --dsr-subcard-border: rgba(255, 255, 255, 0.6);
  --dsr-warning-bg: rgba(251, 192, 45, 0.16);
  --dsr-warning-fg: #b45309;
  --dsr-safe-bg: rgba(67, 160, 71, 0.14);
  --dsr-safe-fg: #2e7d32;
  --dsr-danger-bg: rgba(244, 67, 54, 0.12);
  --dsr-danger-fg: #c62828;

  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);

  --aurora-orange: rgba(255, 107, 61, 0.25);
  --aurora-yellow: rgba(255, 183, 3, 0.15);
  --aurora-teal: rgba(42, 157, 143, 0.12);
}

html[data-theme='night'] .dsr-simulation-view {
  background: var(--showroom-bg-night, #1a1c20);
  --dsr-ink: var(--showroom-text-night, #f5f6f7);
  --dsr-ink-muted: rgba(245, 246, 247, 0.75);
  --dsr-subcard-bg: rgba(255, 255, 255, 0.08);
  --dsr-subcard-border: rgba(255, 255, 255, 0.12);
  --dsr-warning-bg: rgba(251, 192, 45, 0.14);
  --dsr-warning-fg: #fbbf24;
  --dsr-safe-bg: rgba(67, 160, 71, 0.16);
  --dsr-safe-fg: #86efac;
  --dsr-danger-bg: rgba(244, 67, 54, 0.14);
  --dsr-danger-fg: #fca5a5;

  --glass-bg: rgba(30, 30, 35, 0.75);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);

  --aurora-orange: rgba(255, 107, 61, 0.15);
  --aurora-yellow: rgba(255, 183, 3, 0.1);
  --aurora-teal: rgba(42, 157, 143, 0.08);
}

.view-container {
  position: relative;
  z-index: 1;
  max-width: var(--panel-max-width, 600px);
  margin: 0 auto;
  padding: 1rem;
}
</style>

