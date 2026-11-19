import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setMaterialStorageKey, setPaletteStorageKey, setThemeStorageKey, usePalette, useMaterial, useTheme } from 'rei-kit'
import App from './App.vue'
import { router } from './app/router'
import './styles/main.css'

// Namespace rei-kit's appearance preferences (localStorage). index.html reads the same keys pre-paint.
setThemeStorageKey('ios-theme')
setMaterialStorageKey('ios-material')
setPaletteStorageKey('ios-palette')
try {
  if (!localStorage.getItem('ios-palette')) usePalette().value = 'tokyo-night'
} catch {
  /* storage blocked: fall back to rei-kit defaults */
}
usePalette()
useMaterial()
useTheme()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
