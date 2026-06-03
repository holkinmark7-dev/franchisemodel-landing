import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// gh-pages project site → база совпадает с именем репозитория.
export default defineConfig({
  base: '/franchisemodel-landing/',
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Three.js/R3F вынесены в отдельный чанк — грузится лениво вместе со сценой,
        // не висит в основном бандле (важно для perf и мобайл-fallback).
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
