<script setup lang="ts">
/**
 * SearchView - Search tab placeholder.
 */
</script>

<template>
  <div class="search-view">
    <div class="placeholder">
      <div class="placeholder__icon-wrapper">
        <div class="placeholder__icon">🔍</div>
        <div class="placeholder__sparkle">✨</div>
      </div>
      <h2 class="placeholder__title">Поиск желаний</h2>
      <p class="placeholder__text">Найдите идеальный подарок</p>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-lg) + var(--safe-area-top)) var(--spacing-lg) var(--spacing-lg);
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
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(147, 112, 219, 0.3));
}

.placeholder__sparkle {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 24px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(5deg);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2) rotate(180deg);
  }
}

.placeholder__title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-title-1);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme='dark'] .placeholder__title {
  background: linear-gradient(135deg, #a8b5ff 0%, #c4a4ff 100%);
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
