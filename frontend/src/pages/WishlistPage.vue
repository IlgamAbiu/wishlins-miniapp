<script setup lang="ts">
/**
 * Main wishlist page component.
 */
import { ref, onMounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import { userApi } from '@/api/client'
import type { User } from '@/types'
import Header from '@/components/Header.vue'
import EmptyState from '@/components/EmptyState.vue'

const { isReady, displayName, avatarUrl, getTelegramId, isInTelegram } = useTelegram()

const user = ref<User | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

/**
 * Fetch user data from backend.
 */
async function fetchUser() {
  const telegramId = getTelegramId()

  if (!telegramId) {
    // Not in Telegram or no user data - use mock for development
    isLoading.value = false
    return
  }

  try {
    user.value = await userApi.getByTelegramId(telegramId)
  } catch (err) {
    console.error('Failed to fetch user:', err)
    // Don't show error - user might not be registered yet
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Wait for Telegram SDK to be ready
  while (!isReady.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  await fetchUser()
})
</script>

<template>
  <div class="wishlist-page">
    <Header
      :display-name="displayName"
      :avatar-url="avatarUrl"
    />

    <main class="wishlist-page__content">
      <div v-if="isLoading" class="wishlist-page__loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="wishlist-page__error">
        {{ error }}
      </div>

      <EmptyState v-else />
    </main>
  </div>
</template>

<style scoped>
.wishlist-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--tg-secondary-bg-color, #f5f5f5);
}

.wishlist-page__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.wishlist-page__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--tg-hint-color, #e0e0e0);
  border-top-color: var(--tg-button-color, #3390ec);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.wishlist-page__error {
  padding: 20px;
  text-align: center;
  color: var(--tg-hint-color, #999999);
}
</style>
