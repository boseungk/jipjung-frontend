const plugin = require('tailwindcss/plugin');

module.exports = plugin(function ({ addComponents, theme }) {
    addComponents({
        // Base neumorphic surface (Day mode)
        '.neu-surface': {
            background: 'linear-gradient(145deg, var(--showroom-card-bg-day) 0%, rgba(255, 255, 255, 0.95) 100%)',
            boxShadow: theme('boxShadow.neu'),
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },

        // Neumorphic button
        '.neu-button': {
            background: 'linear-gradient(145deg, var(--showroom-card-bg-day) 0%, rgba(255, 255, 255, 0.95) 100%)',
            boxShadow: `
        8px 8px 16px var(--neu-shadow-dark-day),
        -8px -8px 16px var(--neu-shadow-light-day),
        inset 2px 2px 4px rgba(255, 255, 255, 0.5),
        inset -2px -2px 4px rgba(0, 0, 0, 0.05)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                boxShadow: `
          10px 10px 20px var(--neu-shadow-dark-day),
          -10px -10px 20px var(--neu-shadow-light-day),
          inset 1px 1px 2px rgba(255, 255, 255, 0.8),
          inset -1px -1px 2px rgba(0, 0, 0, 0.05)
        `,
                transform: 'translateY(-4px)',
            },
            '&:active': {
                boxShadow: `
          inset 6px 6px 12px var(--neu-shadow-dark-day),
          inset -6px -6px 12px var(--neu-shadow-light-day),
          inset 2px 2px 4px rgba(0, 0, 0, 0.1)
        `,
                transform: 'scale(0.97)',
            },
        },

        // Neumorphic card (interactive)
        '.neu-card': {
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, var(--showroom-card-bg-day) 100%)',
            boxShadow: `
        8px 8px 16px var(--neu-shadow-dark-day),
        -8px -8px 16px var(--neu-shadow-light-day),
        inset 1px 1px 2px rgba(255, 255, 255, 0.7),
        inset -1px -1px 2px rgba(0, 0, 0, 0.03)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
                boxShadow: `
          10px 10px 20px var(--neu-shadow-dark-day),
          -10px -10px 20px var(--neu-shadow-light-day),
          inset 1px 1px 2px rgba(255, 255, 255, 0.8),
          inset -1px -1px 2px rgba(0, 0, 0, 0.05)
        `,
                transform: 'translateY(-4px)',
            },
            '&:active': {
                boxShadow: `
          inset 6px 6px 12px var(--neu-shadow-dark-day),
          inset -6px -6px 12px var(--neu-shadow-light-day),
          inset 2px 2px 4px rgba(0, 0, 0, 0.1)
        `,
                transform: 'scale(0.97)',
            },
        },

        // Neumorphic input/inset
        '.neu-inset': {
            background: 'var(--showroom-bg-day)',
            boxShadow: theme('boxShadow.neu-inset'),
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:focus': {
                boxShadow: `
          inset 6px 6px 12px var(--neu-shadow-dark-day),
          inset -6px -6px 12px var(--neu-shadow-light-day),
          0 0 0 3px rgba(191, 175, 158, 0.3)
        `,
                outline: 'none',
            },
        },

        // Accent neumorphic button
        '.neu-button-accent': {
            background: 'linear-gradient(145deg, var(--showroom-accent-day) 0%, color-mix(in srgb, var(--showroom-accent-day) 85%, black) 100%)',
            color: 'white',
            boxShadow: `
        10px 10px 20px var(--neu-shadow-dark-day),
        -10px -10px 20px var(--neu-shadow-light-day)
      `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                boxShadow: `
          12px 12px 24px var(--neu-shadow-dark-day),
          -12px -12px 24px var(--neu-shadow-light-day)
        `,
                transform: 'translateY(-4px) scale(1.02)',
            },
            '&:active': {
                boxShadow: `
          inset 8px 8px 16px rgba(0, 0, 0, 0.25),
          inset -8px -8px 16px rgba(255, 255, 255, 0.2),
          inset 2px 2px 6px rgba(0, 0, 0, 0.3)
        `,
                transform: 'scale(0.96)',
            },
        },
    });
});
