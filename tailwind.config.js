/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="night"]'],
  theme: {
    extend: {
      colors: {
        // Dynamic colors using CSS variables
        showroom: {
          bg: {
            day: 'var(--showroom-bg-day)',
            night: 'var(--showroom-bg-night)',
          },
          card: {
            day: 'var(--showroom-card-bg-day)',
            night: 'var(--showroom-card-bg-night)',
          },
          accent: {
            day: 'var(--showroom-accent-day)',
            night: 'var(--showroom-accent-night)',
          },
          text: {
            day: 'var(--showroom-text-day)',
            night: 'var(--showroom-text-night)',
          },
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      boxShadow: {
        // Neumorphism shadows (Day mode)
        'neu-sm': '6px 6px 12px var(--neu-shadow-dark-day), -6px -6px 12px var(--neu-shadow-light-day)',
        'neu': '8px 8px 16px var(--neu-shadow-dark-day), -8px -8px 16px var(--neu-shadow-light-day)',
        'neu-lg': '10px 10px 20px var(--neu-shadow-dark-day), -10px -10px 20px var(--neu-shadow-light-day)',
        'neu-xl': '12px 12px 24px var(--neu-shadow-dark-day), -12px -12px 24px var(--neu-shadow-light-day)',
        'neu-inset': 'inset 6px 6px 12px var(--neu-shadow-dark-day), inset -6px -6px 12px var(--neu-shadow-light-day)',
        'neu-inset-deep': 'inset 8px 8px 16px rgba(0, 0, 0, 0.25), inset -8px -8px 16px rgba(255, 255, 255, 0.2)',

        // Glassmorphism shadows (Night mode)
        'glass': '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 12px 28px rgba(0, 0, 0, 0.4), 0 6px 14px rgba(0, 0, 0, 0.3)',
        'glass-xl': '0 14px 36px rgba(0, 0, 0, 0.45), 0 7px 18px rgba(0, 0, 0, 0.3)',
        'glass-inset': 'inset 4px 4px 12px rgba(0, 0, 0, 0.5), inset -2px -2px 8px rgba(255, 255, 255, 0.03)',
        'glass-inset-deep': 'inset 6px 6px 16px rgba(0, 0, 0, 0.6), inset -3px -3px 10px rgba(255, 255, 255, 0.04)',

        // Crystal ball specific shadows
        'crystal-day': 'inset -10px -10px 20px rgba(255, 255, 255, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.2), inset 10px 10px 40px rgba(0, 0, 0, 0.05), 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        'crystal-night': 'inset -20px -20px 60px rgba(0, 0, 0, 0.9), inset 10px 10px 40px rgba(255, 214, 170, 0.4), inset 5px 5px 20px rgba(200, 230, 255, 0.3), inset 0 40px 30px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 214, 170, 0.2), 0 20px 50px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'glass': '10px',
        'glass-strong': '12px',
      },
      animation: {
        'glass-shimmer-day': 'glass-shimmer-day 8s infinite alternate ease-in-out',
        'glass-shimmer-night': 'glass-shimmer-night 6s infinite alternate ease-in-out',
        'ambient-pulse': 'ambient-pulse 6s ease-in-out infinite',
        'uplight-breathe': 'uplight-breathe 8s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out',
        'lamp-flicker': 'lamp-flicker 4s ease-in-out infinite',
        'ambient-breathe': 'ambient-breathe 6s ease-in-out infinite',
      },
      keyframes: {
        'glass-shimmer-day': {
          '0%': {
            boxShadow: 'inset -20px -20px 50px rgba(0, 0, 0, 0.15), inset 10px 10px 30px rgba(255, 255, 255, 0.8), 0 20px 40px rgba(0, 0, 0, 0.15)',
          },
          '100%': {
            boxShadow: 'inset -20px -20px 50px rgba(0, 0, 0, 0.2), inset 15px 15px 40px rgba(255, 255, 255, 0.9), 0 25px 50px rgba(0, 0, 0, 0.2)',
          },
        },
        'glass-shimmer-night': {
          '0%': {
            boxShadow: 'inset -20px -20px 60px rgba(0, 0, 0, 0.9), inset 10px 10px 40px rgba(255, 214, 170, 0.3), 0 0 30px rgba(255, 214, 170, 0.1)',
          },
          '100%': {
            boxShadow: 'inset -20px -20px 60px rgba(0, 0, 0, 0.9), inset 12px 12px 50px rgba(255, 214, 170, 0.5), 0 0 40px rgba(255, 214, 170, 0.3)',
          },
        },
        'ambient-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'uplight-breathe': {
          '0%, 100%': {
            opacity: '0.8',
            transform: 'scaleY(1)',
          },
          '50%': {
            opacity: '1',
            transform: 'scaleY(1.05)',
          },
        },
        shimmer: {
          '0%': {
            transform: 'translate(-100%, -100%)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translate(100%, 100%)',
            opacity: '0',
          },
        },
        'lamp-flicker': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.95' },
          '75%': { opacity: '0.85' },
        },
        'ambient-breathe': {
          '0%, 100%': {
            opacity: '0.7',
            transform: 'translateX(-50%) scale(1)',
          },
          '50%': {
            opacity: '0.85',
            transform: 'translateX(-50%) scale(1.05)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionTimingFunction: {
        'showroom': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('./src/assets/css/plugins/neumorphism'),
    require('./src/assets/css/plugins/glassmorphism'),
  ],
}
