<script setup lang="ts">
import type { Wish } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  wish: Wish
  layout: 'full' | 'half'
  isOwner: boolean
  isBookedByMe: boolean
}>()

const emit = defineEmits<{
  (e: 'click', wish: Wish): void
  (e: 'preload', wish: Wish): void
}>()

import { useImagePreload } from '@/composables/useImagePreload'
const { preloadImage } = useImagePreload()

function handleInteraction() {
  if (props.wish.image_url) {
    preloadImage(props.wish.image_url)
    emit('preload', props.wish)
  }
}


function formatPrice(price: number | null, currency: string | null) {
  if (!price) return ''
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency || 'RUB',
    maximumFractionDigits: 0
  }).format(price)
}


// Generate consistent gradient based on title length/chars to avoid index dependency
function getGradient(str: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

const backgroundStyle = computed(() => {
  if (props.wish.image_url) return {}
  return { background: getGradient(props.wish.title) }
})

const bookingState = computed<'owner' | 'free' | 'booked-other' | 'booked-me'>(() => {
  if (props.isOwner) return 'owner'
  if (!props.wish.is_booked) return 'free'
  return props.isBookedByMe ? 'booked-me' : 'booked-other'
})
</script>

<template>
  <div
    class="wish-card glass-card-new"
    :class="[`layout-${layout}`, `state-${bookingState}`]"
    @click="$emit('click', wish)"
    @touchstart="handleInteraction"
    @mousedown="handleInteraction"
  >
    <div class="card-image-wrapper">
      <img
        v-if="wish.image_url"
        :src="wish.image_url"
        :alt="wish.title"
        loading="lazy"
        decoding="async"
        class="card-image"
      />
      <div v-else class="image-gradient" :style="backgroundStyle">
        <span class="gradient-icon">✨</span>
      </div>

      <!-- Занято кем-то другим -->
      <div v-if="bookingState === 'booked-other'" class="booked-overlay">
        <div class="booked-badge">
          <span class="booked-icon">🔒</span>
          <span class="booked-label">Занято</span>
        </div>
      </div>

      <!-- Я уже дарю -->
      <div v-if="bookingState === 'booked-me'" class="gifter-badge">
        <span class="gifter-icon">🎁</span>
        <span class="gifter-label">Я дарю</span>
      </div>
    </div>

    <div class="card-content">
      <div class="card-main">
        <h3 class="card-title">{{ wish.title }}</h3>
        <div v-if="wish.price" class="card-price">
          {{ formatPrice(wish.price, wish.currency) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wish-card {
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s ease;
}

.wish-card:active {
  transform: scale(0.98);
}

/* === SHARED STYLES === */
.card-image-wrapper {
  position: relative;
  background: var(--tg-secondary-bg-color);
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-gradient {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-icon {
  font-size: 32px;
  opacity: 0.8;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}



.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-title {
  margin: 0;
  font-weight: 700;
  color: var(--tg-text-color);
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price {
  font-weight: 700;
  color: var(--tg-accent-text-color); /* Matches design blue */
}


/* === LAYOUT: FULL (Large Card) === */
.layout-full {
  border-radius: 32px;
  padding: 16px;
  gap: 16px;
  background: #1c1c1e; /* Dark themes usually have dark cards */
}

[data-theme='light'] .layout-full {
  background: #ffffff;
}

.layout-full .card-image-wrapper {
  height: 200px;
  border-radius: 24px;
}

.layout-full .gradient-icon {
  font-size: 64px;
}

.layout-full .card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.layout-full .card-title {
  font-size: 20px;
}

.layout-full .card-price {
  font-size: 20px;
}




/* === LAYOUT: HALF (Small Card) === */
.layout-half {
  border-radius: 24px;
  padding: 12px;
  gap: 12px;
  background: #1c1c1e;
}

[data-theme='light'] .layout-half {
  background: #ffffff;
}

.layout-half .card-image-wrapper {
  aspect-ratio: 1;
  border-radius: 20px;
}

.layout-half .card-title {
  font-size: 15px;
  margin-bottom: 4px;
}

.layout-half .card-price {
  font-size: 13px;
}


/* === STATE: BOOKED BY SOMEONE ELSE === */
.state-booked-other {
  opacity: 0.75;
}

.booked-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(30, 30, 50, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.booked-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.booked-icon {
  font-size: 14px;
  line-height: 1;
}

.booked-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

[data-theme='light'] .booked-overlay {
  background: rgba(200, 200, 220, 0.45);
}

[data-theme='light'] .booked-badge {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

[data-theme='light'] .booked-label {
  color: rgba(30, 30, 50, 0.85);
}


/* === STATE: BOOKED BY ME (GIFTER) === */
.state-booked-me {
  box-shadow:
    0 0 0 2px rgba(16, 185, 129, 0.7),
    0 0 16px 4px rgba(16, 185, 129, 0.3),
    var(--glass-card-shadow);
  border-color: rgba(16, 185, 129, 0.6) !important;
}

.gifter-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 9999px;
  background: rgba(10, 10, 20, 0.65);
  border: 1px solid rgba(16, 185, 129, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.gifter-icon {
  font-size: 12px;
  line-height: 1;
}

.gifter-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(16, 185, 129, 1);
  letter-spacing: 0.04em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

[data-theme='light'] .gifter-badge {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 185, 129, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.15);
}

[data-theme='light'] .state-booked-me {
  box-shadow:
    0 0 0 2px rgba(16, 185, 129, 0.6),
    0 0 12px 3px rgba(16, 185, 129, 0.15),
    var(--glass-card-shadow);
}




</style>
