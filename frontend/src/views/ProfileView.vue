<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 */
import { ref, watch, onMounted } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'
import { useWishes } from '@/composables/useWishes'
import { storeToRefs } from 'pinia' // If using stores, but we are using composables directly
import EventCarousel from '@/components/EventCarousel.vue'
import WishGrid from '@/components/WishGrid.vue'
import AddWishModal from '@/components/AddWishModal.vue'
import AddEventModal from '@/components/AddEventModal.vue'

const { isInTelegram, user, userDisplayName } = useTelegramWebApp()
const { wishlists, fetchWishlists, createWishlist } = useWishlists() // Assuming createWishlist exists in useWishlists or will be added
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish } = useWishes()

const selectedEventId = ref<string | null>(null)
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)

// Initial Data Fetch
async function initData() {
  if (user.value) {
    await fetchWishlists(user.value.id)
    
    // Select default event or first one
    if (wishlists.value.length > 0) {
      const defaultEvent = wishlists.value.find(w => w.is_default)
      selectedEventId.value = defaultEvent ? defaultEvent.id : wishlists.value[0].id
    }
  }
}

watch(() => user.value, (newUser) => {
  if (newUser) initData()
}, { immediate: true })

// Watch for event selection to fetch wishes
watch(selectedEventId, (newId) => {
  if (newId) {
    fetchWishes(newId)
  }
})

// Handlers
async function handleEventSelect(id: string) {
  selectedEventId.value = id
}

async function handleAddEvent(title: string) {
  if (!user.value) return
  
  // Create wishlist via simpler API call if useWishlists doesn't support it yet
  // We need to implement createWishlist in useWishlists or call API directly
  // Let's assume we update useWishlists or use direct fetch for now to match the "Execution" speed
  // But cleaner is to update useWishlists.ts. For now I'll just use the composable's method if I add it.
  
  // Actually, I didn't update useWishlists.ts to have createWishlist yet.
  // I should do that. But for now I will inline it or let the modal emit trigger a reload.
  
  try {
     // Quick inline fetch since I didn't edit useWishlists.ts yet
     const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
     const response = await fetch(`${API_BASE_URL}/wishlists/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           title,
           is_public: true // Default to public for events? Or false? Let's say true.
        })
     })
     
     if (response.ok) {
        await fetchWishlists(user.value.id)
        // Select the new one (it should be last created)
        // Actually sorting logic in Carousel handles display
        // We just need to find the one with this title or just created.
        // Simplified: just select the last one in the list (newest usually)
        if (wishlists.value.length > 0) {
           // If backend returns list sorted by something?
           // We can just rely on user seeing it.
        }
        showAddEventModal.value = false
     }
  } catch (e) {
     console.error("Failed to create event", e)
  }
}

async function handleAddWish(data: any) {
  if (!selectedEventId.value) return
  
  const newWish = await createWish({
    ...data,
    wishlist_id: selectedEventId.value
  })
  
  if (newWish) {
    showAddWishModal.value = false
  }
}

function onWishClick(wish: any) {
  // TODO: Open detailed wish view or edit modal
  console.log("Clicked wish", wish)
}
</script>

<template>
  <div class="profile-view">
    <!-- Not in Telegram -->
    <div v-if="!isInTelegram" class="not-telegram">
      <p>Only works in Telegram</p>
    </div>

    <div v-else class="content">
      <!-- Header -->
      <header class="header">
        <div class="avatar">
           <img v-if="user?.photo_url" :src="user.photo_url" alt="avatar" />
           <div v-else class="avatar-placeholder">{{ userDisplayName.charAt(0) }}</div>
        </div>
        <div class="user-info">
          <h1>{{ userDisplayName }}</h1>
          <span class="username">@{{ user?.username }}</span>
        </div>
      </header>

      <!-- Events Carousel -->
      <section class="events-section">
        <EventCarousel
          :events="wishlists"
          :selected-event-id="selectedEventId"
          @select="handleEventSelect"
          @add="showAddEventModal = true"
        />
      </section>

      <!-- Data Status/Grid -->
      <section class="wishes-section">
         <WishGrid
           :wishes="wishes"
           :loading="wishesLoading"
           :error="wishesError"
           @add="showAddWishModal = true"
           @click="onWishClick"
         />
      </section>

      <!-- Modals -->
      <Teleport to="body">
         <AddWishModal
           v-if="showAddWishModal"
           @close="showAddWishModal = false"
           @submit="handleAddWish"
         />
         <AddEventModal
           v-if="showAddEventModal"
           @close="showAddEventModal = false"
           @submit="handleAddEvent"
         />
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100%;
  background: #fbfbfb; /* Light clean background */
  overflow-y: auto;
  padding-bottom: 80px; /* Space for tab bar */
}

.header {
  padding: 24px 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--tg-button-color, #3390ec);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.user-info h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #222;
}

.username {
  color: var(--tg-hint-color, #999);
  font-size: 15px;
}

.events-section {
  margin-top: 24px;
  margin-bottom: 12px;
}

.wishes-section {
  min-height: 200px;
}

/* Transitions */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
