import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
  ],
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vuetify'],
  },
  server: {
    proxy: {
       '/api': 'http://localhost:8000',
     },
    warmup: {
      clientFiles: ['./src/main.js', './src/App.vue', './src/views/*.vue', './src/components/*.vue'],
    },
  },
})