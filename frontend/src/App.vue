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

// Lazy load views
const FeedView = defineAsyncComponent(() => import('@/views/FeedView.vue'))
const ProfileView = defineAsyncComponent(() => import('@/views/ProfileView.vue'))
const FriendsView = defineAsyncComponent(() => import('@/views/FriendsView.vue'))

const { activeTab } = useNavigation()
const { isReady, isInTelegram } = useTelegramWebApp()

// Map tab IDs to components
const tabComponents = {
  feed: FeedView,
  profile: ProfileView,
  friends: FriendsView,
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
    <main class="app__content">
      <KeepAlive>
        <component :is="currentComponent" :key="activeTab" />
      </KeepAlive>
    </main>

    <TabBar />
  </div>
</template>

<style>
/* ============================================================================
   Global Styles
   ============================================================================ */

:root {
  /* Default theme colors */
  --tg-bg-color: #ffffff;
  --tg-text-color: #000000;
  --tg-hint-color: #999999;
  --tg-link-color: #3390ec;
  --tg-button-color: #3390ec;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #f5f5f5;

  /* Tab bar height */
  --tab-bar-height: 56px;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  background-color: var(--tg-secondary-bg-color);
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

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 0;
  height: 0;
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
}

.app__content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app__content > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
