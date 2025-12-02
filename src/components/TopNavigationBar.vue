<template>
  <nav class="top-nav" ref="navRef">
    <!-- Logo -->
    <div class="nav-logo">
      <router-link to="/" class="logo-link">
        <AppIcon name="house" :size="28" weight="fill" :color="brandAccent" class="logo-icon" />
        <span class="logo-text">집-중</span>
      </router-link>
    </div>

    <NavMenu
      :items="menuItems"
      :show-nav-menu="showNavMenu"
      :mobile-menu-open="mobileMenuOpen"
      @item-selected="mobileMenuOpen = false"
      ref="navMenuRef"
    />

    <div class="nav-actions">
      <ThemeControls
        :color-themes="colorThemes"
        :current-color-theme="currentColorTheme"
        :is-color-open="isColorOpen"
        :is-night="isNight"
        @toggle-color-dropdown="dropdown.toggle('color')"
        @select-color-theme="selectColorTheme"
        @toggle-theme="toggleTheme"
        ref="themeControlsRef"
      />

      <UserMenu
        :user-name="userName"
        :is-user-open="isUserOpen"
        @toggle-user-dropdown="dropdown.toggle('user')"
        @close-user-dropdown="dropdown.close('user')"
        @logout="handleLogout"
        ref="userMenuRef"
      />
    </div>


    <!-- Mobile Hamburger -->
    <button
      class="mobile-hamburger"
      @click.stop="mobileMenuOpen = !mobileMenuOpen"
      aria-label="메뉴 열기/닫기"
      ref="mobileHamburgerRef"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useColorTheme } from '@/composables/useColorTheme'
import { useDropdown } from '@/composables/useDropdown'
import { useResponsive } from '@/composables/useResponsive'
import { useAuthStore } from '@/stores/authStore'
import { NAV_MENU_ITEMS, COLOR_THEMES } from '@/constants/navigation'
import { BRAND_ACCENT } from '@/constants/colors'
import AppIcon from './common/AppIcon.vue'
import NavMenu from './navigation/NavMenu.vue'
import ThemeControls from './navigation/ThemeControls.vue'
import UserMenu from './navigation/UserMenu.vue'

const route = useRoute()
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
const brandAccent = BRAND_ACCENT
const navRef = ref(null)
const navMenuRef = ref(null)
const themeControlsRef = ref(null)
const userMenuRef = ref(null)
const mobileHamburgerRef = ref(null)

// Computed
const userName = computed(() => authStore.userName || '사용자')
const showNavMenu = computed(() => !isMobile.value || mobileMenuOpen.value)
const isColorOpen = computed(() => dropdown.isOpen('color'))
const isUserOpen = computed(() => dropdown.isOpen('user'))

// Close menus on navigation
watch(() => route.fullPath, () => {
  dropdown.close()
  mobileMenuOpen.value = false
})

// Reset mobile menu when viewport changes
watch(isMobile, () => {
  mobileMenuOpen.value = false
})

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

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    dropdown.close()
    mobileMenuOpen.value = false
  }
}

const getElement = (targetRef) => targetRef.value?.$el ?? targetRef.value ?? null
const getExposedElement = (componentRef, key) => {
  const exposed = componentRef.value?.[key]
  return exposed?.value ?? exposed ?? null
}

// Close dropdowns and mobile menu when clicking outside
const handleClickOutside = (event) => {
  const target = event.target
  const userEl = getExposedElement(userMenuRef, 'rootEl')
  const colorMenuEl = getExposedElement(themeControlsRef, 'colorMenuEl')
  const navMenuEl = getElement(navMenuRef)
  const hamburgerEl = mobileHamburgerRef.value

  if (userEl && !userEl.contains(target)) {
    dropdown.close('user')
  }
  if (colorMenuEl && !colorMenuEl.contains(target)) {
    dropdown.close('color')
  }
  if (
    mobileMenuOpen.value &&
    navMenuEl &&
    !navMenuEl.contains(target) &&
    (!hamburgerEl || !hamburgerEl.contains(target))
  ) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
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

/* Day Mode - Beige Tone-on-Tone */
html[data-theme="day"] .top-nav {
  background: var(--nav-bg-day); /* Light Latte Beige */
  border-bottom: 1px solid var(--nav-border-day); /* Subtle darker border */
  box-shadow: var(--nav-shadow-day); /* Soft ground shadow */
}

/* Night Mode - Enhanced Glassmorphism */
html[data-theme="night"] .top-nav {
  background: var(--nav-bg-night);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--nav-border-night);
  box-shadow: var(--nav-shadow-night);
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
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
  background: var(--nav-hamburger-day);
}

html[data-theme="night"] .hamburger-line {
  background: var(--nav-hamburger-night);
}

/* Responsive */
@media (max-width: 768px) {
  .top-nav {
    padding: 0 1rem;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .mobile-hamburger {
    display: flex;
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
