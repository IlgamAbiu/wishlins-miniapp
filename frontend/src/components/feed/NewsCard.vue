<script setup lang="ts">
/**
 * NewsCard - News item card for the feed.
 */
import type { NewsItem } from '@/types'

interface Props {
  item: NewsItem
}

defineProps<Props>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
</script>

<template>
  <article class="news-card">
    <div class="news-card__content">
      <span class="news-card__source">{{ item.source }}</span>
      <h3 class="news-card__title">{{ item.title }}</h3>
      <p class="news-card__summary">{{ item.summary }}</p>
      <span class="news-card__time">{{ formatDate(item.createdAt) }}</span>
    </div>
    <div v-if="item.imageUrl" class="news-card__image">
      <img :src="item.imageUrl" :alt="item.title" />
    </div>
  </article>
</template>

<style scoped>
.news-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--tg-bg-color, #ffffff);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.news-card:active {
  transform: scale(0.98);
}

.news-card__content {
  flex: 1;
  min-width: 0;
}

.news-card__source {
  font-size: 12px;
  font-weight: 600;
  color: var(--tg-button-color, #3390ec);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-card__title {
  margin: 6px 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__summary {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__time {
  font-size: 12px;
  color: var(--tg-hint-color, #999999);
}

.news-card__image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--tg-secondary-bg-color, #f5f5f5);
}

.news-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
