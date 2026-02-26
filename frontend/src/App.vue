<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 * Shows BlockedScreen when opened outside Telegram.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { TabBar } from '@/components/navigation'
import BlockedScreen from '@/components/BlockedScreen.vue'

// Optional: Keep this if we have some global init logic besides router
// import { useNativeNavigation } from '@/composables/useNativeNavigation'

const route = useRoute()
const { isReady, isInTelegram } = useTelegramWebApp()

// TabBar visibility is now controlled by route meta
const showTabBar = computed(() => route.meta.requireTabBar !== false)
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
        <Transition :name="(route.meta.transitionName as string) || 'fade'">
          <KeepAlive :max="5">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </Transition>
      </router-view>
    </main>

    <TabBar v-show="showTabBar" />
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

  /* Standard Native Spacing */
  --side-padding: 20px;
  --top-margin: 24px;
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
  touch-action: pan-y; /* Allow vertical pan, let native horizontal gestures be handled by system */
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

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
  position: absolute;
  width: 100%;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Transitions (Push/Pop) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute;
  width: 100%;
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(-30%);
  opacity: 0.5;
}

</style>
