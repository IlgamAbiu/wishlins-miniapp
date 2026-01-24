<script setup lang="ts">
/**
 * WishlistItem - Single wishlist item card.
 */
import type { WishlistItem as WishlistItemType } from '@/types'

interface Props {
  item: WishlistItemType
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: [itemId: string]
  delete: [itemId: string]
}>()

function formatPrice(price?: number, currency?: string): string {
  if (!price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}
</script>

<template>
  <div
    class="wishlist-item"
    :class="{ 'wishlist-item--purchased': item.isPurchased }"
  >
    <button
      class="wishlist-item__checkbox"
      :class="{ 'wishlist-item__checkbox--checked': item.isPurchased }"
      @click="emit('toggle', item.id)"
      :aria-label="item.isPurchased ? 'Mark as not purchased' : 'Mark as purchased'"
    >
      <span v-if="item.isPurchased">✓</span>
    </button>

    <div class="wishlist-item__content">
      <h3 class="wishlist-item__title">{{ item.title }}</h3>
      <p v-if="item.description" class="wishlist-item__description">
        {{ item.description }}
      </p>
      <span v-if="item.price" class="wishlist-item__price">
        {{ formatPrice(item.price, item.currency) }}
      </span>
    </div>

    <button
      class="wishlist-item__delete"
      @click="emit('delete', item.id)"
      aria-label="Delete item"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.wishlist-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--tg-bg-color, #ffffff);
  border-radius: 12px;
  transition: opacity 0.2s ease;
}

.wishlist-item--purchased {
  opacity: 0.6;
}

.wishlist-item--purchased .wishlist-item__title {
  text-decoration: line-through;
}

.wishlist-item__checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--tg-hint-color, #cccccc);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
  font-size: 12px;
  color: #ffffff;
}

.wishlist-item__checkbox--checked {
  background: var(--tg-button-color, #3390ec);
  border-color: var(--tg-button-color, #3390ec);
}

.wishlist-item__content {
  flex: 1;
  min-width: 0;
}

.wishlist-item__title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
}

.wishlist-item__description {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
}

.wishlist-item__price {
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-button-color, #3390ec);
}

.wishlist-item__delete {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: var(--tg-hint-color, #999999);
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.wishlist-item__delete:hover {
  opacity: 1;
  color: var(--tg-destructive-text-color, #ff3b30);
}
</style>
