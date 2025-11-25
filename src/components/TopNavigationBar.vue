<template>
  <nav class="top-nav">
    <!-- Logo -->
    <div class="nav-logo">
      <router-link to="/" class="logo-link">
        <span class="logo-icon">🏠</span>
        <span class="logo-text">집-중</span>
      </router-link>
    </div>

    <!-- Desktop Menu -->
    <div class="nav-menu" :class="{ 'menu-open': mobileMenuOpen }">
      <router-link
        to="/"
        class="nav-menu-item"
        :class="{ active: $route.path === '/' }"
        @click="closeMobileMenu"
      >
        <span class="menu-icon">📊</span>
        <span class="menu-label">대시보드</span>
      </router-link>

      <router-link
        to="/properties"
        class="nav-menu-item"
        :class="{ active: $route.path === '/properties' }"
        @click="closeMobileMenu"
      >
        <span class="menu-icon">🏘️</span>
        <span class="menu-label">매물</span>
      </router-link>

      <router-link
        to="/collection"
        class="nav-menu-item"
        :class="{ active: $route.path === '/collection' }"
        @click="closeMobileMenu"
      >
        <span class="menu-icon">🔮</span>
        <span class="menu-label">컬렉션</span>
      </router-link>
    </div>

    <!-- Theme Toggle Button -->
    <button
      class="theme-toggle-btn"
      @click="toggleTheme"
      aria-label="테마 전환"
      title="Day/Night 모드 전환"
    >
      <!-- Sun Icon (Day Mode) -->
      <svg
        v-if="!isNight"
        class="theme-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="5" stroke="#FFB300" stroke-width="2" fill="#FFD54F"/>
        <path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.5 3.5L19.07 4.93M4.93 19.07L3.5 20.5M20.5 20.5L19.07 19.07M4.93 4.93L3.5 3.5" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <!-- Moon Icon (Night Mode) -->
      <svg
        v-else
        class="theme-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#5D4037" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- User Profile Dropdown -->
    <div class="nav-user">
      <button
        class="user-button"
        @click="toggleUserMenu"
        aria-label="사용자 메뉴"
        aria-haspopup="true"
        :aria-expanded="userMenuOpen"
      >
        <span class="user-icon">👤</span>
        <span class="user-name">{{ userName }}</span>
        <span class="dropdown-arrow" :class="{ open: userMenuOpen }">▼</span>
      </button>

      <!-- Dropdown Menu -->
      <transition name="dropdown">
        <div v-if="userMenuOpen" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
            <span class="dropdown-icon">⚙️</span>
            <span>프로필 설정</span>
          </router-link>
          <button class="dropdown-item" @click="handleLogout">
            <span class="dropdown-icon">🚪</span>
            <span>로그아웃</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- Mobile Hamburger -->
    <button
      class="mobile-hamburger"
      @click="toggleMobileMenu"
      aria-label="메뉴 열기/닫기"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const { isNight, toggleTheme } = useTheme()

// User info (temporary - replace with actual user store)
const userName = ref('사용자')

// Menu states
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogout = () => {
  closeUserMenu()
  // TODO: Implement logout logic
  console.log('로그아웃')
  router.push('/login')
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.nav-user')) {
    closeUserMenu()
  }
  if (!event.target.closest('.nav-menu') && !event.target.closest('.mobile-hamburger')) {
    closeMobileMenu()
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
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
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

/* Desktop Menu - Centered */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

/* Right Section Container */
.theme-toggle-btn,
.nav-user {
  flex: 0 0 auto;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode Menu Items */
html[data-theme="day"] .nav-menu-item {
  color: var(--showroom-text-day, #5D4037);
  background: transparent;
}

html[data-theme="day"] .nav-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="day"] .nav-menu-item.active {
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

/* Night Mode Menu Items */
html[data-theme="night"] .nav-menu-item {
  color: var(--showroom-text-night, #F5EDE3);
  background: transparent;
}

html[data-theme="night"] .nav-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

html[data-theme="night"] .nav-menu-item.active {
  background: rgba(212, 165, 116, 0.2);
  color: var(--showroom-accent-night, #D4A574);
  box-shadow: 0 2px 12px rgba(212, 165, 116, 0.3);
}

.menu-icon {
  font-size: 1.125rem;
}

/* Theme Toggle Button */
.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-right: 0.75rem;
}

html[data-theme="day"] .theme-toggle-btn {
  background: var(--showroom-card-bg-day, #F5EDE3);
  box-shadow:
    3px 3px 6px var(--showroom-shadow-dark-day, #D4C8BD),
    -3px -3px 6px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .theme-toggle-btn:active {
  transform: translateY(0);
  box-shadow:
    inset 2px 2px 4px var(--showroom-shadow-dark-day, #D4C8BD),
    inset -2px -2px 4px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="night"] .theme-toggle-btn {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

html[data-theme="night"] .theme-toggle-btn:active {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

.theme-icon {
  transition: all 0.4s ease;
}

/* User Dropdown */
.nav-user {
  position: relative;
  flex-shrink: 0;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode User Button */
html[data-theme="day"] .user-button {
  background: var(--showroom-card-bg-day, #F5EDE3);
  color: var(--showroom-text-day, #5D4037);
  box-shadow:
    3px 3px 6px var(--showroom-shadow-dark-day, #D4C8BD),
    -3px -3px 6px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .user-button:hover {
  transform: translateY(-2px);
  box-shadow:
    4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .user-button:active {
  transform: translateY(0);
  box-shadow:
    inset 2px 2px 4px var(--showroom-shadow-dark-day, #D4C8BD),
    inset -2px -2px 4px var(--showroom-shadow-light-day, #FFFFFF);
}

/* Night Mode User Button */
html[data-theme="night"] .user-button {
  background: rgba(255, 255, 255, 0.06);
  color: var(--showroom-text-night, #F5EDE3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .user-button:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

html[data-theme="night"] .user-button:active {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

.user-icon {
  font-size: 1.25rem;
}

.dropdown-arrow {
  font-size: 0.625rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

html[data-theme="day"] .user-dropdown {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .user-dropdown {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item {
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

html[data-theme="day"] .dropdown-item {
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .dropdown-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .dropdown-item {
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-icon {
  font-size: 1.125rem;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

  .nav-menu-item {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
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
