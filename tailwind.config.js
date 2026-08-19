/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: {
          deep: '#0B0410', /* Rất tối, hơi ánh tím */
          base: '#130924', /* Tím tối giống brand SiviCamp */
          elevated: '#1D0E36', /* Nền card sáng hơn chút */
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
        },
        foreground: {
          DEFAULT: '#F4F0FA', /* Trắng ám tím nhẹ để dễ đọc */
          muted: '#BBA8D6', /* Tím nhạt cho phụ đề */
          subtle: 'rgba(255,255,255,0.60)',
        },
        accent: {
          DEFAULT: '#2E1B7F', /* Màu tím chủ đạo của ticket */
          bright: '#482EC2', /* Tím sáng hơn khi hover */
          glow: 'rgba(72, 46, 194, 0.4)',
        },
        borderLight: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.15), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(72, 46, 194, 0.2)',
        'button-glow': '0 0 0 1px rgba(72, 46, 194, 0.5), 0 4px 12px rgba(72, 46, 194, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        'input-focus': '0 0 0 1px #482EC2, 0 0 0 4px rgba(72, 46, 194, 0.25)',
        'inner-highlight': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        }
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 2s infinite',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at top, #1D0E36 0%, #130924 50%, #0B0410 100%)',
      }
    },
  },
  plugins: [],
}
