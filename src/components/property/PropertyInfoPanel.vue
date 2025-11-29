<template>
  <div class="property-info-panel">
    <PropertyListMode
      v-if="!selectedProperty"
      @openFilters="emit('openFilters')"
    />
    <PropertyDetailMode v-else />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import PropertyListMode from './PropertyListMode.vue'
import PropertyDetailMode from './PropertyDetailMode.vue'

const emit = defineEmits(['openFilters'])

const propertyStore = usePropertyStore()
const { selectedProperty } = storeToRefs(propertyStore)
</script>

<style scoped>
.property-info-panel {
  width: 100%;
  height: 100%;
  background: var(--showroom-bg-day);
  overflow: hidden;
}

html[data-theme="night"] .property-info-panel {
  background: var(--showroom-bg-night);
}
</style>
