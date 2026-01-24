<script setup lang="ts">
/**
 * EmptyState - Reusable empty state component.
 *
 * Pure presentational component with customizable
 * icon, title, and description.
 */
interface Props {
  icon?: string
  title: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: '📭',
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">{{ icon }}</div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
}

.empty-state__description {
  margin: 0;
  font-size: 14px;
  color: var(--tg-hint-color, #999999);
  max-width: 260px;
  line-height: 1.5;
}
</style>
