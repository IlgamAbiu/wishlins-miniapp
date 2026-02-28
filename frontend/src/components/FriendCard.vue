<script setup lang="ts">
/**
 * FriendCard - Displays a friend in the grid.
 */
import { computed } from 'vue'
import type { User } from '@/types'

const props = defineProps<{
  friend: User
}>()

const wishCount = computed(() => props.friend.wish_count ?? 0)

function pluralizeWishes(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const titles = ['желание', 'желания', 'желаний']
  const index = (count % 100 > 4 && count % 100 < 20)
    ? 2
    : cases[Math.min(count % 10, 5)]
  return `${count} ${titles[index]}`
}

const birthdayText = computed(() => {
  if (!props.friend.birth_date) return 'День рождения не указан'

  const today = new Date()
  const birthDate = new Date(props.friend.birth_date)
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

  today.setHours(0, 0, 0, 0)
  nextBirthday.setHours(0, 0, 0, 0)

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }

  const diffTime = nextBirthday.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'День рождения сегодня! 🎂'
  if (diffDays === 1) return 'День рождения завтра'

  const lastDigit = diffDays % 10
  const lastTwoDigits = diffDays % 100

  let dayWord = 'дней'
  if (lastDigit === 1 && lastTwoDigits !== 11) dayWord = 'день'
  else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) dayWord = 'дня'

  return `До дня рождения ${diffDays} ${dayWord}`
})

const displayName = computed(() => {
  if (props.friend.first_name && props.friend.last_name) {
    return `${props.friend.first_name} ${props.friend.last_name}`
  }
  return props.friend.first_name || props.friend.username || 'Friend'
})

const avatarInitial = computed(() =>
  (props.friend.first_name || props.friend.username || '?')[0].toUpperCase()
)
</script>

<template>
  <div class="friend-card">
    <div class="friend-card__avatar">
      <img v-if="friend.avatar_url" :src="friend.avatar_url" :alt="displayName" />
      <div v-else class="friend-card__avatar-placeholder">{{ avatarInitial }}</div>
    </div>

    <div class="friend-card__info">
      <h3 class="friend-card__name">{{ displayName }}</h3>
      <p class="friend-card__wishes">{{ pluralizeWishes(wishCount) }}</p>

      <div class="friend-card__next-event">
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
  background: var(--gradient-festive);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.friend-card__name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--tg-text-color);
}

.friend-card__wishes {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--tg-hint-color);
  opacity: 0.7;
  letter-spacing: 0.5px;
}

.friend-card__next-event {
  margin-top: 8px;
  background: var(--tg-secondary-bg-color);
  border-radius: 12px;
  padding: 8px 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

[data-theme='dark'] .friend-card__next-event {
  background: rgba(51, 65, 85, 0.6);
}

.friend-card__event-date {
  font-size: 13px;
  color: var(--tg-text-color);
  font-weight: 500;
}
</style>
