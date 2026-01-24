<script setup lang="ts">
/**
 * ProfileHeader - User profile header with avatar and stats.
 */
import { computed } from 'vue'

interface Props {
  displayName: string
  username?: string | null
  avatarUrl?: string | null
  wishlistCount: number
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
  <div class="profile-header">
    <div class="profile-header__avatar">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="displayName"
        class="profile-header__avatar-image"
      />
      <span v-else class="profile-header__avatar-initials">
        {{ initials }}
      </span>
    </div>

    <div class="profile-header__info">
      <h1 class="profile-header__name">{{ displayName }}</h1>
      <p v-if="username" class="profile-header__username">@{{ username }}</p>
    </div>

    <div class="profile-header__stats">
      <div class="profile-header__stat">
        <span class="profile-header__stat-value">{{ wishlistCount }}</span>
        <span class="profile-header__stat-label">Items</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--tg-bg-color, #ffffff);
}

.profile-header__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--tg-button-color, #3390ec) 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.profile-header__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-header__avatar-initials {
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
}

.profile-header__info {
  text-align: center;
  margin-bottom: 16px;
}

.profile-header__name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.profile-header__username {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--tg-hint-color, #999999);
}

.profile-header__stats {
  display: flex;
  gap: 32px;
}

.profile-header__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header__stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-text-color, #000000);
}

.profile-header__stat-label {
  font-size: 12px;
  color: var(--tg-hint-color, #999999);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
