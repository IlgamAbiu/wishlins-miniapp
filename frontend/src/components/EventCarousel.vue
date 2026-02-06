<script setup lang="ts">
/**
 * Event Carousel Component.
 * Horizontal scrollable list of events (wishlists).
 */
import { ref, computed } from 'vue'
import type { Wishlist } from '@/types'

const props = defineProps<{
  events: Wishlist[]
  selectedEventId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'add'): void
}>()

const defaultEvent = computed(() => {
  return props.events.find(e => e.is_default)
})

const otherEvents = computed(() => {
  // Filter out default, sort by date (newest first)
  return props.events
    .filter(e => !e.is_default)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

function selectEvent(id: string) {
  emit('select', id)
}
</script>

<template>
  <div class="event-carousel">
    <div class="event-carousel__track">
      <!-- 1. Default Event -->
      <div
        v-if="defaultEvent"
        class="event-card"
        :class="{ 'event-card--active': defaultEvent.id === selectedEventId }"
        @click="selectEvent(defaultEvent.id)"
      >
        <div class="event-card__icon">
          {{ defaultEvent.emoji || '🎁' }}
        </div>
        <div class="event-card__title">{{ defaultEvent.title }}</div>
      </div>

      <!-- 2. Add Event Button (Always second) -->
      <button class="event-add-btn" @click="$emit('add')">
        <div class="event-add-btn__icon">+</div>
        <div class="event-add-btn__label">Новое</div>
      </button>

      <!-- 3. Other Events -->
      <div
        v-for="event in otherEvents"
        :key="event.id"
        class="event-card"
        :class="{ 'event-card--active': event.id === selectedEventId }"
        @click="selectEvent(event.id)"
      >
        <div class="event-card__icon">
          {{ event.emoji || '🎉' }}
        </div>
        <div class="event-card__title">{{ event.title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-carousel {
  width: 100%;
  overflow-x: auto;
  padding: 16px 0;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.event-carousel::-webkit-scrollbar {
  display: none;
}

.event-carousel__track {
  display: flex;
  gap: 12px;
  padding: 0 20px;
  min-width: min-content;
}

.event-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid transparent;
  flex-shrink: 0;
}

.event-card--active {
  background: var(--tg-button-color, #3390ec);
  box-shadow: 0 8px 24px rgba(51, 144, 236, 0.3);
  transform: translateY(-2px);
}

.event-card--active .event-card__title {
  color: white;
  font-weight: 600;
}

.event-card__icon {
  font-size: 32px;
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.event-card--active .event-card__icon {
  transform: scale(1.1);
}

.event-card__title {
  font-size: 13px;
  color: var(--tg-text-color, #222);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  transition: color 0.2s;
}

.event-add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  color: var(--tg-hint-color, #999);
}

.event-add-btn:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.05);
}

.event-add-btn__icon {
  font-size: 28px;
  margin-bottom: 4px;
  font-weight: 300;
}

.event-add-btn__label {
  font-size: 13px;
}
</style>
