import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import { createI18nInstance } from './i18n'
import { installDesktopBridge, setupMainMenu } from './services/desktop'
import './assets/css/main.css'

installDesktopBridge()

const i18n = createI18nInstance('de')

const app = createApp(App)
app.use(i18n)
app.use(ui)
app.mount('#app')

void setupMainMenu({
  appName: i18n.global.t('app.name'),
  quit: i18n.global.t('app.quit')
})
