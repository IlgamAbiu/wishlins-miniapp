<script setup lang="ts">
/**
 * Wish Grid Component.
 * Displays a grid of wishes for the selected event.
 */
import type { Wish } from '@/types'

defineProps<{
  wishes: Wish[]
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'add'): void
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
</script>

<template>
  <div class="wish-grid">
    <!-- Loading State -->
    <div v-if="loading" class="grid-loading">
      <div class="spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="grid-error">
      <p>{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="wishes.length === 0" class="grid-empty">
      <div class="empty-icon">✨</div>
      <p class="empty-text">Список желаний пуст</p>
    </div>

    <!-- Grid Content -->
    <div v-else class="grid-content">
      <div
        v-for="wish in wishes"
        :key="wish.id"
        class="wish-card"
        @click="$emit('click', wish)"
      >
        <div class="wish-card__image-wrapper">
          <img
            v-if="wish.image_url"
            :src="wish.image_url"
            alt="wish"
            class="wish-card__image"
            loading="lazy"
          />
          <div v-else class="wish-card__placeholder">
            🎁
          </div>
          <div v-if="wish.price" class="wish-card__price">
            {{ formatPrice(wish.price, wish.currency) }}
          </div>
        </div>
        <div class="wish-card__info">
          <h3 class="wish-card__title">{{ wish.title }}</h3>
          <p v-if="wish.description" class="wish-card__desc">
            {{ wish.description }}
          </p>
        </div>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
/* Scoped styles - Design System Refactor */
.wish-grid {
  padding: 0 var(--spacing-lg) 100px; /* Enhanced bottom padding */
}

/* Loading */
.grid-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--tg-button-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px var(--spacing-lg);
  text-align: center;
  background: var(--tg-bg-color);
  border-radius: var(--border-radius-xl);
  margin-top: var(--spacing-lg);
  box-shadow: var(--shadow-card);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  color: var(--tg-hint-color);
  margin-bottom: var(--spacing-lg);
}

/* Grid Layout */
.grid-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.wish-card {
  background: var(--tg-bg-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-fast);
  cursor: pointer;
  border: 1px solid var(--tg-border-color);
}

.wish-card:active {
  transform: scale(0.98);
}

.wish-card__image-wrapper {
  position: relative;
  aspect-ratio: 1;
  background: var(--tg-secondary-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wish-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wish-card__placeholder {
  font-size: 32px;
  opacity: 0.5;
}

.wish-card__price {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-caption);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.wish-card__info {
  padding: var(--spacing-sm);
}

.wish-card__title {
  font-size: var(--font-size-secondary);
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.3;
  color: var(--tg-text-color);
  
  /* Truncate to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wish-card__desc {
  font-size: var(--font-size-caption);
  color: var(--tg-hint-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>
