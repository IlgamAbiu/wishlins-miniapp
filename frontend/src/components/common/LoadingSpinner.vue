<script setup lang="ts">
/**
 * LoadingSpinner - Simple loading indicator.
 */
interface Props {
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
})
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`">
    <div class="loading-spinner__circle" />
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner__circle {
  border-radius: 50%;
  border: 3px solid var(--tg-hint-color, #e0e0e0);
  border-top-color: var(--tg-button-color, #3390ec);
  animation: spin 0.8s linear infinite;
}

.loading-spinner--small .loading-spinner__circle {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-spinner--medium .loading-spinner__circle {
  width: 32px;
  height: 32px;
}

.loading-spinner--large .loading-spinner__circle {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
