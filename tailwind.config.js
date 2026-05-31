/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1D3D7A',
        bg: '#EEF2FA',
        kakao: '#FEE500',
      },
    },
  },
  plugins: [],
}

