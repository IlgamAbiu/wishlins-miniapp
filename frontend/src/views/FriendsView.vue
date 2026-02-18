<script setup lang="ts">
/**
 * FriendsView - Friends tab.
 * Displays list of friends sorted by birthday.
 */
import { ref, onMounted, computed } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import FriendCard from '@/components/FriendCard.vue'
import type { User } from '@/types'

import { userService } from '@/services/user.service'
import { navigationStore } from '@/stores/navigation.store'

const { webapp, user } = useTelegramWebApp()
const friends = ref<User[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

async function fetchFriends() {
  if (!user.value) {
    // If user is not available (e.g. running outside Telegram without mock), 
    // we can't fetch friends specific to them.
    // Ideally, we should show a login prompt or handle this gracefully.
    // For now, let's just stop loading.
    console.warn('User not available, cannot fetch friends.')
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    // Pass the user's Telegram ID to the service
    friends.value = await userService.getFriends(user.value.id)

  } catch (e) {
    console.error('Error fetching friends:', e)
    error.value = 'Не удалось загрузить список друзей'
  } finally {
    isLoading.value = false
  }
}

function handleAddFriend() {
    // Open Telegram Share
    const message = encodeURIComponent('Присоединяйся ко мне в Wishlins и смотри мой вишлист! 🎁')
    const url = encodeURIComponent('https://t.me/WishlinsBot/app')
    
    webapp.value?.openTelegramLink(`https://t.me/share/url?url=${url}&text=${message}`)
}

function openFriendProfile(friendId: number) {
    navigationStore.openUserProfile(friendId)
}

onMounted(() => {
  fetchFriends()
})
</script>

<template>
  <div class="friends-view">
    <div class="friends-view__header">
      <div class="header-text-column">
        <h1 class="friends-view__title">Друзья</h1>
        <p class="friends-view__subtitle">Ваш круг общения</p>
      </div>
      <button class="friends-view__add-btn" @click="handleAddFriend" aria-label="Добавить друга">
        <span class="friends-view__add-icon">+</span>
      </button>
    </div>
    
    <div v-if="isLoading" class="friends-view__grid">
      <div v-for="i in 6" :key="i" class="friend-card skeleton-card">
        <div class="skeleton skeleton-circle" style="width: 80px; height: 80px; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 40%; height: 14px; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 90%; height: 32px; border-radius: 12px;"></div>
      </div>
    </div>

    <div v-else-if="error" class="friends-view__error">
      <p>{{ error }}</p>
      <button class="primary-button" @click="fetchFriends">Попробовать снова</button>
    </div>
    
    <div v-else-if="friends.length === 0" class="friends-view__empty">
      <div class="placeholder">
        <div class="placeholder__icon-wrapper">
          <div class="placeholder__icon">🎁</div>
          <div class="placeholder__sparkle">🌟</div>
        </div>
        <h2 class="placeholder__title">Пока нет друзей</h2>
        <p class="placeholder__text">Пригласите друзей, чтобы делиться вишлистами!</p>
        <button class="primary-button" @click="handleAddFriend">Пригласить друзей</button>
      </div>
    </div>
    
    <div v-else class="friends-view__grid">
      <!-- Subtitle removed from here -->
      <FriendCard 
        v-for="friend in friends" 
        :key="friend.id" 
        :friend="friend"
        @click="openFriendProfile(friend.telegram_id)"
      />
    </div>
  </div>
</template>

<style scoped>
.friends-view {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 2px 16px 100px; /* Bottom padding for tab bar */
  box-sizing: border-box;
}

.friends-view__header {
  display: flex;
  align-items: flex-start; /* Align to top */
  justify-content: space-between;
  padding: 16px 4px;
  margin-bottom: 16px;
}

.header-text-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friends-view__title {
  font-size: 34px; /* Design seems larger */
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.1;
}

.friends-view__subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6); /* Grayish transparent white */
  margin: 0;
  font-weight: 400;
}

.friends-view__add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.friends-view__add-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.95);
}

.friends-view__add-icon {
  font-size: 24px;
  line-height: 1;
}

.friends-view__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}



.friends-view__loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
}

.friends-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  gap: 16px;
  color: var(--status-error);
}

/* Empty State */
.friends-view__empty {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
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

.placeholder__title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-title-1);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.placeholder__text {
  margin: 0 0 24px;
  font-size: var(--font-size-callout);
  color: var(--tg-hint-color);
  font-weight: var(--font-weight-medium);
}

.primary-button {
  background: var(--tg-button-color);
  color: var(--tg-button-text-color);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

/* Skeleton Card Logic */
.skeleton-card {
  background: var(--glass-panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0; /* Gap handled by margins in skeleton elements */
  height: 240px; /* Approx height */
}
</style>
