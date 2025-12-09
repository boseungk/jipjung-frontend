/**
 * Navigation Configuration Constants
 */

export const NAV_MENU_ITEMS = [
    { path: '/', icon: 'chartBar', label: '대시보드' },
    { path: '/dsr-simulation', icon: 'calculator', label: 'DSR 분석' },
    { path: '/properties', icon: 'buildings', label: '매물' },
    { path: '/ai-manager', icon: 'chatsCircle', label: 'AI 관리실' },
    { path: '/collection', icon: 'magicWand', label: '컬렉션' }
]

export const COLOR_THEMES = [
    { value: 'warm-beige', label: '베이지', color: '#D4A574' },
    { value: 'cool-gray', label: '그레이', color: '#90A4AE' }
]

export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
}
