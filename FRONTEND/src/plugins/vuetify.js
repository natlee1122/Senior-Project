import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// 所有「設計 token」集中在這：顏色、元件預設值、斷點。
export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },

  // 與 settings.scss 的 $grid-breakpoints 保持一致（useDisplay() 會用到）
  display: { thresholds: { xs: 0, sm: 601, md: 901, lg: 1280, xl: 1920, xxl: 2560 } },

  theme: {
    defaultTheme: 'lifescape',
    themes: {
      lifescape: {
        dark: false,
        colors: {
          background: '#f7f8f5',
          surface: '#ffffff',
          'on-background': '#18343a',
          'on-surface': '#18343a',

          primary: '#2f9d91',
          'primary-dark': '#217d74',
          secondary: '#e8f5f0',
          'on-secondary': '#278377',
          error: '#b65d52',

          ink: '#18343a',      // 深色文字 / snackbar 背景
          muted: '#71858a',    // 次要文字
          line: '#e6ece9',     // 分隔線
          sand: '#e9c7ad',     // 頭像底色
          'on-sand': '#65493a',
          gold: '#fff4d5',     // 金幣圖示底色
          'on-gold': '#d99b1e',
          cream: '#fbf8ee',    // streak 卡片
          'on-cream': '#776d52',
        },
        variables: {
          'border-color': '#e6ece9',
          'border-opacity': 1,
          'high-emphasis-opacity': 1,
        },
      },
    },
  },

  // 全域元件預設值：寫一次，不必每個 <v-btn> 都重複 / 不必再 !important
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg', ripple: false },
    VCard: { elevation: 0, rounded: 'xl', border: true },
    VChip: { variant: 'flat', color: 'secondary' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
    VSnackbar: { color: 'ink', location: 'bottom right', rounded: 'lg' },
  },
})
