<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 * Shows BlockedScreen when opened outside Telegram.
 */
import { computed, defineAsyncComponent } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { TabBar } from '@/components/navigation'
import BlockedScreen from '@/components/BlockedScreen.vue'
import FestiveBackground from '@/components/ui/FestiveBackground.vue'

// Lazy load views
const ProfileView = defineAsyncComponent(() => import('@/views/ProfileView.vue'))
const FriendsView = defineAsyncComponent(() => import('@/views/FriendsView.vue'))
const SearchView = defineAsyncComponent(() => import('@/views/SearchView.vue'))

const { activeTab } = useNavigation()
const { isReady, isInTelegram } = useTelegramWebApp()

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
    <!-- Праздничный фон с блестками -->
    <FestiveBackground />

    <main class="app__content">
      <KeepAlive>
        <component :is="currentComponent" :key="activeTab" />
      </KeepAlive>
    </main>

    <TabBar />
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
  background-color: var(--tg-bg-color);
  color: var(--tg-text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
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
</style>
