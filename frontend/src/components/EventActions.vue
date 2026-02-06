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
  gap: 24px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
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
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.edit-btn .icon {
  color: var(--tg-button-color, #3390ec);
  background: rgba(51, 144, 236, 0.1);
}

.share-btn .icon {
  color: #28cd41; /* Green */
  background: rgba(40, 205, 65, 0.1);
}

.delete-btn .icon {
  color: #ff3b30; /* Red */
  background: rgba(255, 59, 48, 0.1);
}

.label {
  font-size: 12px;
  color: var(--tg-hint-color, #999);
  font-weight: 500;
}
</style>
