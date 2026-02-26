<script setup lang="ts">
/**
 * TabBar - Bottom navigation bar component.
 */
import { useKeyboard } from '@/composables/useKeyboard'
import { useRoute, useRouter } from 'vue-router'
import TabBarItem from './TabBarItem.vue'
import { TAB_CONFIGS } from '@/stores/navigation.store' // Re-using data structure for now

const route = useRoute()
const router = useRouter()
const { isKeyboardOpen } = useKeyboard()

function handleTabSelect(tabId: string) {
  // Map tab IDs to routes
  const pathMap: Record<string, string> = {
      'profile': '/profile',
      'friends': '/friends',
      'search': '/search'
  }
  
  if (pathMap[tabId]) {
      router.push(pathMap[tabId])
  }
}

function isActive(tabId: string) {
    if (tabId === 'profile' && route.path.startsWith('/profile')) return true
    if (tabId === 'friends' && route.path.startsWith('/friends')) return true
    if (tabId === 'search' && route.path.startsWith('/search')) return true
    return false
}
</script>

<template>
  <nav 
    class="tab-bar" 
    :class="{ 'tab-bar--hidden': isKeyboardOpen }"
    role="tablist" 
    aria-label="Main navigation"
  >
    <div class="tab-bar__content">
      <TabBarItem
        v-for="tab in TAB_CONFIGS"
        :key="tab.id"
        :tab="tab"
        :is-active="isActive(tab.id)"
        @select="handleTabSelect"
      />
    </div>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 480px;
  z-index: 100; /* Lower than Modal (1000) */
  pointer-events: auto; /* Force clickable */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
}

.tab-bar--hidden {
  transform: translate(-50%, 200%); /* Move down out of view */
  opacity: 0;
  pointer-events: none;
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  gap: 8px;

  /* Solid Background (optimized) */
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--glass-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 9999px;

  transition: all var(--transition-normal);
}

[data-theme='dark'] .tab-bar__content {
  background: rgba(28, 28, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
