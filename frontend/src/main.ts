/**
 * Application entry point.
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import design system CSS in correct order
import './assets/design-system.css'     // Base design tokens
import './assets/liquid-glass.css'      // Glass morphism system
import './assets/typography.css'        // SF Pro typography
import './assets/animations.css'        // Liquid animations
import './assets/utilities.css'         // Utility classes

// Create and mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')
