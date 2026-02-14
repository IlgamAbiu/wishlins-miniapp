<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 * Shows BlockedScreen when opened outside Telegram.
 */
import { computed, defineAsyncComponent } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishes } from '@/composables/useWishes'
import { TabBar } from '@/components/navigation'
import BlockedScreen from '@/components/BlockedScreen.vue'
import FestiveBackground from '@/components/ui/FestiveBackground.vue'
import WishDetailView from '@/components/WishDetailView.vue'

// Lazy load views
const ProfileView = defineAsyncComponent(() => import('@/views/ProfileView.vue'))
const FriendsView = defineAsyncComponent(() => import('@/views/FriendsView.vue'))
const SearchView = defineAsyncComponent(() => import('@/views/SearchView.vue'))

const { activeTab } = useNavigation()
const { isReady, isInTelegram } = useTelegramWebApp()
const { selectedWish } = useWishes()

// Map tab IDs to components
const tabComponents = {
  profile: ProfileView,
  friends: FriendsView,
  search: SearchView,
}

const currentComponent = computed(() => tabComponents[activeTab.value])
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
    <!-- Decorative blur circles (light theme) -->
    <div class="blur-decoration blur-circle-blue"></div>
    <div class="blur-decoration blur-circle-purple"></div>

    <!-- Mesh gradients (dark theme) -->
    <div class="mesh-gradient"></div>

    <main class="app__content">
      <KeepAlive>
        <component :is="currentComponent" :key="activeTab" />
      </KeepAlive>
    </main>

    <Transition name="fade-scale">
      <WishDetailView v-if="selectedWish" />
    </Transition>

    <TabBar v-show="!selectedWish" />
  </div>
</template>

<style>
/* Global Styles are now handled in design-system.css */
/* We keep reset here or move to design-system.css completely */

:root {
  /* Tab bar height */
  --tab-bar-height: 56px;
}

html, body {
  margin: 0;
  padding: 0;
  background: radial-gradient(circle at 0% 0%, var(--aurora-bg-1) 0%, var(--aurora-bg-2) 50%, var(--aurora-bg-3) 100%);
  color: var(--tg-text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  min-height: 100vh;
}

[data-theme='dark'] html,
[data-theme='dark'] body {
  background: radial-gradient(circle at 50% 0%, #1C1C1E 0%, #0A0A0C 100%);
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

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
