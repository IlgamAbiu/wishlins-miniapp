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
    <span v-if="isActive" class="tab-bar-item__label">{{ tab.label }}</span>
  </button>
</template>

<style scoped>
.tab-bar-item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  border-radius: 9999px;
  transition: all 0.2s ease;
  min-width: 48px;
  min-height: 48px;
}

/* Active state - Full colored pill */
.tab-bar-item--active {
  background: var(--tg-button-color);
  box-shadow: 0 4px 12px rgba(10, 13, 194, 0.2);
  padding: 14px 24px;
}

[data-theme='dark'] .tab-bar-item--active {
  background: rgba(10, 132, 255, 0.2);
  border: 1px solid rgba(10, 132, 255, 0.3);
  box-shadow: none;
}

.tab-bar-item__icon {
  font-size: 24px;
  line-height: 1;
  color: #94a3b8;
  transition: all 0.2s ease;
}

[data-theme='dark'] .tab-bar-item__icon {
  color: #ABABAB;
}

.tab-bar-item--active .tab-bar-item__icon {
  color: white;
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.3));
}

[data-theme='dark'] .tab-bar-item--active .tab-bar-item__icon {
  color: #0A84FF;
  filter: none;
}

.tab-bar-item__label {
  font-size: 14px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  letter-spacing: 0;
}

[data-theme='dark'] .tab-bar-item__label {
  color: #0A84FF;
}

/* Touch feedback */
.tab-bar-item:active {
  transform: scale(0.95);
}

/* Hover only on non-touch devices */
@media (hover: hover) {
  .tab-bar-item:hover:not(.tab-bar-item--active) {
    background: rgba(148, 163, 184, 0.1);
  }

  .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__icon {
    color: #64748b;
  }

  [data-theme='dark'] .tab-bar-item:hover:not(.tab-bar-item--active) .tab-bar-item__icon {
    color: white;
  }
}
</style>
