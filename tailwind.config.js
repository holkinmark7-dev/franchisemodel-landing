/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Тёмная кинематографичная база (NOT indigo closr-site).
        navy: {
          950: '#06091A', // база
          900: '#0A0F2A',
          800: '#101736',
        },
        ink: {
          DEFAULT: '#EAEEFB', // основной текст
          mute: '#8A93B2', // приглушённый
          faint: '#4A5274',
        },
        accent: {
          DEFAULT: '#5B8CFF', // холодный premium-голубой
          glow: '#7AA2FF',
          deep: '#2E5BD8',
        },
      },
      fontFamily: {
        sans: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}
