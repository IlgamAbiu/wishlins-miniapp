<script setup lang="ts">
/**
 * FriendsView - Friends tab placeholder.
 */
</script>

<template>
  <div class="friends-view">
    <div class="placeholder">
      <div class="placeholder__icon-wrapper">
        <div class="placeholder__icon">🎁</div>
        <div class="placeholder__sparkle">🌟</div>
      </div>
      <h2 class="placeholder__title">Друзья</h2>
      <p class="placeholder__text">Желания ваших друзей появятся здесь</p>
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
  position: relative;
}

.placeholder {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  animation: liquid-scale-in 0.6s var(--liquid-spring);
  position: relative;
  z-index: 1;
}

.placeholder__icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: var(--spacing-lg);
}

.placeholder__icon {
  font-size: 72px;
  animation: gift-bounce 2.5s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(255, 105, 180, 0.3));
}

.placeholder__sparkle {
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 28px;
  animation: sparkle-rotate 3s ease-in-out infinite;
}

@keyframes gift-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes sparkle-rotate {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.3) rotate(180deg);
  }
}

.placeholder__title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-title-1);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme='dark'] .placeholder__title {
  background: linear-gradient(135deg, #ffb3d9 0%, #ffe89e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.placeholder__text {
  margin: 0;
  font-size: var(--font-size-callout);
  color: var(--tg-hint-color);
  font-weight: var(--font-weight-medium);
}
</style>
