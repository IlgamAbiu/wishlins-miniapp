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
    <button class="action-btn edit-btn" @click="$emit('edit')" :disabled="isDefault">
      <div class="icon">✏️</div>
      <span class="label">Изменить</span>
    </button>

    <!-- Share Button -->
    <button class="action-btn share-btn" @click="$emit('share')">
      <div class="icon">📤</div>
      <span class="label">Поделиться</span>
    </button>

    <!-- Delete Button (Only if not default) -->
    <button 
      v-if="!isDefault && canDelete" 
      class="action-btn delete-btn" 
      @click="$emit('delete')"
    >
      <div class="icon">🗑️</div>
      <span class="label">Удалить</span>
    </button>
  </div>
</template>

<style scoped>
.event-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-normal);
}

.action-btn:active {
  opacity: 0.7;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--tg-secondary-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--transition-normal);
}

.edit-btn .icon {
  color: var(--tg-button-color);
  background: rgba(0, 136, 204, 0.1); /* Keep transparent accent */
}

.share-btn .icon {
  color: var(--color-success);
  background: rgba(52, 199, 89, 0.1);
}

.delete-btn .icon {
  color: var(--color-error);
  background: rgba(255, 59, 48, 0.1);
}

.label {
  font-size: var(--font-size-caption);
  color: var(--tg-hint-color);
  font-weight: 500;
}
</style>
