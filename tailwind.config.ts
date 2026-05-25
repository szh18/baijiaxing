import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        vermilion: '#C43A31',
        ink: '#2C2C2C',
        rice: '#F5F0E8',
        gold: '#B8860B',
        seal: '#8B1A1A',
        bamboo: '#5D7A4A'
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive']
      }
    }
  },
  plugins: []
}
