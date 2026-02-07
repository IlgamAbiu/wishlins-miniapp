/**
 * Application entry point.
 */
import { createApp } from 'vue'
import App from './App.vue'

// Import design system CSS in correct order
import './assets/design-system.css'     // Base design tokens
import './assets/liquid-glass.css'      // Glass morphism system
import './assets/typography.css'        // SF Pro typography
import './assets/animations.css'        // Liquid animations
import './assets/utilities.css'         // Utility classes
import './assets/festive.css'           // Festive effects

// Create and mount the app
const app = createApp(App)
app.mount('#app')
