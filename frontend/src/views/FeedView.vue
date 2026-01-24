<script setup lang="ts">
/**
 * FeedView - Main feed tab view.
 *
 * Architecture:
 * - Orchestrates feed data loading via feedService
 * - Delegates rendering to child components
 * - Prepared for infinite scroll implementation
 *
 * SOLID:
 * - Components only render UI
 * - Service handles data fetching
 */
import { ref, onMounted } from 'vue'
import { feedService } from '@/services'
import type { FeedItem as FeedItemType } from '@/types'
import { FeedItem } from '@/components/feed'
import { LoadingSpinner, EmptyState } from '@/components/common'

const items = ref<FeedItemType[]>([])
const isLoading = ref(true)
const hasMore = ref(true)
const page = ref(0)
const isLoadingMore = ref(false)

async function loadFeed() {
  isLoading.value = true
  try {
    const result = await feedService.getFeedItems(0)
    items.value = result.items
    hasMore.value = result.hasMore
    page.value = 0
  } finally {
    isLoading.value = false
  }
}

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  try {
    const nextPage = page.value + 1
    const result = await feedService.getFeedItems(nextPage)
    items.value.push(...result.items)
    hasMore.value = result.hasMore
    page.value = nextPage
  } finally {
    isLoadingMore.value = false
  }
}

// Scroll handler for infinite scroll (prepared for future)
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

  if (scrollBottom < 200 && hasMore.value && !isLoadingMore.value) {
    loadMore()
  }
}

onMounted(() => {
  loadFeed()
})
</script>

<template>
  <div class="feed-view" @scroll="handleScroll">
    <header class="feed-view__header">
      <h1 class="feed-view__title">Discover</h1>
    </header>

    <div v-if="isLoading" class="feed-view__loading">
      <LoadingSpinner size="large" />
    </div>

    <div v-else-if="items.length === 0" class="feed-view__empty">
      <EmptyState
        icon="📰"
        title="No content yet"
        description="Check back later for news, ideas, and more."
      />
    </div>

    <div v-else class="feed-view__content">
      <FeedItem
        v-for="item in items"
        :key="item.id"
        :item="item"
      />

      <div v-if="isLoadingMore" class="feed-view__loading-more">
        <LoadingSpinner size="small" />
      </div>

      <div v-if="!hasMore && items.length > 0" class="feed-view__end">
        You're all caught up!
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-view {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.feed-view__header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 16px 20px;
  background: var(--tg-bg-color, #ffffff);
  border-bottom: 0.5px solid var(--tg-hint-color, #e0e0e0);
}

.feed-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.feed-view__loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.feed-view__empty {
  padding: 40px 20px;
}

.feed-view__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-bottom: 100px; /* Space for tab bar */
}

.feed-view__loading-more {
  padding: 20px;
}

.feed-view__end {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: var(--tg-hint-color, #999999);
}
</style>
