import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// gh-pages project site → база совпадает с именем репозитория.
export default defineConfig({
  base: '/franchisemodel-landing/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
})
