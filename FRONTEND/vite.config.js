import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    // autoImport: <v-btn> 等元件會自動註冊（並 tree-shake），不用手動 import
    // styles.configFile: 讓 Vuetify 的 SASS 變數吃 src/styles/settings.scss
    vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
  ],
})
