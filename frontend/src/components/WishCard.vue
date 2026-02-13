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
      
    </div>

    <div class="card-content">
      <div class="card-main">
        <h3 class="card-title">{{ wish.title }}</h3>
        <div v-if="wish.price" class="card-price">
          {{ formatPrice(wish.price, wish.currency) }}
        </div>
      </div>
      
        <div class="card-footer">
          <div class="footer-info">
            <span v-if="wish.store" class="store-name">{{ wish.store }}</span>
            <span class="date-text">{{ formatDate(wish.created_at) }}</span>
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

.layout-full .footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.layout-full .store-name {
  font-size: 14px;
}

.layout-full .date-text {
  font-size: 12px;
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

.layout-half .footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}



.layout-half .store-name, 
.layout-half .date-text {
    font-size: 11px;
}


</style>
