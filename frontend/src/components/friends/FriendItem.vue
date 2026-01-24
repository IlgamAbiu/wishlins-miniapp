<script setup lang="ts">
/**
 * FriendItem - Single friend list item.
 */
import { computed } from 'vue'
import type { Friend } from '@/types'

interface Props {
  friend: Friend
}

const props = defineProps<Props>()

const initials = computed(() => {
  const { firstName, lastName } = props.friend
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  return firstName.slice(0, 2).toUpperCase()
})

const displayName = computed(() => {
  const { firstName, lastName } = props.friend
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  return firstName
})
</script>

<template>
  <div class="friend-item">
    <div class="friend-item__avatar">
      <img
        v-if="friend.avatarUrl"
        :src="friend.avatarUrl"
        :alt="displayName"
        class="friend-item__avatar-image"
      />
      <span v-else class="friend-item__avatar-initials">
        {{ initials }}
      </span>
    </div>

    <div class="friend-item__info">
      <h3 class="friend-item__name">{{ displayName }}</h3>
      <p v-if="friend.username" class="friend-item__username">
        @{{ friend.username }}
      </p>
    </div>

    <div class="friend-item__meta">
      <span class="friend-item__wishlist-count">
        {{ friend.wishlistCount }} items
      </span>
      <span class="friend-item__arrow">›</span>
    </div>
  </div>
</template>

<style scoped>
.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--tg-bg-color, #ffffff);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.friend-item:active {
  background: var(--tg-secondary-bg-color, #f5f5f5);
}

.friend-item__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.friend-item__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-item__avatar-initials {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.friend-item__info {
  flex: 1;
  min-width: 0;
}

.friend-item__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
}

.friend-item__username {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
}

.friend-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.friend-item__wishlist-count {
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
}

.friend-item__arrow {
  font-size: 20px;
  color: var(--tg-hint-color, #cccccc);
}
</style>
