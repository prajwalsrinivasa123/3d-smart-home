import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/three\//.test(id)) return 'three'
          if (id.includes('@react-three') || id.includes('three-stdlib')) return 'r3f'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('lucide-react')) return 'ui'
        },
      },
    },
  },
})
