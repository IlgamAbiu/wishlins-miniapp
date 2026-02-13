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

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

function getGradient(index: number): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  return gradients[index % gradients.length]
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
      <!-- Large Cards (really_want priority) -->
      <div
        v-for="(wish, index) in wishes.filter(w => w.priority === 'really_want')"
        :key="wish.id"
        class="wish-card-large glass-card-new"
        @click="$emit('click', wish)"
      >
        <div class="card-image">
          <img
            v-if="wish.image_url"
            :src="wish.image_url"
            alt="wish"
            loading="lazy"
          />
          <div v-else class="image-gradient" :style="{ background: getGradient(index) }">
            <span class="gradient-icon">✨</span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <div class="card-info">
              <h3 class="card-title">{{ wish.title }}</h3>
              <div class="card-meta">
                <span v-if="wish.store" class="card-store">{{ wish.store }}</span>
                <span class="card-date">{{ formatDate(wish.created_at) }}</span>
              </div>
            </div>
            <div v-if="wish.price" class="card-price-big">
              {{ formatPrice(wish.price, wish.currency) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Small Cards Grid (just_want priority) -->
      <div v-if="wishes.filter(w => w.priority === 'just_want').length > 0" class="grid-small">
        <div
          v-for="(wish, index) in wishes.filter(w => w.priority === 'just_want')"
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
            <div v-else class="image-gradient" :style="{ background: getGradient(index) }">
              <span class="gradient-icon-small">✨</span>
            </div>
          </div>
          <div class="small-content">
            <h4 class="small-title">{{ wish.title }}</h4>
            <div class="small-meta">
              <p v-if="wish.store" class="small-store">{{ wish.store }}</p>
              <p v-if="wish.price" class="small-price">
                {{ formatPrice(wish.price, wish.currency) }}
              </p>
              <p class="small-date">{{ formatDate(wish.created_at) }}</p>
            </div>
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

/* Gradient backgrounds for missing images */
.image-gradient {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gradient-icon {
  font-size: 64px;
  opacity: 0.8;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.gradient-icon-small {
  font-size: 40px;
  opacity: 0.8;
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

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

[data-theme='dark'] .card-title {
  color: #FFFFFF;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
}

.card-store {
  padding: 3px 10px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 8px;
  font-weight: 600;
  color: #4f46e5;
}

[data-theme='dark'] .card-store {
  background: rgba(79, 70, 229, 0.2);
  color: #818cf8;
}

.card-date {
  font-weight: 500;
  color: #64748b;
}

[data-theme='dark'] .card-date {
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

.small-content {
  padding: 0 6px 2px;
}

/* Small card metadata */
.small-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
}

.small-store {
  font-size: 10px;
  font-weight: 600;
  color: #4f46e5;
  margin: 0;
}

[data-theme='dark'] .small-store {
  color: #818cf8;
}

.small-date {
  font-size: 9px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

[data-theme='dark'] .small-date {
  color: #9CA3AF;
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
