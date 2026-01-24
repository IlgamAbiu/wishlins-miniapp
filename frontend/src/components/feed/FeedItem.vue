<script setup lang="ts">
/**
 * FeedItem - Renders appropriate card based on item type.
 *
 * Architecture:
 * - Component composition pattern
 * - Delegates to specialized card components
 * - Single responsibility: routing to correct component
 */
import type { FeedItem as FeedItemType } from '@/types'
import NewsCard from './NewsCard.vue'
import IdeaCard from './IdeaCard.vue'
import PromoBanner from './PromoBanner.vue'

interface Props {
  item: FeedItemType
}

defineProps<Props>()
</script>

<template>
  <NewsCard v-if="item.type === 'news'" :item="item" />
  <IdeaCard v-else-if="item.type === 'idea'" :item="item" />
  <PromoBanner v-else-if="item.type === 'promo'" :item="item" />
</template>
