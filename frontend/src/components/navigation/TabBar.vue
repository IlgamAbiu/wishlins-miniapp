<script setup lang="ts">
/**
 * TabBar - Bottom navigation bar component (iOS UITabBar style).
 *
 * Architecture:
 * - Container component for TabBarItems
 * - Uses useNavigation composable for state
 * - Handles safe area insets for proper layout
 *
 * Design Decisions:
 * - Fixed to bottom with safe area padding
 * - Blur backdrop for modern iOS feel
 * - Smooth transitions between active states
 */
import { computed } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { telegramService } from '@/services'
import TabBarItem from './TabBarItem.vue'
import type { TabId } from '@/types'

const { tabs, activeTab, navigateToTab, isActive } = useNavigation()

// Get safe area bottom inset
const safeAreaBottom = computed(() => {
  const insets = telegramService.getSafeAreaInsets()
  return `${insets.bottom}px`
})

function handleTabSelect(tabId: string) {
  navigateToTab(tabId as TabId)
}
</script>

<template>
  <nav
    class="tab-bar"
    :style="{ paddingBottom: safeAreaBottom }"
    role="tablist"
    aria-label="Main navigation"
  >
    <div class="tab-bar__content">
      <TabBarItem
        v-for="tab in tabs"
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
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--tg-bg-color, #ffffff);
  border-top: 0.5px solid var(--tg-hint-color, #e0e0e0);

  /* iOS-style blur effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(var(--tg-bg-color-rgb, 255, 255, 255), 0.85);
}

/* Dark mode adjustments */
:global(.dark) .tab-bar {
  background: rgba(28, 28, 30, 0.85);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.tab-bar__content {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 8px;
}
</style>
