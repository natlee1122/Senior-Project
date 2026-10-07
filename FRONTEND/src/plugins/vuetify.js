import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// All design tokens
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

          ink: '#18343a',      // dark text
          muted: '#71858a',    // muted text
          line: '#e6ece9',     // divider line
          sand: '#e9c7ad',     // profile picture background
          'on-sand': '#65493a',
          gold: '#fff4d5',     // coin background
          'on-gold': '#d99b1e',
          cream: '#fbf8ee',    // streak card
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

  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg', ripple: false },
    VCard: { elevation: 0, rounded: 'xl', border: true },
    VChip: { variant: 'flat', color: 'secondary' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
    VSnackbar: { color: 'ink', location: 'bottom right', rounded: 'lg' },
  },
})
