<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 *
 * Architecture Decision:
 * - Custom tab router instead of Vue Router because:
 *   1. Simpler for tab-based navigation
 *   2. No URL changes in Mini App context
 *   3. Lighter footprint
 *   4. Keeps all tabs mounted (preserves state)
 *   5. Better control over transitions
 *
 * - Uses KeepAlive to preserve tab state when switching
 * - Applies Telegram theme on mount
 */
import { computed, onMounted, defineAsyncComponent } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { telegramService } from '@/services'
import { TabBar } from '@/components/navigation'

// Lazy load views for better initial load performance
const FeedView = defineAsyncComponent(() => import('@/views/FeedView.vue'))
const ProfileView = defineAsyncComponent(() => import('@/views/ProfileView.vue'))
const FriendsView = defineAsyncComponent(() => import('@/views/FriendsView.vue'))

const { activeTab } = useNavigation()

// Map tab IDs to components
const tabComponents = {
  feed: FeedView,
  profile: ProfileView,
  friends: FriendsView,
}

const currentComponent = computed(() => tabComponents[activeTab.value])

onMounted(() => {
  // Initialize Telegram WebApp
  telegramService.init()

  // Apply Telegram theme colors
  telegramService.applyTheme()
})
</script>

<template>
  <div class="app">
    <main class="app__content">
      <!--
        KeepAlive preserves component state when switching tabs.
        This maintains scroll position, loaded data, and form state.
      -->
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
  /* Default theme (light) - overridden by Telegram */
  --tg-bg-color: #ffffff;
  --tg-text-color: #000000;
  --tg-hint-color: #999999;
  --tg-link-color: #3390ec;
  --tg-button-color: #3390ec;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #f5f5f5;
  --tg-header-bg-color: #ffffff;
  --tg-section-bg-color: #ffffff;
  --tg-accent-text-color: #3390ec;
  --tg-destructive-text-color: #ff3b30;

  /* RGB values for rgba() usage */
  --tg-bg-color-rgb: 255, 255, 255;

  /* Tab bar height for layout calculations */
  --tab-bar-height: 56px;
}

/* Dark mode defaults */
.dark {
  --tg-bg-color: #1c1c1e;
  --tg-text-color: #ffffff;
  --tg-hint-color: #8e8e93;
  --tg-secondary-bg-color: #2c2c2e;
  --tg-bg-color-rgb: 28, 28, 30;
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

  /* Prevent overscroll bounce on iOS */
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

img {
  max-width: 100%;
  height: auto;
}

/* Scrollbar styling for webkit browsers */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>

<style scoped>
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
