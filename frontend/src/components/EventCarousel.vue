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

// Calculate days until event
function getDaysUntilEvent(eventDate: string | null): string | null {
  if (!eventDate) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)

  const diffTime = event.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `было ${Math.abs(diffDays)} дн. назад`
  } else if (diffDays === 0) {
    return 'сегодня'
  } else if (diffDays === 1) {
    return 'завтра'
  } else if (diffDays <= 7) {
    return `через ${diffDays} дн.`
  } else if (diffDays <= 30) {
    return `через ${diffDays} дн.`
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30)
    return `через ${months} мес.`
  } else {
    const years = Math.floor(diffDays / 365)
    return `через ${years} г.`
  }
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
        :class="{
          'event-pill--active active-pill': event.id === selectedEventId,
          'glass-btn': event.id !== selectedEventId,
          'has-date': event.event_date
        }"
        @click="selectEvent(event.id)"
      >
        <span class="pill-text">{{ event.title }}</span>
        <span v-if="event.event_date" class="pill-date-overlay">
          {{ getDaysUntilEvent(event.event_date) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.event-carousel {
  width: 100%;
  overflow-x: auto;
  padding: 4px 0;
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
  padding: 0 4px;
  min-width: min-content;
}

/* === EVENT PILL === */
.event-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  height: 44px;
  padding: 0 24px;
  border-radius: 22px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: #64748b;
  /* Reduced shadow to prevent clipping */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  position: relative;
}

.event-pill.has-date {
  padding-top: 6px;
  padding-bottom: 6px;
}

[data-theme='dark'] .event-pill {
  color: #94a3b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.event-pill--active {
  color: #111118;
  font-weight: 600;
}

[data-theme='dark'] .event-pill--active {
  color: #f8fafc;
  font-weight: 600;
}

.pill-text {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.pill-date-overlay {
  font-size: 9px;
  font-weight: 600;
  color: var(--tg-button-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
  line-height: 1;
}

[data-theme='dark'] .pill-date-overlay {
  color: #4f46e5;
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
  /* Reduced shadow to prevent clipping */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

[data-theme='dark'] .event-add-btn {
  color: #94a3b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.add-icon {
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
}
</style>
