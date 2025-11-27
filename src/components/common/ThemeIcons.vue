<template>
  <svg 
    v-if="type === 'sun'" 
    class="theme-icon" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <circle cx="12" cy="12" r="5" stroke="#FFB300" stroke-width="2" fill="#FFD54F"/>
    <path 
      d="M12 1V3M12 21V23M23 12H21M3 12H1M20.5 3.5L19.07 4.93M4.93 19.07L3.5 20.5M20.5 20.5L19.07 19.07M4.93 4.93L3.5 3.5" 
      stroke="#FFB300" 
      stroke-width="2" 
      stroke-linecap="round"
    />
  </svg>
  
  <svg 
    v-else 
    class="theme-icon" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <path 
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
      fill="#5D4037" 
      stroke="#5D4037" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['sun', 'moon'].includes(value)
  }
})
</script>

<style scoped>
.theme-icon {
  transition: all 0.4s ease;
  font-size: 1.25rem;
}
</style>
