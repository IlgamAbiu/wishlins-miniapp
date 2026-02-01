<script setup lang="ts">
/**
 * ProfileView - User profile with wishlists.
 */
import { onMounted, watch } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'

const { isInTelegram, user, userDisplayName } = useTelegramWebApp()
const { wishlists, loading, error, fetchWishlists } = useWishlists()

// Fetch wishlists when user is available
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchWishlists(newUser.id)
  }
}, { immediate: true })

onMounted(() => {
  // If user is already available on mount, fetch wishlists
  if (user.value) {
    fetchWishlists(user.value.id)
  }
})
</script>

<template>
  <div class="profile-view">
    <!-- Not in Telegram message -->
    <div v-if="!isInTelegram" class="not-telegram">
      <div class="not-telegram__icon">📱</div>
      <h2 class="not-telegram__title">Wishlist работает только в Telegram</h2>
      <p class="not-telegram__text">
        Пожалуйста, откройте приложение через Telegram Mini App
      </p>
      <a
        href="https://t.me/my_123_wishlist_bot"
        target="_blank"
        class="not-telegram__button"
      >
        Открыть бота
      </a>
    </div>

    <!-- Profile content -->
    <div v-else class="profile-content">
      <!-- User header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img
            v-if="user?.photo_url"
            :src="user.photo_url"
            :alt="userDisplayName"
            class="profile-avatar__img"
          />
          <div v-else class="profile-avatar__placeholder">
            {{ userDisplayName.charAt(0).toUpperCase() }}
          </div>
        </div>
        <h1 class="profile-name">{{ userDisplayName }}</h1>
        <p v-if="user?.username" class="profile-username">@{{ user.username }}</p>
      </div>

      <!-- Wishlists section -->
      <div class="wishlists-section">
        <h2 class="wishlists-title">Мои списки желаний</h2>

        <!-- Loading state -->
        <div v-if="loading" class="wishlists-loading">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="wishlists-error">
          <div class="wishlists-error__icon">⚠️</div>
          <p class="wishlists-error__text">{{ error }}</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="wishlists.length === 0" class="wishlists-empty">
          <div class="wishlists-empty__icon">📝</div>
          <h3 class="wishlists-empty__title">У вас пока нет списков желаний</h3>
          <p class="wishlists-empty__text">
            Создайте свой первый список, чтобы начать делиться желаниями с друзьями
          </p>
          <button class="wishlists-empty__button">
            Создать список
          </button>
        </div>

        <!-- Wishlists list -->
        <div v-else class="wishlists-list">
          <div
            v-for="wishlist in wishlists"
            :key="wishlist.id"
            class="wishlist-card"
          >
            <div class="wishlist-card__header">
              <h3 class="wishlist-card__title">{{ wishlist.title }}</h3>
              <span
                v-if="wishlist.is_public"
                class="wishlist-card__badge"
              >
                Публичный
              </span>
            </div>
            <p
              v-if="wishlist.description"
              class="wishlist-card__description"
            >
              {{ wishlist.description }}
            </p>
            <div class="wishlist-card__footer">
              <span class="wishlist-card__date">
                Создан {{ new Date(wishlist.created_at).toLocaleDateString('ru-RU') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100%;
  overflow-y: auto;
  background: var(--tg-secondary-bg-color, #f5f5f5);
}

/* Not in Telegram message */
.not-telegram {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.not-telegram__icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.not-telegram__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.not-telegram__text {
  margin: 0 0 24px;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
}

.not-telegram__button {
  display: inline-block;
  padding: 12px 24px;
  background: var(--tg-button-color, #3390ec);
  color: var(--tg-button-text-color, #ffffff);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.not-telegram__button:hover {
  opacity: 0.9;
  text-decoration: none;
}

/* Profile content */
.profile-content {
  padding-bottom: var(--tab-bar-height, 56px);
}

/* Profile header */
.profile-header {
  padding: 24px 20px;
  text-align: center;
  background: var(--tg-bg-color, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  display: inline-block;
  margin-bottom: 16px;
}

.profile-avatar__img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar__placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--tg-button-color, #3390ec);
  color: var(--tg-button-text-color, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
}

.profile-name {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.profile-username {
  margin: 0;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
}

/* Wishlists section */
.wishlists-section {
  padding: 20px;
}

.wishlists-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

/* Loading state */
.wishlists-loading {
  padding: 40px 20px;
  text-align: center;
  color: var(--tg-hint-color, #999999);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--tg-button-color, #3390ec);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.wishlists-error {
  padding: 40px 20px;
  text-align: center;
}

.wishlists-error__icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.wishlists-error__text {
  margin: 0;
  font-size: 15px;
  color: #ff3b30;
}

/* Empty state */
.wishlists-empty {
  padding: 40px 20px;
  text-align: center;
}

.wishlists-empty__icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.wishlists-empty__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.wishlists-empty__text {
  margin: 0 0 24px;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
}

.wishlists-empty__button {
  padding: 12px 24px;
  background: var(--tg-button-color, #3390ec);
  color: var(--tg-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.wishlists-empty__button:hover {
  opacity: 0.9;
}

/* Wishlists list */
.wishlists-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wishlist-card {
  padding: 16px;
  background: var(--tg-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.wishlist-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}

.wishlist-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--tg-text-color, #000000);
  flex: 1;
}

.wishlist-card__badge {
  padding: 4px 8px;
  background: var(--tg-button-color, #3390ec);
  color: var(--tg-button-text-color, #ffffff);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.wishlist-card__description {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--tg-hint-color, #999999);
  line-height: 1.4;
}

.wishlist-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wishlist-card__date {
  font-size: 13px;
  color: var(--tg-hint-color, #999999);
}
</style>
