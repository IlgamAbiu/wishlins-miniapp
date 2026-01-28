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
  background: var(--tg-bg-color, #ffffff);
  border-top: 0.5px solid var(--tg-hint-color, #e0e0e0);
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
