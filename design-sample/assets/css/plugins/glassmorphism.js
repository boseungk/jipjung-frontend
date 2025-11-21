const plugin = require('tailwindcss/plugin');

module.exports = plugin(function ({ addComponents, theme }) {
    addComponents({
        // Base glassmorphism surface (Night mode)
        '.glass-surface': {
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid transparent',
            borderTopColor: 'rgba(255, 255, 255, 0.12)',
            borderLeftColor: 'rgba(255, 255, 255, 0.06)',
            boxShadow: theme('boxShadow.glass'),
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },

        // Glass card (interactive)
        '.glass-card': {
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid transparent',
            borderTopColor: 'rgba(255, 255, 255, 0.12)',
            borderLeftColor: 'rgba(255, 255, 255, 0.06)',
            boxShadow: `
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 4px 10px rgba(0, 0, 0, 0.25)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderTopColor: 'rgba(255, 255, 255, 0.15)',
                boxShadow: `
          0 12px 28px rgba(0, 0, 0, 0.4),
          0 6px 14px rgba(0, 0, 0, 0.3),
          0 0 25px var(--showroom-glow-night)
        `,
                transform: 'translateY(-4px)',
            },
            '&:active': {
                background: 'rgba(0, 0, 0, 0.2)',
                borderTopColor: 'rgba(0, 0, 0, 0.1)',
                boxShadow: `
          inset 4px 4px 12px rgba(0, 0, 0, 0.5),
          inset -2px -2px 8px rgba(255, 255, 255, 0.03)
        `,
                transform: 'translateY(2px) scale(0.98)',
            },
        },

        // Glass button
        '.glass-button': {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid transparent',
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            borderLeftColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: `
        0 8px 24px rgba(0, 0, 0, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.2)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderTopColor: 'rgba(255, 255, 255, 0.15)',
                boxShadow: `
          0 12px 28px rgba(0, 0, 0, 0.4),
          0 6px 14px rgba(0, 0, 0, 0.3),
          0 0 25px var(--showroom-glow-night)
        `,
                transform: 'translateY(-4px)',
            },
            '&:active': {
                background: 'rgba(0, 0, 0, 0.2)',
                borderTopColor: 'rgba(0, 0, 0, 0.1)',
                boxShadow: theme('boxShadow.glass-inset'),
                transform: 'translateY(2px) scale(0.98)',
            },
        },

        // Glass accent button
        '.glass-button-accent': {
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.25) 0%, rgba(212, 165, 116, 0.15) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid transparent',
            borderTopColor: 'rgba(255, 255, 255, 0.2)',
            borderLeftColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            boxShadow: `
        0 10px 28px rgba(0, 0, 0, 0.4),
        0 5px 14px rgba(0, 0, 0, 0.25),
        0 0 35px var(--showroom-glow-night)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3) 0%, rgba(212, 165, 116, 0.2) 100%)',
                borderTopColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: `
          0 14px 36px rgba(0, 0, 0, 0.45),
          0 7px 18px rgba(0, 0, 0, 0.3),
          0 0 50px var(--showroom-glow-night),
          0 0 30px var(--light-warm-glow)
        `,
                transform: 'translateY(-4px) scale(1.02)',
            },
            '&:active': {
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                borderTopColor: 'rgba(0, 0, 0, 0.2)',
                boxShadow: theme('boxShadow.glass-inset-deep'),
                transform: 'translateY(2px) scale(0.98)',
            },
        },
    });
});
