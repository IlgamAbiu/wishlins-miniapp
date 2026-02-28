<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 * Shows BlockedScreen when opened outside Telegram.
 */
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { TabBar } from '@/components/navigation'
import BlockedScreen from '@/components/BlockedScreen.vue'

const { isReady, isInTelegram, startParam } = useTelegramWebApp()
const router = useRouter()

watch(isReady, (ready) => {
  if (ready && startParam.value) {
    if (startParam.value.startsWith('wish_')) {
      const wishId = startParam.value.replace('wish_', '')
      router.push({ name: 'wish-detail', params: { id: wishId } })
    }
  }
}, { immediate: true })
</script>

<template>
  <!-- Loading state while checking Telegram availability -->
  <div v-if="!isReady" class="app-loading">
    <div class="app-loading__spinner"></div>
  </div>

  <!-- Blocked screen for non-Telegram access -->
  <BlockedScreen v-else-if="!isInTelegram" />

  <!-- Main app when in Telegram -->
  <div v-else class="app">
    <!-- Mesh gradients (dark theme) -->
    <div class="mesh-gradient"></div>

    <main class="app__content">
      <router-view v-slot="{ Component, route }">
        <KeepAlive :max="3">
          <component 
            :is="Component" 
            :key="route.name" 
            v-if="route.meta.keepAlive" 
          />
        </KeepAlive>
        <Transition name="fade-scale" mode="out-in">
          <component 
            :is="Component" 
            :key="route.name || 'no-cache'" 
            v-if="!route.meta.keepAlive" 
          />
        </Transition>
      </router-view>
    </main>

    <TabBar v-show="$route.meta.showTabBar" />
  </div>
</template>

<style>
/* Global Styles are now handled in design-system.css */
/* We keep reset here or move to design-system.css completely */

:root {
  /* Tab bar height */
  --tab-bar-height: 56px;

  /* Safe area insets for fullscreen Telegram Mini App */
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
  /* Use the dark theme aurora gradient variables */
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
  to {
    transform: rotate(360deg);
  }
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.app__content {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.app__content > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Mesh gradient for dark theme */
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

/* Hide blur circles in dark theme */
[data-theme='dark'] .blur-decoration {
  opacity: 0;
}

.fade-scale-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-scale-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
