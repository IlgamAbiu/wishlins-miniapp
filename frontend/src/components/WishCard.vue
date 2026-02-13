<script setup lang="ts">
import type { Wish } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  wish: Wish
  layout: 'full' | 'half'
}>()

const emit = defineEmits<{
  (e: 'click', wish: Wish): void
}>()

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return ''
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency || 'RUB',
    maximumFractionDigits: 0
  }).format(price)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  }).format(date)
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
</script>

<template>
  <div 
    class="wish-card glass-card-new" 
    :class="[`layout-${layout}`]"
    @click="$emit('click', wish)"
  >
    <div class="card-image-wrapper">
      <img
        v-if="wish.image_url"
        :src="wish.image_url"
        :alt="wish.title"
        loading="lazy"
        class="card-image"
      />
      <div v-else class="image-gradient" :style="backgroundStyle">
        <span class="gradient-icon">✨</span>
      </div>
      
      <!-- Like/Heart Button (Visual only for now) -->
      <div class="like-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.696c0-1.933.469-3.71 1.28-5.234.02-.037.042-.075.066-.112a6.99 6.99 0 014.288-3.328c1.32-.238 2.651-.08 3.868.411 1.25.498 2.37 1.282 3.242 2.253.868-.967 1.983-1.748 3.235-2.247 1.22-.493 2.56-.665 3.89-.418a6.995 6.995 0 014.35 3.447c.026.046.05.093.076.138.804 1.517 1.267 3.284 1.267 5.203 0 3.478-2.438 6.664-4.743 8.807a25.26 25.26 0 01-4.242 3.17l-.022.013-.007.003-.004.001-.002.001h-.001l-.625.323-.625-.323z" />
        </svg>
      </div>
    </div>

    <div class="card-content">
      <div class="card-main">
        <h3 class="card-title">{{ wish.title }}</h3>
        <div v-if="wish.price" class="card-price">
          {{ formatPrice(wish.price, wish.currency) }}
        </div>
      </div>
      
      <div class="card-footer">
        <div class="footer-left">
          <span v-if="wish.store" class="store-name">{{ wish.store }}</span>
          <span v-else class="date-text">{{ formatDate(wish.created_at) }}</span>
        </div>
        
        <!-- Progress bar visual placeholder -->
        <div class="progress-container">
           <div class="progress-bar" style="width: 0%"></div>
        </div>
         <span class="percentage-text">0%</span>
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

.like-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.heart-icon {
  width: 18px;
  height: 18px;
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
  color: #8b5cf6; /* Purple color from design */
}

.store-name {
  font-size: 12px;
  color: var(--tg-hint-color);
}

.date-text {
  font-size: 11px;
  color: var(--tg-hint-color);
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

.layout-full .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.layout-full .progress-container {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 0 12px;
  overflow: hidden;
}

[data-theme='light'] .layout-full .progress-container {
  background: rgba(0, 0, 0, 0.05);
}

.layout-full .percentage-text {
  font-size: 12px;
  font-weight: 600;
  color: #8b5cf6;
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

.layout-half .card-footer {
  margin-top: auto;
}

.layout-half .progress-container {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 8px;
    width: 100%;
}

[data-theme='light'] .layout-half .progress-container {
  background: rgba(0, 0, 0, 0.05);
}

.layout-half .percentage-text {
  display: none; /* Hide percentage on small cards to save space per design */
}

.layout-half .store-name, 
.layout-half .date-text {
    font-size: 11px;
}

.progress-bar {
    height: 100%;
    background: #8b5cf6;
    border-radius: inherit;
}
</style>
