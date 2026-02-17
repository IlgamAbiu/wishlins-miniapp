<script setup lang="ts">
/**
 * FriendCard.vue
 * 
 * Displays a friend in the list.
 * features:
 * - Avatar
 * - Name
 * - Wish count (mocked for now)
 * - Next event (Birthday)
 */
import { computed } from 'vue'
import type { User } from '@/types'

interface Props {
  friend: User
}

const props = defineProps<Props>()

// Mock wish count for now since it's not in the User entity yet
const wishCount = computed(() => Math.floor(Math.random() * 20) + 1)

const birthdayText = computed(() => {
  if (!props.friend.birth_date) return 'No birthday set'
  
  const today = new Date()
  const birthDate = new Date(props.friend.birth_date)
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }
  
  const diffTime = Math.abs(nextBirthday.getTime() - today.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Birthday today! 🎂'
  if (diffDays === 1) return 'Birthday tomorrow'
  return `Birthday in ${diffDays} days`
})

const displayName = computed(() => {
    if (props.friend.first_name && props.friend.last_name) {
        return `${props.friend.first_name} ${props.friend.last_name}`
    }
    return props.friend.first_name || props.friend.username || 'Friend'
})

const avatarInitial = computed(() => {
    return (props.friend.first_name || props.friend.username || '?')[0].toUpperCase()
})
</script>

<template>
  <div class="friend-card">
    <div class="friend-card__avatar">
      <img v-if="friend.avatar_url" :src="friend.avatar_url" :alt="displayName" />
      <div v-else class="friend-card__avatar-placeholder">{{ avatarInitial }}</div>
      <div class="friend-card__gift-icon">🎁</div>
    </div>
    
    <div class="friend-card__info">
      <h3 class="friend-card__name">{{ displayName }}</h3>
      <p class="friend-card__wishes">{{ wishCount }} WISHES</p>
      
      <div class="friend-card__next-event">
        <span class="friend-card__event-label">NEXT EVENT</span>
        <span class="friend-card__event-date">{{ birthdayText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-card {
  background: var(--glass-panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.friend-card:active {
  transform: scale(0.96);
}

.friend-card__avatar {
  position: relative;
  width: 80px;
  height: 80px;
}

.friend-card__avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.friend-card__avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.friend-card__gift-icon {
  position: absolute;
  top: 0;
  right: -4px;
  background: #3b82f6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 2px solid var(--bg-color);
}

.friend-card__name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.friend-card__wishes {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.7;
  letter-spacing: 0.5px;
}

.friend-card__next-event {
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.friend-card__event-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-secondary);
  opacity: 0.6;
}

.friend-card__event-date {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
</style>
