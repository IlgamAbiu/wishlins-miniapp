<script setup lang="ts">
/**
 * TabBarItem - Individual tab button in the Tab Bar.
 *
 * Enhanced with:
 * - Haptic feedback on selection
 * - Liquid scale animations
 * - Ripple effect on tap
 */
import { computed } from 'vue'
import { useHaptic } from '@/composables/useHaptic'
import type { TabConfig } from '@/types'

interface Props {
  tab: TabConfig
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [tabId: string]
}>()

const { selection } = useHaptic()

const icon = computed(() => props.isActive ? props.tab.activeIcon : props.tab.icon)

function handleClick() {
  // Trigger haptic feedback
  selection()

  // Emit select event
  emit('select', props.tab.id)
}
</script>

<template>
  <button
    class="tab-bar-item"
    :class="{ 'tab-bar-item--active': isActive }"
    @click="handleClick"
    :aria-label="tab.label"
    :aria-selected="isActive"
    role="tab"
  >
    <span class="tab-bar-item__icon">{{ icon }}</span>
    <span class="tab-bar-item__label">{{ tab.label }}</span>
  </button>
</template>

<style scoped>
.tab-bar-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  padding: 8px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  min-height: 56px;
  overflow: hidden;
  transition: all 0.2s var(--liquid-ease);
}

/* Ripple effect container */
.tab-bar-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, var(--tg-button-color) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.tab-bar-item:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.4;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.tab-bar-item__icon {
  font-size: 22px;
  line-height: 1;
  color: var(--tg-hint-color);
  transition: color 0.2s var(--liquid-ease),
              transform 0.3s var(--liquid-spring);
}

.tab-bar-item__label {
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  color: var(--tg-hint-color);
  transition: color 0.2s var(--liquid-ease);
  letter-spacing: -0.01em;
}

/* Active state with liquid animation */
.tab-bar-item--active .tab-bar-item__icon {
  color: var(--tg-button-color);
  animation: liquid-scale-in 0.3s var(--liquid-spring);
}

.tab-bar-item--active .tab-bar-item__label {
  color: var(--tg-button-color);
  font-weight: var(--font-weight-semibold);
}

/* Active indicator pill at bottom */
.tab-bar-item--active::before {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: var(--tg-button-color);
  border-radius: 2px 2px 0 0;
  box-shadow: 0 -2px 8px rgba(var(--tg-button-color-rgb), 0.4);
  animation: liquid-scale-in 0.3s var(--liquid-spring);
}

/* Touch feedback */
.tab-bar-item:active {
  transform: scale(0.95);
}

/* Hover only on non-touch devices */
@media (hover: hover) {
  .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__icon,
  .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__label {
    color: var(--tg-text-color);
    opacity: 0.7;
  }
}
</style>
