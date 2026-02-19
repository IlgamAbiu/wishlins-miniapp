<script setup lang="ts">
/**
 * Event Actions Component.
 * Displays control buttons (Edit, Share, Delete) for the selected event.
 */
import { computed } from 'vue'
import type { Wishlist } from '@/types'

const props = defineProps<{
  event: Wishlist
  canDelete: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'share'): void
  (e: 'delete'): void
}>()

const isDefault = computed(() => props.event.is_default)
</script>

<template>
  <div class="event-actions">
    <!-- Edit Button (Always visible) -->
    <button class="action-btn" @click="$emit('edit')" :disabled="isDefault">
      <div class="icon-wrap">
        <span class="material-symbols-outlined">edit</span>
      </div>
    </button>

    <!-- Delete Button (Only if not default) -->
    <button
      v-if="!isDefault && canDelete"
      class="action-btn"
      @click="$emit('delete')"
    >
      <div class="icon-wrap">
        <span class="material-symbols-outlined">delete</span>
      </div>
    </button>

    <!-- Share Button -->
    <button class="action-btn" @click="$emit('share')">
      <div class="icon-wrap">
        <span class="material-symbols-outlined">ios_share</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.event-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity var(--transition-normal);
}

.action-btn:active {
  opacity: 0.7;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--glass-btn-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-wrap .material-symbols-outlined {
  font-size: 18px;
  color: var(--tg-text-color);
}

.action-btn:active .icon-wrap {
  transform: scale(0.95);
}
</style>
