<template>
  <nav class="top-nav">
    <!-- Logo -->
    <div class="nav-logo">
      <router-link to="/" class="logo-link">
        <AppIcon name="house" :size="28" weight="fill" color="#FF7F50" class="logo-icon" />
        <span class="logo-text">집-중</span>
      </router-link>
    </div>

    <!-- Desktop Menu -->
    <div
      class="nav-menu"
      v-show="showNavMenu"
      :class="{ 'menu-open': mobileMenuOpen }"
      @click.stop
    >
      <NavMenuItem
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :icon="item.icon"
        :label="item.label"
        @click="mobileMenuOpen = false"
      />
    </div>

    <!--Color Theme Selector -->
    <div class="nav-color-theme">
      <button
        class="color-theme-btn nav-btn-base"
        @click="dropdown.toggle('color')"
        aria-label="색상 테마 선택"
        :aria-expanded="dropdown.isOpen('color')"
      >
        <AppIcon name="palette" :size="20" :active="dropdown.isOpen('color')" class="theme-icon" />
        <PhCaretDown :size="10" weight="bold" class="dropdown-arrow" :class="{ open: dropdown.isOpen('color') }" />
      </button>

      <DropdownMenu :is-open="dropdown.isOpen('color')">
        <button
          v-for="theme in colorThemes"
          :key="theme.value"
          class="dropdown-item-base"
          :class="{ active: currentColorTheme === theme.value }"
          @click="selectColorTheme(theme.value)"
        >
          <span class="color-dot" :style="{ background: theme.color }"></span>
          <span class="color-label">{{ theme.label }}</span>
          <PhCheck v-if="currentColorTheme === theme.value" :size="16" weight="bold" class="check-icon" />
        </button>
      </DropdownMenu>
    </div>

    <!-- Theme Toggle Button -->
    <button
      class="theme-toggle-btn nav-btn-base"
      @click="toggleTheme"
      aria-label="테마 전환"
      title="Day/Night 모드 전환"
    >
      <ThemeIcons :type="isNight ? 'moon' : 'sun'" />
    </button>

    <!-- User Profile Dropdown -->
    <div class="nav-user">
      <button
        class="user-button nav-btn-base"
        @click="dropdown.toggle('user')"
        aria-label="사용자 메뉴"
        :aria-expanded="dropdown.isOpen('user')"
      >
        <AppIcon name="user" :size="20" :active="dropdown.isOpen('user')" class="user-icon" />
        <span class="user-name">{{ userName }}</span>
        <PhCaretDown :size="10" weight="bold" class="dropdown-arrow" :class="{ open: dropdown.isOpen('user') }" />
      </button>

      <DropdownMenu :is-open="dropdown.isOpen('user')">
        <router-link to="/profile" class="dropdown-item-base" @click="dropdown.close()">
          <AppIcon name="gear" :size="18" class="dropdown-icon" />
          <span>프로필 설정</span>
        </router-link>
        <button class="dropdown-item-base" @click="handleLogout">
          <AppIcon name="doorOpen" :size="18" class="dropdown-icon" />
          <span>로그아웃</span>
        </button>
      </DropdownMenu>
    </div>

    <!-- Mobile Hamburger -->
    <button
      class="mobile-hamburger"
      @click.stop="mobileMenuOpen = !mobileMenuOpen"
      aria-label="메뉴 열기/닫기"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PhCaretDown, PhCheck } from '@phosphor-icons/vue'
import { useTheme } from '@/composables/useTheme'
import { useColorTheme } from '@/composables/useColorTheme'
import { useDropdown } from '@/composables/useDropdown'
import { useResponsive } from '@/composables/useResponsive'
import { useAuthStore } from '@/stores/authStore'
import { NAV_MENU_ITEMS, COLOR_THEMES } from '@/constants/navigation'
import AppIcon from './common/AppIcon.vue'
import NavMenuItem from './common/NavMenuItem.vue'
import ThemeIcons from './common/ThemeIcons.vue'
import DropdownMenu from './common/DropdownMenu.vue'

