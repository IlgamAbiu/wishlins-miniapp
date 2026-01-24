<script setup lang="ts">
/**
 * Empty state component for when there are no wishlist items.
 */
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="12"
          y="16"
          width="56"
          height="48"
          rx="4"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M12 28H68"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle
          cx="20"
          cy="22"
          r="2"
          fill="currentColor"
        />
        <circle
          cx="28"
          cy="22"
          r="2"
          fill="currentColor"
        />
        <circle
          cx="36"
          cy="22"
          r="2"
          fill="currentColor"
        />
        <path
          d="M24 42L32 50L56 34"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <h2 class="empty-state__title">Your wishlist is empty</h2>
    <p class="empty-state__description">
      Start adding items you'd love to receive as gifts. Share your wishlist with friends and family.
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 300px;
}

.empty-state__icon {
  color: var(--tg-hint-color, #999999);
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
}

.empty-state__description {
  margin: 0;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
  max-width: 280px;
  line-height: 1.5;
}
</style>
