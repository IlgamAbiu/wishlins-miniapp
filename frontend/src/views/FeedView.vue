<script setup lang="ts">
/**
 * FeedView - Feed tab placeholder.
 */
</script>

<template>
  <div class="feed-view">
    <div class="placeholder">
      <div class="placeholder__icon">📰</div>
      <h2 class="placeholder__title">Feed</h2>
      <p class="placeholder__text">Placeholder for Feed content</p>
    </div>
  </div>
</template>

<style scoped>
.feed-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tg-secondary-bg-color, #f5f5f5);
}

.placeholder {
  text-align: center;
  padding: 40px 20px;
}

.placeholder__icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.placeholder__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.placeholder__text {
  margin: 0;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
}
</style>
