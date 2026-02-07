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
      <!-- 1. Default Event Pill -->
      <button
        v-if="defaultEvent"
        class="event-pill"
        :class="{ 'event-pill--active active-pill': defaultEvent.id === selectedEventId, 'glass-btn': defaultEvent.id !== selectedEventId }"
        @click="selectEvent(defaultEvent.id)"
      >
        <span class="pill-text">{{ defaultEvent.title }}</span>
      </button>

      <!-- 2. Add Event Button (Circle with +) -->
      <button class="event-add-btn glass-btn" @click="$emit('add')">
        <span class="add-icon">+</span>
      </button>

      <!-- 3. Other Events Pills -->
      <button
        v-for="event in otherEvents"
        :key="event.id"
        class="event-pill"
        :class="{ 'event-pill--active active-pill': event.id === selectedEventId, 'glass-btn': event.id !== selectedEventId }"
        @click="selectEvent(event.id)"
      >
        <span class="pill-text">{{ event.title }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.event-carousel {
  width: 100%;
  overflow-x: auto;
  /* Increased padding to prevent shadow and glow clipping */
  padding: 12px 0;
  margin: -8px 0;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.event-carousel::-webkit-scrollbar {
  display: none;
}

.event-carousel__track {
  display: flex;
  gap: 8px;
  /* Increased horizontal padding to prevent shadow clipping on sides */
  padding: 0 12px;
  min-width: min-content;
}

/* === EVENT PILL === */
.event-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 22px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: #64748b;
}

[data-theme='dark'] .event-pill {
  color: rgba(255, 255, 255, 0.7);
}

.event-pill--active {
  color: var(--tg-button-color);
}

.pill-text {
  font-size: 14px;
  font-weight: 700;
}

/* === ADD BUTTON === */
.event-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  color: #64748b;
}

[data-theme='dark'] .event-add-btn {
  color: rgba(255, 255, 255, 0.7);
}

.add-icon {
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
}
</style>
