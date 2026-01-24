<script setup lang="ts">
/**
 * IdeaCard - Idea/inspiration card for the feed.
 */
import type { IdeaItem } from '@/types'

interface Props {
  item: IdeaItem
}

defineProps<Props>()
</script>

<template>
  <article class="idea-card">
    <div class="idea-card__header">
      <span class="idea-card__category">{{ item.category }}</span>
      <span class="idea-card__likes">♡ {{ item.likes }}</span>
    </div>
    <h3 class="idea-card__title">{{ item.title }}</h3>
    <p class="idea-card__description">{{ item.description }}</p>
  </article>
</template>

<style scoped>
.idea-card {
  padding: 16px;
  background: var(--tg-bg-color, #ffffff);
  border-radius: 12px;
  border-left: 4px solid var(--tg-button-color, #3390ec);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.idea-card:active {
  transform: scale(0.98);
}

.idea-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.idea-card__category {
  font-size: 11px;
  font-weight: 600;
  color: var(--tg-button-color, #3390ec);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  background: rgba(51, 144, 236, 0.1);
  border-radius: 4px;
}

.idea-card__likes {
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
}

.idea-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
}

.idea-card__description {
  margin: 0;
  font-size: 14px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
}
</style>
