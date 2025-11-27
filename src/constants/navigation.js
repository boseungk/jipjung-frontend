/**
 * Navigation Configuration Constants
 */

export const NAV_MENU_ITEMS = [
    { path: '/', icon: 'chartBar', label: '대시보드' },
    { path: '/properties', icon: 'buildings', label: '매물' },
    { path: '/collection', icon: 'magicWand', label: '컬렉션' }
]

export const COLOR_THEMES = [
    { value: 'warm-beige', label: '베이지', color: '#D4A574' },
    { value: 'olive-green', label: '올리브 그린', color: '#8D9F87' },
    { value: 'cool-gray', label: '그레이', color: '#90A4AE' },
    { value: 'sky-blue', label: '스카이 블루', color: '#64B5F6' }
]

export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
}
