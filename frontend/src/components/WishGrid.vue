<script setup lang="ts">
/**
 * Wish Grid Component.
 * Displays a grid of wishes for the selected event.
 */
import type { Wish } from '@/types'
import WishCard from './WishCard.vue'

defineProps<{
  wishes: Wish[]
  loading: boolean
  error: string | null
  isOwner?: boolean
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'click', wish: Wish): void
}>()
</script>

<template>
  <div class="wish-grid">
    <!-- Loading State (Skeletons) -->
    <div v-if="loading" class="grid-content">
      <div v-for="i in 4" :key="i" class="wish-card skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
          <div class="skeleton skeleton-text" style="width: 40%;"></div>
        </div>
      </div>
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

    <!-- Unified Grid Content -->
    <div v-else class="grid-content">
      <WishCard
        v-for="wish in wishes"
        :key="wish.id"
        :wish="wish"
        :layout="wish.priority === 'really_want' ? 'full' : 'half'"
        :is-owner="isOwner ?? false"
        :is-booked-by-me="wish.booked_by_me"
        class="grid-item"
        :class="{ 'span-full': wish.priority === 'really_want' }"
        @click="$emit('click', wish)"
      />
    </div>
    
  </div>
</template>

<style scoped>
/* Scoped styles - Design System Refactor */
.wish-grid {
  padding: 0 var(--side-padding) 100px; /* Enhanced bottom padding */
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

/* Unified Grid Layout */
.grid-content {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  gap: 16px;
  width: 100%;
}

.grid-item {
  /* Default span is 1 column (half width) */
  grid-column: span 1;
}

.span-full {
  grid-column: 1 / -1;
}

/* Use a deep selector or ensure higher specificity if needed, 
   but since the class is added in the parent template, it should work.
   Adding !important to force layout if there are conflicting styles. */
/* Skeleton Card */
.skeleton-card {
  background: var(--tg-secondary-bg-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 200px; /* Approx height of a card */
}

.skeleton-image {
  width: 100%;
  height: 120px;
  flex-shrink: 0;
}

.skeleton-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
