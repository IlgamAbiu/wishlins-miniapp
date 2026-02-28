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

defineEmits<{
  (e: 'add'): void
  (e: 'click', wish: Wish): void
}>()
</script>

<template>
  <div class="wish-grid">
    <!-- Loading Skeletons -->
    <div v-if="loading" class="grid-content">
      <div v-for="i in 4" :key="i" class="wish-card skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
          <div class="skeleton skeleton-text" style="width: 40%;"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="grid-error">
      <p>{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="wishes.length === 0" class="grid-empty">
      <div class="empty-icon">✨</div>
      <p class="empty-text">Список желаний пуст</p>
    </div>

    <!-- Grid -->
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
.wish-grid {
  padding: 0 var(--spacing-lg) 100px;
}

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

.grid-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

.grid-item {
  grid-column: span 1;
}

.span-full {
  grid-column: 1 / -1;
}

/* Skeleton */
.skeleton-card {
  background: var(--tg-secondary-bg-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 200px;
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
