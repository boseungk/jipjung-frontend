<template>
  <div class="nav-user" ref="rootRef">
    <button
      class="user-button nav-btn-base"
      @click="$emit('toggle-user-dropdown')"
      aria-label="사용자 메뉴"
      :aria-expanded="isUserOpen"
    >
      <AppIcon name="user" :size="20" :active="isUserOpen" class="user-icon" />
      <span class="user-name">{{ userName }}</span>
      <PhCaretDown :size="10" weight="bold" class="dropdown-arrow" :class="{ open: isUserOpen }" />
    </button>

    <DropdownMenu :is-open="isUserOpen">
      <router-link to="/profile" class="dropdown-item-base" @click="$emit('close-user-dropdown')">
        <AppIcon name="gear" :size="18" class="dropdown-icon" />
        <span>프로필 설정</span>
      </router-link>
      <button class="dropdown-item-base" @click="$emit('logout')">
        <AppIcon name="doorOpen" :size="18" class="dropdown-icon" />
        <span>로그아웃</span>
      </button>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PhCaretDown } from '@phosphor-icons/vue'
import AppIcon from '../common/AppIcon.vue'
import DropdownMenu from '../common/DropdownMenu.vue'

defineProps({
  userName: {
    type: String,
    required: true
  },
  isUserOpen: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-user-dropdown', 'close-user-dropdown', 'logout'])

const rootRef = ref(null)
defineExpose({ rootEl: rootRef })
</script>

<style scoped>
.nav-user {
  position: relative;
  flex-shrink: 0;
}

.user-button {
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-size: 0.9375rem;
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 0.625rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>
