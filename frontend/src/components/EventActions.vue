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
      <span class="material-symbols-outlined icon">ios_share</span>
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
  /* Glass Icon Background */
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--transition-normal);
}

.edit-btn .icon {
  color: var(--tg-button-color);
}

.share-btn .icon {
  color: var(--color-success);
}

.delete-btn .icon {
  color: var(--color-error);
}

.action-btn:active .icon {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.8);
}

.label {
  font-size: var(--font-size-caption);
  color: var(--tg-hint-color); /* Hint color might need adjustment on Aurora */
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); /* Improve readability */
}
</style>
