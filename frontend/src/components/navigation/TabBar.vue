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

  /* Padding for floating effect */
  padding: 0 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));

  /* Smooth Transitions */
  transition: transform 0.3s var(--liquid-ease),
              opacity 0.3s ease;

  /* Transparent background for floating effect */
  background: transparent;
  pointer-events: none;
}

.tab-bar__content {
  /* iOS 26 Floating Pill Style */
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 400px;
  margin: 0 auto;
  height: 64px;
  padding: 0 8px;

  /* Floating Glass Pill */
  background: var(--glass-layer-2-bg);
  backdrop-filter: blur(var(--glass-layer-2-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-layer-2-blur)) saturate(180%);

  /* Pill Shape - iOS 26 Native */
  border-radius: var(--border-radius-3xl);

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
