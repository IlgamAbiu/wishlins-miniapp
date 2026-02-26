```html
<script setup lang="ts">
/**
 * FriendsView - Friends tab.
 * Displays list of friends sorted by birthday.
 */
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import FriendCard from '@/components/FriendCard.vue'
import type { User } from '@/types'

import { userService } from '@/services/user.service'
import { useRouter } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { subscribeVersion } from '@/composables/useUser'

const router = useRouter()

const { webapp, user } = useTelegramWebApp()
const friends = ref<User[]>([])
const searchResults = ref<User[]>([])
const isLoading = ref(true)
const isSearching = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('') // Search state

// Displayed users: either search results or friends list
const displayedUsers = computed(() => {
    if (searchQuery.value && searchResults.value.length > 0) {
        return searchResults.value
    }
    // If search query is present but no results, return empty (handled by template)
    if (searchQuery.value && searchResults.value.length === 0) {
        return []
    }
    return friends.value
})

const isSearchMode = computed(() => searchQuery.value.length > 0)

async function fetchFriends() {
  if (!user.value) {
    console.warn('User not available, cannot fetch friends.')
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null
    friends.value = await userService.getFriends(user.value.id)
  } catch (e) {
    console.error('Error fetching friends:', e)
    error.value = 'Не удалось загрузить список друзей'
  } finally {
    isLoading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>

async function handleSearch() {
    if (!searchQuery.value) {
        searchResults.value = []
        return
    }
    
    if (!user.value) return 

    isSearching.value = true
    try {
       const results = await userService.searchUsers(searchQuery.value, user.value.id)
       // Filter out self
       searchResults.value = results.filter(u => u.telegram_id !== user.value?.id)
    } catch (e) {
        console.error('Search error:', e)
    } finally {
        isSearching.value = false
    }
}

// Debounced search watcher
watch(searchQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (!searchQuery.value) {
        searchResults.value = []
        return
    }
    searchTimeout = setTimeout(() => {
        handleSearch()
    }, 500)
})

function handleAddFriend() {
    const message = encodeURIComponent('Присоединяйся ко мне в Wishlins и смотри мой вишлист! 🎁')
    const url = encodeURIComponent('https://t.me/my_123_wishlist_bot')
    webapp.value?.openTelegramLink(`https://t.me/share/url?url=${url}&text=${message}`)
}

function openFriendProfile(friendId: number) {
    router.push({ name: 'FriendProfile', params: { friendId } })
}

// Removed localized back button logic. Handled by generic useNativeNavigation

// Dismiss keyboard on background click
function handleBackgroundClick(event: Event) {
    const target = event.target as HTMLElement
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        (document.activeElement as HTMLElement)?.blur()
    }
}

onMounted(() => {
  fetchFriends()
})

// Re-fetch friends list whenever a subscription changes (subscribe/unsubscribe from ProfileView)
watch(subscribeVersion, () => {
  fetchFriends()
})
</script>

<template>
  <div class="friends-view-stack" @click="handleBackgroundClick">
      <!-- Friends List (Always rendered, overlay will cover it) -->
      <div class="friends-list-view">
            <div class="friends-view__header">
            <div class="header-top">
                <div class="header-text-column">
                    <h1 class="friends-view__title">Друзья</h1>
                    <p class="friends-view__subtitle">Ваш круг общения</p>
                </div>
                <button class="friends-view__add-btn" @click="handleAddFriend" aria-label="Добавить друга">
                    <span class="material-symbols-outlined friends-view__add-icon">person_add</span>
                </button>
            </div>
            
            <!-- Search Bar -->
            <div class="search-bar-wrapper">
                <div class="search-bar glass-panel">
                    <span class="material-symbols-outlined search-icon">search</span>
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        class="search-input" 
                        placeholder="Поиск друзей..." 
                    />
                </div>
            </div>
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
            
            <!-- Default Empty State: No friends at all and not searching -->
            <div v-else-if="friends.length === 0 && !isSearchMode" class="friends-view__empty">
            <div class="placeholder">
                <div class="placeholder__icon-wrapper">
                <div class="placeholder__icon">🎁</div>
                <div class="placeholder__sparkle">🌟</div>
                </div>
                <!-- <h2 class="placeholder__title">Пока нет друзей</h2> -->
                <p class="placeholder__text">Ищите друзей через поиск или пригласите их в приложение!</p>
                <button class="primary-button" @click="handleAddFriend">Пригласить друзей</button>
            </div>
            </div>
            
            <!-- Search Loading -->
            <div v-else-if="isSearching" class="friends-view__loading">
                 <span class="material-symbols-outlined spin">progress_activity</span>
            </div>

            <!-- Search Result: Not Found -->
            <div v-else-if="isSearchMode && displayedUsers.length === 0" class="friends-view__empty search-empty">
                <div class="placeholder">
                    <p class="placeholder__text">Такого пользователя нет в Wishlist</p>
                    <button class="primary-button" @click="handleAddFriend">Пригласить?</button>
                </div>
            </div>
            
            <div v-else class="friends-view__grid">
            <FriendCard 
                v-for="friend in displayedUsers" 
                :key="friend.id" 
                :friend="friend"
                @click="openFriendProfile(friend.telegram_id)"
            />
            </div>
    </div>
  </div>
</template>

<style scoped>


.friends-view__header {
  display: flex;
  flex-direction: column;
  padding: calc(var(--safe-area-top) + var(--side-padding)) var(--side-padding) 16px;
  margin-bottom: 16px;
}

.header-text-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friends-view__title {
  font-size: 34px;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme='dark'] .friends-view__title {
  background: linear-gradient(135deg, #a8b5ff 0%, #c4a4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.friends-view__subtitle {
  font-size: 15px;
  color: var(--tg-subtitle-text-color);
  margin: 0;
  font-weight: 400;
}


.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.friends-view__add-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: var(--glass-btn-bg);
  color: var(--tg-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.friends-view__add-btn:active {
  background: var(--glass-border);
  transform: scale(0.95);
}

.friends-view__add-icon {
  font-size: 22px;
  line-height: 1;
}

/* === Search Bar === */
.search-bar-wrapper {
  margin-bottom: 8px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  border-radius: 24px;
  background: var(--tg-secondary-bg-color);
  border: 1px solid var(--tg-border-color);
  transition: all 0.2s ease;
}

[data-theme='dark'] .search-bar {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

[data-theme='dark'] .search-bar:focus-within {
  background: rgba(30, 41, 59, 0.7);
}

.search-bar:focus-within {
  border-color: var(--tg-button-color);
  background: var(--tg-bg-color);
}


.search-icon {
  color: var(--tg-hint-color);
  font-size: 20px;
  margin-right: 12px;
  opacity: 0.7;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--tg-text-color);
  font-size: 16px;
  font-weight: 400;
  outline: none;
  width: 100%;
}

.search-input::placeholder {
  color: var(--tg-hint-color);
  opacity: 0.6;
}

/* Search Empty State */
.search-empty {
    height: 50vh; /* Slightly smaller height than main empty state */
}


.friends-view__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 var(--side-padding); /* Added padding to prevent edge touching */
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

.spin {
    animation: spin 1s linear infinite;
    font-size: 32px;
    color: var(--tg-button-color);
}

@keyframes spin {
    100% { transform: rotate(360deg); }
}
</style>
