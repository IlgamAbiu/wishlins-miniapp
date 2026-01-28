<script setup lang="ts">
/**
 * Root application component with Tab Bar navigation.
 */
import { computed, defineAsyncComponent } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { TabBar } from '@/components/navigation'

// Lazy load views
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
</script>

<template>
  <div class="app">
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
