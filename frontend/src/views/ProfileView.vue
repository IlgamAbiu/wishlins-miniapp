<script setup lang="ts">
/**
 * ProfileView - Profile/Wishlist tab view.
 *
 * Architecture:
 * - Uses userStore for state management
 * - Orchestrates user and wishlist data loading
 * - Delegates rendering to child components
 *
 * SOLID:
 * - Single Responsibility: Profile page orchestration
 * - Components handle only UI rendering
 */
import { computed, onMounted } from 'vue'
import { userStore } from '@/stores'
import { telegramService } from '@/services'
import { ProfileHeader, WishlistItem } from '@/components/profile'
import { LoadingSpinner, EmptyState } from '@/components/common'

const { state, loadUser, loadWishlist, displayName, wishlistCount, togglePurchased, removeFromWishlist } = userStore

const isLoading = computed(() => state.isLoading || state.isWishlistLoading)
const avatarUrl = computed(() => state.user?.avatar_url || telegramService.getAvatarUrl())
const username = computed(() => state.user?.username)

async function handleToggle(itemId: string) {
  telegramService.hapticFeedback('light')
  await togglePurchased(itemId)
}

async function handleDelete(itemId: string) {
  telegramService.hapticFeedback('medium')
  await removeFromWishlist(itemId)
}

onMounted(async () => {
  await Promise.all([loadUser(), loadWishlist()])
})
</script>

<template>
  <div class="profile-view">
    <div v-if="isLoading && !state.user" class="profile-view__loading">
      <LoadingSpinner size="large" />
    </div>

    <template v-else>
      <ProfileHeader
        :display-name="displayName"
        :username="username"
        :avatar-url="avatarUrl"
        :wishlist-count="wishlistCount"
      />

      <section class="profile-view__section">
        <h2 class="profile-view__section-title">My Wishlist</h2>

        <div v-if="state.isWishlistLoading" class="profile-view__section-loading">
          <LoadingSpinner size="small" />
        </div>

        <div v-else-if="state.wishlist.length === 0" class="profile-view__empty">
          <EmptyState
            icon="🎁"
            title="Your wishlist is empty"
            description="Start adding items you'd love to receive as gifts."
          />
        </div>

        <div v-else class="profile-view__wishlist">
          <WishlistItem
            v-for="item in state.wishlist"
            :key="item.id"
            :item="item"
            @toggle="handleToggle"
            @delete="handleDelete"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--tg-secondary-bg-color, #f5f5f5);
  padding-bottom: 100px; /* Space for tab bar */
}

.profile-view__loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.profile-view__section {
  margin-top: 16px;
}

.profile-view__section-title {
  margin: 0 0 12px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-hint-color, #999999);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-view__section-loading {
  padding: 20px;
}

.profile-view__empty {
  background: var(--tg-bg-color, #ffffff);
  border-radius: 12px;
  margin: 0 16px;
}

.profile-view__wishlist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}
</style>
