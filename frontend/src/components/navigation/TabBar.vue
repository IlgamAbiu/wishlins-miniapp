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
  bottom: 24px; /* Detached from bottom */
  left: 50%;
  transform: translateX(-50%);
  width: auto; /* Dynamic width based on content */
  min-width: 300px; /* Minimum width for touch targets */
  z-index: 100;
  
  /* Floating HUD - Liquid Glass */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); /* Floating shadow */
  border-radius: 40px; /* Capsule shape */
  
  padding: 4px; /* Inner padding for "floating" feel */
  transition: all var(--transition-normal);
}

[data-theme='dark'] .tab-bar {
  background: rgba(40, 40, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-around;

  /* Premium Border and Shadows */
  border: 1px solid var(--glass-border-light);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    var(--glass-inner-glow);

  /* GPU Acceleration */
  transform: translateZ(0);

  /* Enable pointer events on content */
  pointer-events: auto;
}

/* Responsive adjustments */
@media (min-width: 375px) {
  .tab-bar__content {
    max-width: 420px;
    padding: 0 12px;
  }
}

@media (min-width: 428px) {
  .tab-bar__content {
    max-width: 450px;
    padding: 0 16px;
  }
}

/* Dark theme adjustments for better contrast */
[data-theme='dark'] .tab-bar__content {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    var(--glass-inner-glow);
}
</style>
