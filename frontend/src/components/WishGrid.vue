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
      <!-- First Card - Large -->
      <div
        v-if="wishes.length > 0"
        class="wish-card-large glass-card-new"
        @click="$emit('click', wishes[0])"
      >
        <button class="favorite-btn glass-btn">
          <span class="heart-icon">❤️</span>
        </button>
        <div class="card-image">
          <img
            v-if="wishes[0].image_url"
            :src="wishes[0].image_url"
            alt="wish"
            loading="lazy"
          />
          <div v-else class="image-placeholder">🎁</div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <div>
              <h3 class="card-title">{{ wishes[0].title }}</h3>
              <p v-if="wishes[0].description" class="card-source">{{ wishes[0].description }}</p>
            </div>
            <div v-if="wishes[0].price" class="card-price-big">
              {{ formatPrice(wishes[0].price, wishes[0].currency) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Remaining Cards - Small Grid -->
      <div v-if="wishes.length > 1" class="grid-small">
        <div
          v-for="wish in wishes.slice(1)"
          :key="wish.id"
          class="wish-card-small glass-card-new"
          @click="$emit('click', wish)"
        >
          <div class="small-image">
            <img
              v-if="wish.image_url"
              :src="wish.image_url"
              alt="wish"
              loading="lazy"
            />
            <div v-else class="image-placeholder">🎁</div>
            <button class="favorite-btn-small glass-btn">
              <span class="heart-icon-small">🤍</span>
            </button>
          </div>
          <div class="small-content">
            <h4 class="small-title">{{ wish.title }}</h4>
            <p v-if="wish.price" class="small-price">{{ formatPrice(wish.price, wish.currency) }}</p>
          </div>
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* === LARGE CARD === */
.wish-card-large {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.favorite-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.6);
  color: #FF375F;
}

[data-theme='dark'] .favorite-btn {
  background: rgba(0, 0, 0, 0.4);
  color: #FF453A;
}

.heart-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.card-image {
  width: 100%;
  height: 208px;
  border-radius: 32px;
  overflow: hidden;
  background: var(--tg-secondary-bg-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

[data-theme='dark'] .card-image img,
[data-theme='dark'] .small-image img {
  filter: brightness(0.9);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  opacity: 0.3;
}

.card-content {
  padding: 0 4px 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

[data-theme='dark'] .card-title {
  color: #FFFFFF;
}

.card-source {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

[data-theme='dark'] .card-source {
  color: #9CA3AF;
}

.card-price-big {
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-button-color);
  white-space: nowrap;
}

/* === SMALL CARDS GRID === */
.grid-small {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.wish-card-small {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  overflow: hidden;
}

.small-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 28px;
  overflow: hidden;
  background: var(--tg-secondary-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.small-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn-small {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
}

[data-theme='dark'] .favorite-btn-small {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
}

.heart-icon-small {
  font-size: 16px;
}

.small-content {
  padding: 0 6px 2px;
}

.small-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

[data-theme='dark'] .small-title {
  color: #FFFFFF;
}

.small-price {
  margin: 4px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--tg-button-color);
}


</style>
