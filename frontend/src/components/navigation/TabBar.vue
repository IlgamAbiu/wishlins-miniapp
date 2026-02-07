<script setup lang="ts">
/**
 * TabBar - Bottom navigation bar component.
 */
import { useNavigation } from '@/composables/useNavigation'
import TabBarItem from './TabBarItem.vue'
import type { TabId } from '@/types'

const { tabs, activeTab, navigateToTab, isActive } = useNavigation()

function handleTabSelect(tabId: string) {
  navigateToTab(tabId as TabId)
}
</script>

<template>
  <nav class="tab-bar" role="tablist" aria-label="Main navigation">
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
  
  /* Glassmorphism */
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  
  padding-bottom: env(safe-area-inset-bottom);
  transition: all var(--transition-normal);
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 500px;
  margin: 0 auto;
  height: var(--tab-bar-height);
  padding: 0 var(--spacing-sm);
}
</style>
