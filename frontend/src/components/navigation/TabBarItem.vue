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
  gap: 2px;
  flex: 1;
  padding: 10px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  border-radius: 20px;
  overflow: visible;
  transition: all 0.25s var(--liquid-ease);
}

/* iOS 26 Style: Rounded active background */
.tab-bar-item--active::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(var(--tg-button-color-rgb), 0.15);
  border-radius: 18px;
  animation: liquid-scale-in 0.4s var(--liquid-spring);
  z-index: -1;
}

[data-theme='dark'] .tab-bar-item--active::before {
  background: rgba(var(--tg-button-color-rgb), 0.2);
}

/* Ripple effect on tap */
.tab-bar-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, var(--tg-button-color) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  border-radius: 20px;
}

.tab-bar-item:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.3;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.tab-bar-item__icon {
  font-size: 24px;
  line-height: 1;
  color: var(--tg-hint-color);
  transition: color 0.25s var(--liquid-ease),
              transform 0.35s var(--liquid-spring);
  position: relative;
  z-index: 1;
}

.tab-bar-item__label {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  color: var(--tg-hint-color);
  transition: color 0.25s var(--liquid-ease),
              font-weight 0.25s ease;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

/* Active state with iOS 26 style */
.tab-bar-item--active .tab-bar-item__icon {
  color: var(--tg-button-color);
  transform: scale(1.05);
}

.tab-bar-item--active .tab-bar-item__label {
  color: var(--tg-button-color);
  font-weight: var(--font-weight-semibold);
}

/* Touch feedback - subtle scale */
.tab-bar-item:active {
  transform: scale(0.92);
}

/* Hover only on non-touch devices */
@media (hover: hover) {
  .tab-bar-item:hover:not(.tab-bar-item--active) {
    background: rgba(128, 128, 128, 0.08);
  }

  .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__icon,
  .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__label {
    color: var(--tg-text-color);
    opacity: 0.8;
  }

  [data-theme='dark'] .tab-bar-item:hover:not(.tab-bar-item--active) {
    background: rgba(255, 255, 255, 0.08);
  }
}

/* Smooth icon change animation */
.tab-bar-item__icon {
  animation: none;
}

.tab-bar-item--active .tab-bar-item__icon {
  animation: icon-pop 0.35s var(--liquid-spring);
}

@keyframes icon-pop {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}
</style>
