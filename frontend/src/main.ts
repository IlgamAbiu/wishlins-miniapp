/**
 * Application entry point.
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import design system CSS in correct order
import './assets/design-system.css'
import './assets/liquid-glass.css'
import './assets/typography.css'
import './assets/animations.css'
import './assets/utilities.css'

// Create and mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')
