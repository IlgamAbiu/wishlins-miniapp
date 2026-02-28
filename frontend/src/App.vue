<script setup lang="ts">
/**
 * Root application component.
 * Shows BlockedScreen when opened outside Telegram.
 */
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import BlockedScreen from '@/components/BlockedScreen.vue'

const { isReady, isInTelegram, isAvailable, hasValidInitData, user, webapp } = useTelegramWebApp()

// Debug logging
console.log('[App] isReady:', isReady.value)
console.log('[App] isAvailable:', isAvailable.value)
console.log('[App] hasValidInitData:', hasValidInitData.value)
console.log('[App] isInTelegram:', isInTelegram.value)
console.log('[App] user:', user.value)
console.log('[App] webapp initData:', webapp.value?.initData?.substring(0, 100))
console.log('[App] window.Telegram:', !!window.Telegram)
console.log('[App] window.Telegram.WebApp:', !!window.Telegram?.WebApp)
</script>

<template>
  <!-- Loading -->
  <div v-if="!isReady" class="app-loading">
    <div class="app-loading__spinner"></div>
  </div>

  <!-- Blocked -->
  <BlockedScreen v-else-if="!isInTelegram" />

  <!-- Main App -->
  <div v-else class="app">
    <div class="mesh-gradient"></div>
    <!-- DEBUG MARKER 1: App level -->
    <div style="background:red;color:white;padding:10px;z-index:100;position:relative;flex-shrink:0;">
      [APP] user={{ user?.id }} route={{ $route.path }}
    </div>
    <router-view />
  </div>
</template>

<style>
/* Global Styles */
:root {
  --tab-bar-height: 56px;
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--tg-bg-color);
  background-image: var(--template-bg-image);
  background-attachment: fixed;
  color: var(--tg-text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  min-height: 100vh;
}

[data-theme='dark'] html,
[data-theme='dark'] body {
  background: radial-gradient(circle at 50% 0%, var(--aurora-bg-1) 0%, var(--aurora-bg-2) 60%, var(--aurora-bg-3) 100%);
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

a {
  color: var(--tg-link-color);
  text-decoration: none;
}
</style>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--tg-secondary-bg-color);
}

.app-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--tg-hint-color);
  border-top-color: var(--tg-button-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.app > :not(.mesh-gradient) {
  flex: 1;
  min-height: 0;
}

.mesh-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background:
    radial-gradient(at 0% 0%, rgba(10, 132, 255, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(88, 86, 214, 0.1) 0px, transparent 50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

[data-theme='dark'] .mesh-gradient {
  opacity: 1;
}

[data-theme='dark'] .blur-decoration {
  opacity: 0;
}
</style>
