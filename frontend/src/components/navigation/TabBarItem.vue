<script setup lang="ts">
/**
 * TabBarItem - Individual tab button in the Tab Bar.
 *
 * Architecture:
 * - Pure presentational component
 * - No business logic, only renders UI
 * - Emits events for parent to handle
 */
import { computed } from 'vue'
import type { TabConfig } from '@/types'

interface Props {
  tab: TabConfig
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [tabId: string]
}>()

const icon = computed(() => props.isActive ? props.tab.activeIcon : props.tab.icon)

function handleClick() {
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
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 50px;
}

.tab-bar-item__icon {
  font-size: 20px;
  line-height: 1;
  color: var(--tg-hint-color, #999999);
  transition: color 0.2s ease, transform 0.2s ease;
}

.tab-bar-item__label {
  font-size: 10px;
  font-weight: 500;
  color: var(--tg-hint-color, #999999);
  transition: color 0.2s ease;
}

.tab-bar-item--active .tab-bar-item__icon {
  color: var(--tg-button-color, #3390ec);
  transform: scale(1.1);
}

.tab-bar-item--active .tab-bar-item__label {
  color: var(--tg-button-color, #3390ec);
}

.tab-bar-item:active {
  opacity: 0.7;
}

/* Hover only on non-touch devices */
@media (hover: hover) {
  .tab-bar-item:hover:not(.tab-bar-item--active) {
    .tab-bar-item__icon,
    .tab-bar-item__label {
      color: var(--tg-text-color, #000000);
    }
  }
}
</style>
