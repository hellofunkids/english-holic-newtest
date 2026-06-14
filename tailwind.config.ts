import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A6B',
          dark: '#0F2547',
          light: '#2D5299',
          50: '#F0F4FF',
          100: '#E0E9FF',
          200: '#C0D0F0',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8CC7A',
          dark: '#A88830',
          50: '#FDF8EC',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(27,58,107,0.08)',
        gold: '0 4px 20px rgba(201,168,76,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
