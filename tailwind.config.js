/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tet: {
          red: {
            light: '#F87171',
            DEFAULT: '#DC2626',
            dark: '#991B1B',
            deep: '#7F1D1D'
          },
          gold: {
            light: '#FDE68A',
            DEFAULT: '#F59E0B',
            dark: '#D97706',
            metallic: '#EAB308'
          },
          cream: '#FFFBEB',
          dark: '#1C1917'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 25px -5px rgba(220, 38, 38, 0.4)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
