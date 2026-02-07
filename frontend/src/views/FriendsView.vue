<script setup lang="ts">
/**
 * FriendsView - Friends tab placeholder.
 */
</script>

<template>
  <div class="friends-view">
    <div class="placeholder">
      <div class="placeholder__icon">👥</div>
      <h2 class="placeholder__title">Друзья</h2>
      <p class="placeholder__text">Здесь будут желания ваших друзей</p>
    </div>
  </div>
</template>

<style scoped>
.friends-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.placeholder {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  animation: liquid-scale-in 0.5s var(--liquid-spring);
}

.placeholder__icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.placeholder__title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-title-1);
  font-weight: var(--font-weight-bold);
  color: var(--tg-text-color);
}

.placeholder__text {
  margin: 0;
  font-size: var(--font-size-subhead);
  color: var(--tg-hint-color);
}
</style>
