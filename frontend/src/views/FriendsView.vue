<script setup lang="ts">
/**
 * FriendsView - Friends tab.
 * Displays list of friends sorted by birthday.
 */
import { ref, onMounted } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import FriendCard from '@/components/FriendCard.vue'
import type { User } from '@/types'

const { webapp } = useTelegramWebApp()
const friends = ref<User[]>([])
const isLoading = ref(true)

// Mock API call for now, replacing with real fetch later
async function fetchFriends() {
  try {
    isLoading.value = true
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Generate mock data for testing
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    const nextMonth = new Date(today)
    nextMonth.setMonth(today.getMonth() + 1)
    
    const mockFriends: User[] = [
        {
            id: '1',
            telegram_id: 111,
            username: 'alex_dev',
            first_name: 'Alex',
            last_name: 'D.',
            avatar_url: 'https://i.pravatar.cc/150?u=1',
            profile_text: 'Coding all day',
            birth_date: nextWeek.toISOString().split('T')[0], // Birthday in a week
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '2',
            telegram_id: 222,
            username: 'sarah_design',
            first_name: 'Sarah',
            last_name: 'Connor',
            avatar_url: 'https://i.pravatar.cc/150?u=2',
            profile_text: 'Saving the future',
            birth_date: today.toISOString().split('T')[0], // Birthday today!
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '3',
            telegram_id: 333,
            username: 'mike_tyson',
            first_name: 'Mike',
            last_name: null,
            avatar_url: null, // Placeholder test
            profile_text: 'Champ',
            birth_date: tomorrow.toISOString().split('T')[0], // Birthday tomorrow
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '4',
            telegram_id: 444,
            username: null,
            first_name: 'Elena',
            last_name: 'Gilbert',
            avatar_url: 'https://i.pravatar.cc/150?u=4',
            profile_text: 'Vampire diaries',
            birth_date: nextMonth.toISOString().split('T')[0], // Birthday next month
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
    
    // Sort logic mimics backend: sort by next birthday
    friends.value = mockFriends.sort((a, b) => {
        // Simplified sort for mock
        const dateA = new Date(a.birth_date!)
        const dateB = new Date(b.birth_date!)
        
        // Use a simple comparison of "days from now" logic (duplicated from backend logic roughly)
        // For quick mock sorting, let's just rely on the order we defined above if we want specific order,
        // or actually implement the sort.
        // Let's implement simple sort for fidelity.
        
        const getNextBday = (d: Date) => {
            const currentYear = new Date().getFullYear()
            const bday = new Date(d)
            bday.setFullYear(currentYear)
            if (bday < new Date()) bday.setFullYear(currentYear + 1)
            return bday
        }
        
        return getNextBday(dateA).getTime() - getNextBday(dateB).getTime()
    })

  } catch (e) {
    console.error('Error fetching friends:', e)
  } finally {
    isLoading.value = false
  }
}

function handleAddFriend() {
    // Open Telegram Share
    const message = encodeURIComponent('Join me on Wishlins and see my wishlist! 🎁')
    const url = encodeURIComponent('https://t.me/WishlinsBot/app')
    
    webapp.value?.openTelegramLink(`https://t.me/share/url?url=${url}&text=${message}`)
}

onMounted(() => {
  fetchFriends()
})
</script>

<template>
  <div class="friends-view">
    <div class="friends-view__header">
      <h1 class="friends-view__title">Friends</h1>
      <button class="friends-view__add-btn" @click="handleAddFriend" aria-label="Add friend">
        <span class="friends-view__add-icon">+</span>
      </button>
    </div>
    
    <div v-if="isLoading" class="friends-view__loading">
      Loading...
    </div>
    
    <div v-else-if="friends.length === 0" class="friends-view__empty">
      <div class="placeholder">
        <div class="placeholder__icon-wrapper">
          <div class="placeholder__icon">🎁</div>
          <div class="placeholder__sparkle">🌟</div>
        </div>
        <h2 class="placeholder__title">No friends yet</h2>
        <p class="placeholder__text">Invite your friends to share wishlists!</p>
        <button class="primary-button" @click="handleAddFriend">Invite Friends</button>
      </div>
    </div>
    
    <div v-else class="friends-view__grid">
      <p class="friends-view__count">{{ friends.length }} friends have updates</p>
      <FriendCard 
        v-for="friend in friends" 
        :key="friend.id" 
        :friend="friend" 
      />
    </div>
  </div>
</template>

<style scoped>
.friends-view {
  min-height: 100%;
  padding: 2px 16px 100px; /* Bottom padding for tab bar */
  box-sizing: border-box;
}

.friends-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 8px;
}

.friends-view__title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  color: white;
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

.friends-view__count {
  grid-column: 1 / -1;
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.friends-view__loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
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
</style>
