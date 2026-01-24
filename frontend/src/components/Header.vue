<script setup lang="ts">
/**
 * App header component with user info.
 */
import { computed } from 'vue'

interface Props {
  displayName: string
  avatarUrl?: string | null
}

const props = defineProps<Props>()

const initials = computed(() => {
  const name = props.displayName
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})
</script>

<template>
  <header class="header">
    <div class="header__content">
      <div class="header__avatar">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="displayName"
          class="header__avatar-image"
        />
        <span v-else class="header__avatar-initials">
          {{ initials }}
        </span>
      </div>
      <div class="header__info">
        <h1 class="header__title">My Wishlist</h1>
        <p class="header__subtitle">{{ displayName }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: 16px 20px;
  background-color: var(--tg-bg-color, #ffffff);
  border-bottom: 1px solid var(--tg-hint-color, #e0e0e0);
}

.header__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--tg-button-color, #3390ec);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header__avatar-initials {
  color: var(--tg-button-text-color, #ffffff);
  font-size: 18px;
  font-weight: 600;
}

.header__info {
  flex: 1;
  min-width: 0;
}

.header__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
  line-height: 1.2;
}

.header__subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--tg-hint-color, #999999);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
