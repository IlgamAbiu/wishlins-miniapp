<script setup lang="ts">
/**
 * TabBar - Bottom navigation bar component.
 * Single-file component (replaces navigation/ directory).
 */
import { useNavigation } from '@/composables/useNavigation'
import { useKeyboard } from '@/composables/useKeyboard'
import { useHaptic } from '@/composables/useHaptic'
import type { TabId } from '@/types'

const { tabs, activeTab, navigateToTab, isActive } = useNavigation()
const { isKeyboardOpen } = useKeyboard()
const { selection } = useHaptic()

function handleTabSelect(tabId: TabId) {
  if (isActive(tabId)) return
  selection()
  navigateToTab(tabId)
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
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-bar__item"
        :class="{ 'tab-bar__item--active': isActive(tab.id) }"
        role="tab"
        :aria-selected="isActive(tab.id)"
        @click="handleTabSelect(tab.id)"
      >
        <span class="material-symbols-outlined tab-bar__icon">
          {{ isActive(tab.id) ? tab.activeIcon : tab.icon }}
        </span>
        <span class="tab-bar__label">{{ tab.label }}</span>
      </button>
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
  z-index: 100;
  pointer-events: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
}

.tab-bar--hidden {
  transform: translate(-50%, 200%);
  opacity: 0;
  pointer-events: none;
}

.tab-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  gap: 8px;
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

/* Tab Item */
.tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--tg-hint-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.tab-bar__item--active {
  background: var(--tg-button-color);
  color: var(--tg-button-text-color);
  box-shadow: 0 2px 12px rgba(79, 70, 229, 0.4);
}

[data-theme='dark'] .tab-bar__item--active {
  box-shadow: 0 2px 16px rgba(79, 70, 229, 0.5);
}

.tab-bar__item:active {
  transform: scale(0.95);
}

.tab-bar__icon {
  font-size: 22px;
  line-height: 1;
}

.tab-bar__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
</style>
