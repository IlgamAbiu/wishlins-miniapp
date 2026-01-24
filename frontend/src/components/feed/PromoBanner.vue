<script setup lang="ts">
/**
 * PromoBanner - Promotional banner for the feed.
 */
import type { PromoItem } from '@/types'

interface Props {
  item: PromoItem
}

defineProps<Props>()
</script>

<template>
  <article
    class="promo-banner"
    :style="{ backgroundColor: item.backgroundColor || '#6366f1' }"
  >
    <div class="promo-banner__content">
      <h3 class="promo-banner__title">{{ item.title }}</h3>
      <p class="promo-banner__subtitle">{{ item.subtitle }}</p>
    </div>
    <div class="promo-banner__arrow">→</div>
  </article>
</template>

<style scoped>
.promo-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.promo-banner:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.promo-banner__content {
  flex: 1;
}

.promo-banner__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.promo-banner__subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.promo-banner__arrow {
  font-size: 24px;
  color: #ffffff;
  margin-left: 16px;
}
</style>
