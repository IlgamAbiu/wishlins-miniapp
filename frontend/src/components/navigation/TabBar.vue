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

  /* Enhanced Liquid Glass Effect */
  background: var(--glass-layer-2-bg);
  backdrop-filter: blur(var(--glass-layer-2-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-layer-2-blur)) saturate(180%);

  /* Premium Border and Shadows */
  border-top: 0.5px solid var(--glass-border-light);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08), var(--glass-inner-glow);

  /* Safe Area Support */
  padding-bottom: max(8px, env(safe-area-inset-bottom));

  /* Smooth Transitions */
  transition: transform 0.3s var(--liquid-ease),
              opacity 0.3s ease;

  /* GPU Acceleration */
  transform: translateZ(0);
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 600px;
  margin: 0 auto;
  height: var(--tab-bar-height);
  padding: 0 var(--spacing-md);
}
</style>
