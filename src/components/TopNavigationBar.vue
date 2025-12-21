<template>
  <nav class="top-nav">
    <!-- Logo -->
    <div class="nav-logo">
      <router-link to="/" class="logo-link">
        <img src="@/assets/images/brand-name.webp" alt="집-중" class="logo-image" />
      </router-link>
    </div>

    <NavMenu
      :items="menuItems"
      :show-nav-menu="showNavMenu"
      :mobile-menu-open="mobileMenuOpen"
      @item-selected="mobileMenuOpen = false"
      ref="navMenuRef"
      id="primary-navigation"
    />

    <div class="nav-actions">
      <ThemeControls
        :is-night="isNight"
        @toggle-theme="toggleTheme"
      />

      <UserMenu
        :user-name="userName"
        :is-user-open="isUserOpen"
        @toggle-user-dropdown="dropdown.toggle(DROPDOWNS.USER)"
        @close-user-dropdown="dropdown.close(DROPDOWNS.USER)"
        @logout="handleLogout"
        ref="userMenuRef"
      />
    </div>


    <!-- Mobile Hamburger -->
    <button
      class="mobile-hamburger"
      type="button"
      @click.stop="mobileMenuOpen = !mobileMenuOpen"
      aria-label="메뉴 열기/닫기"
      :aria-expanded="mobileMenuOpen"
      aria-controls="primary-navigation"
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
import { useDropdown } from '@/composables/useDropdown'
import { useResponsive } from '@/composables/useResponsive'
import { useAuthStore } from '@/stores/authStore'
import { NAV_MENU_ITEMS } from '@/constants/navigation'
import NavMenu from './navigation/NavMenu.vue'
import ThemeControls from './navigation/ThemeControls.vue'
import UserMenu from './navigation/UserMenu.vue'

const route = useRoute()
const router = useRouter()
const { isNight, toggleTheme } = useTheme()
const dropdown = useDropdown()
const { isMobile } = useResponsive()
const authStore = useAuthStore()

const DROPDOWNS = {
  USER: 'user'
}

// Data
const menuItems = NAV_MENU_ITEMS
const mobileMenuOpen = ref(false)
const navMenuRef = ref(null)
const userMenuRef = ref(null)
const mobileHamburgerRef = ref(null)

// Computed
const userName = computed(() => authStore.userName)
const showNavMenu = computed(() => !isMobile.value || mobileMenuOpen.value)
const isUserOpen = computed(() => dropdown.isOpen(DROPDOWNS.USER))

const closeAllMenus = () => {
  dropdown.close()
  mobileMenuOpen.value = false
}

// Close menus on navigation
watch(() => route.fullPath, () => {
  closeAllMenus()
})

// Reset mobile menu when viewport changes
watch(isMobile, () => {
  mobileMenuOpen.value = false
})

// Methods
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('로그아웃 실패:', error)
  } finally {
    closeAllMenus()
    router.push('/login')
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeAllMenus()
  }
}

const getExposedElement = (componentRef, key) => {
  const exposed = componentRef.value?.[key]
  return exposed?.value ?? exposed ?? null
}

// Close dropdowns and mobile menu when clicking outside
const handleClickOutside = (event) => {
  const target = event.target

  if (typeof Node !== 'undefined' && !(target instanceof Node)) return

  const userEl = getExposedElement(userMenuRef, 'rootEl')
  const navMenuEl = getExposedElement(navMenuRef, 'rootEl')
  const hamburgerEl = mobileHamburgerRef.value

  if (userEl && !userEl.contains(target)) {
    dropdown.close(DROPDOWNS.USER)
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
  transition:
    background var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, cubic-bezier(0.4, 0, 0.2, 1)),
    border-color var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, cubic-bezier(0.4, 0, 0.2, 1)),
    box-shadow var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, cubic-bezier(0.4, 0, 0.2, 1));
  overflow: visible;
}

.top-nav::after {
  content: '';
  position: absolute;
  left: 35%;
  right: 35%;
  bottom: -10px;
  height: 16px;
  background: radial-gradient(55% 70% at 50% 0%, rgba(var(--brand-accent-rgb, 255, 107, 61), 0.22), rgba(255, 255, 255, 0));
  filter: blur(10px);
  pointer-events: none;
  z-index: -1;
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

.logo-image {
  height: 44px;
  width: auto;
  object-fit: contain;
}

html[data-theme="night"] .logo-image {
  filter: brightness(1.1);
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
  transition: background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
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

  .logo-image {
    height: 28px;
  }

  .mobile-hamburger {
    display: flex;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 24px;
  }
}
</style>
