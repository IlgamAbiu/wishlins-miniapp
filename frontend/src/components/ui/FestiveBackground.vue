<script setup lang="ts">
/**
 * FestiveBackground - Праздничный фон с блестками и декором
 */
</script>

<template>
  <div class="festive-background">
    <!-- Плавающие блестки -->
    <div class="sparkles">
      <div v-for="i in 20" :key="i" class="sparkle" :style="{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }">✨</div>
    </div>

    <!-- Праздничные пузыри -->
    <div class="bubbles">
      <div v-for="i in 15" :key="i" class="bubble" :style="{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 5}s`,
        width: `${20 + Math.random() * 40}px`,
        height: `${20 + Math.random() * 40}px`
      }"></div>
    </div>
  </div>
</template>

<style scoped>
.festive-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Блестки */
.sparkles {
  position: absolute;
  inset: 0;
}

.sparkle {
  position: absolute;
  font-size: 12px;
  opacity: 0;
  animation: sparkle-float infinite ease-in-out;
}

@keyframes sparkle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  10%, 90% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
    transform: translateY(-20px) scale(1);
  }
}

/* Пузыри */
.bubbles {
  position: absolute;
  inset: 0;
}

.bubble {
  position: absolute;
  bottom: -100px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,
    rgba(255, 255, 255, 0.8),
    rgba(255, 182, 193, 0.3) 40%,
    rgba(147, 112, 219, 0.2) 70%,
    transparent);
  animation: bubble-rise infinite ease-in;
  filter: blur(1px);
}

@keyframes bubble-rise {
  0% {
    bottom: -100px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 110%;
    opacity: 0;
  }
}

/* Убрать анимации при prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .sparkle,
  .bubble {
    animation: none;
    opacity: 0.1;
  }
}
</style>