const router = useRouter()
const { isNight, toggleTheme } = useTheme()
const { currentColorTheme, setColorTheme } = useColorTheme()
const dropdown = useDropdown()
const { isMobile } = useResponsive()
const authStore = useAuthStore()

// Data
const menuItems = NAV_MENU_ITEMS
const colorThemes = COLOR_THEMES
const mobileMenuOpen = ref(false)

// Computed
const userName = computed(() => authStore.userName || '사용자')
const showNavMenu = computed(() => !isMobile.value || mobileMenuOpen.value)

// Methods
const selectColorTheme = (theme) => {
  setColorTheme(theme)
  dropdown.close('color')
}

const handleLogout = async () => {
  dropdown.close()
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('로그아웃 실패:', error)
    router.push('/login')
  }
}

// Close dropdowns and mobile menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.nav-user')) {
    dropdown.close('user')
  }
  if (!event.target.closest('.nav-color-theme')) {
    dropdown.close('color')
  }
  if (mobileMenuOpen.value &&
      !event.target.closest('.nav-menu') &&
      !event.target.closest('.mobile-hamburger')) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Shared Button Styles */
.nav-btn-base {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: none;
  border-radius: var(--nav-btn-radius, 20px);
  cursor: pointer;
  transition: var(--nav-btn-transition, all 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  flex-shrink: 0;
}

html[data-theme="day"] .nav-btn-base {
  background: var(--showroom-card-bg-day, #F5EDE3);
  box-shadow:
    3px 3px 6px var(--showroom-shadow-dark-day, #D4C8BD),
    -3px -3px 6px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .nav-btn-base:hover {
  transform: translateY(-2px);
  box-shadow:
    4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .nav-btn-base:active {
  transform: translateY(0);
  box-shadow:
    inset 2px 2px 4px var(--showroom-shadow-dark-day, #D4C8BD),
    inset -2px -2px 4px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="night"] .nav-btn-base {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .nav-btn-base:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

html[data-theme="night"] .nav-btn-base:active {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

/* Shared Dropdown Item Styles */
.dropdown-item-base {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

html[data-theme="day"] .dropdown-item-base {
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .dropdown-item-base:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .dropdown-item-base {
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .dropdown-item-base:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Component-specific Styles */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height, 64px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 10000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode - Subtle Glassmorphism */
html[data-theme="day"] .top-nav {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* Night Mode - Enhanced Glassmorphism */
html[data-theme="night"] .top-nav {
  background: rgba(58, 53, 48, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Logo */
.nav-logo {
  flex-shrink: 0;
  flex: 0 0 auto;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .logo-text {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Desktop Menu */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

/* Theme Toggle & User buttons */
.theme-toggle-btn {
  width: 40px;
  height: 40px;
  margin-right: 0.75rem;
}

.color-theme-btn {
  width: auto;
  height: 40px;
  padding: 0 0.875rem;
  gap: 0.25rem;
}

.user-button {
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-size: 0.9375rem;
  font-weight: 600;
}

/* Color Theme Selector */
.nav-color-theme,
.nav-user {
  position: relative;
  flex-shrink: 0;
}

.nav-color-theme {
  margin-right: 0.75rem;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-label {
  flex: 1;
}

.check-icon {
  font-size: 1rem;
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .check-icon {
  color: var(--showroom-accent-night, #D4A574);
}

.dropdown-arrow {
  font-size: 0.625rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* Mobile Hamburger */
.mobile-hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.hamburger-line {
  width: 24px;
  height: 3px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

html[data-theme="day"] .hamburger-line {
  background: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .hamburger-line {
  background: var(--showroom-text-night, #F5EDE3);
}

/* Responsive */
@media (max-width: 768px) {
  .top-nav {
    padding: 0 1rem;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .nav-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  html[data-theme="day"] .nav-menu {
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  html[data-theme="night"] .nav-menu {
    background: rgba(58, 53, 48, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-menu.menu-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .mobile-hamburger {
    display: flex;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    display: none;
  }
}
</style>
