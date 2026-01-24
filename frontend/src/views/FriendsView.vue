<script setup lang="ts">
/**
 * FriendsView - Friends tab view.
 *
 * Architecture:
 * - Uses friendsService for data operations
 * - Prepared for Telegram social graph integration
 * - MVP shows empty state with explanation
 *
 * SOLID:
 * - Single Responsibility: Friends list orchestration
 * - Service handles data operations
 */
import { ref, onMounted } from 'vue'
import { friendsService, telegramService } from '@/services'
import type { Friend } from '@/types'
import { FriendItem } from '@/components/friends'
import { LoadingSpinner, EmptyState } from '@/components/common'

const friends = ref<Friend[]>([])
const isLoading = ref(true)

async function loadFriends() {
  isLoading.value = true
  try {
    friends.value = await friendsService.getFriends()
  } finally {
    isLoading.value = false
  }
}

async function handleInvite() {
  telegramService.hapticFeedback('medium')
  await friendsService.inviteFriend()
}

onMounted(() => {
  loadFriends()
})
</script>

<template>
  <div class="friends-view">
    <header class="friends-view__header">
      <h1 class="friends-view__title">Friends</h1>
    </header>

    <div v-if="isLoading" class="friends-view__loading">
      <LoadingSpinner size="large" />
    </div>

    <div v-else-if="friends.length === 0" class="friends-view__empty">
      <EmptyState
        icon="👥"
        title="No friends yet"
        description="Invite your friends to share wishlists and discover what they'd love to receive."
      >
        <button class="friends-view__invite-button" @click="handleInvite">
          Invite Friends
        </button>
      </EmptyState>
    </div>

    <div v-else class="friends-view__content">
      <div class="friends-view__list">
        <FriendItem
          v-for="friend in friends"
          :key="friend.id"
          :friend="friend"
        />
      </div>

      <button class="friends-view__invite-link" @click="handleInvite">
        + Invite more friends
      </button>
    </div>
  </div>
</template>

<style scoped>
.friends-view {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--tg-secondary-bg-color, #f5f5f5);
}

.friends-view__header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 16px 20px;
  background: var(--tg-bg-color, #ffffff);
  border-bottom: 0.5px solid var(--tg-hint-color, #e0e0e0);
}

.friends-view__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.friends-view__loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.friends-view__empty {
  padding: 40px 20px;
}

.friends-view__invite-button {
  margin-top: 20px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-button-text-color, #ffffff);
  background: var(--tg-button-color, #3390ec);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.friends-view__invite-button:active {
  opacity: 0.8;
}

.friends-view__content {
  padding-bottom: 100px; /* Space for tab bar */
}

.friends-view__list {
  background: var(--tg-bg-color, #ffffff);
  margin: 16px 0;
}

.friends-view__list > *:not(:last-child) {
  border-bottom: 0.5px solid var(--tg-hint-color, #e0e0e0);
}

.friends-view__invite-link {
  display: block;
  width: 100%;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: var(--tg-button-color, #3390ec);
  background: var(--tg-bg-color, #ffffff);
  border: none;
  cursor: pointer;
}

.friends-view__invite-link:active {
  background: var(--tg-secondary-bg-color, #f5f5f5);
}
</style>
