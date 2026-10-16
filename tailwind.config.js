/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      borderRadius: {
        xs: '2px',
      },
      colors: {
        // Theme-aware tokens (follow body theme classes) — support opacity modifiers, e.g. `text-ink/90`
        ink: 'color-mix(in srgb, var(--text-main) calc(<alpha-value> * 100%), transparent)',
        canvas: 'color-mix(in srgb, var(--bg-color) calc(<alpha-value> * 100%), transparent)',
        omori: {
          dark: '#0d0e15',
          paper: '#f5f5f0',
          sketch: '#181920',
          red: '#ff3344',
          blood: '#8b0000',
          gold: '#fcd34d',
          blue: '#3b82f6',
          teal: '#2dd4bf',
          purple: '#a855f7',
          gray: '#262938',
          border: '#3a3f58',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace', 'Courier New'],
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'retro-white': '4px 4px 0px 0px rgba(255, 255, 255, 0.9)',
        'retro-red': '4px 4px 0px 0px #dc2626',
        'retro-gold': '4px 4px 0px 0px #f59e0b',
        'retro-blue': '4px 4px 0px 0px #3b82f6',
        'omori-box': 'inset 0 0 0 2px #ffffff, 0 0 0 2px #000000',
      }
    },
  },
  plugins: [],
}
