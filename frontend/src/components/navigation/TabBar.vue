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
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 92%;
  max-width: 480px;
  z-index: 100;
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  gap: 8px;

  /* Glass Panel Style */
  background: var(--glass-panel-bg);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 9999px;

  transition: all var(--transition-normal);
}

[data-theme='dark'] .tab-bar__content {
  background: rgba(40, 40, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
