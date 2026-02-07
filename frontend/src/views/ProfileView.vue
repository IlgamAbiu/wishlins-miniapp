<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 */
import { ref, watch, onMounted, computed } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'
import { useWishes } from '@/composables/useWishes'
import EventCarousel from '@/components/EventCarousel.vue'
import EventActions from '@/components/EventActions.vue'
import WishGrid from '@/components/WishGrid.vue'
import AddWishModal from '@/components/AddWishModal.vue'
import AddEventModal from '@/components/AddEventModal.vue'

const { isInTelegram, user, userDisplayName } = useTelegramWebApp()
const { wishlists, fetchWishlists, createWishlist, updateWishlist, deleteWishlist } = useWishlists()
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish } = useWishes()

const selectedEventId = ref<string | null>(null)
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)
const editingEvent = ref<any>(null) // Event being edited

const selectedEvent = computed(() => 
  wishlists.value.find(w => w.id === selectedEventId.value)
)

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

async function handleSaveEvent(title: string, emoji: string, date: string) {
  if (!user.value) return
  
  if (editingEvent.value) {
    // Update existing
    const updated = await updateWishlist(editingEvent.value.id, {
      title,
      emoji,
      eventDate: date
    })
    if (updated) {
      showAddEventModal.value = false
      editingEvent.value = null
    }
  } else {
    // Create new
    const newWishlist = await createWishlist(title, user.value.id, true, emoji, date)
    if (newWishlist) {
      showAddEventModal.value = false
      selectedEventId.value = newWishlist.id
    }
  }
}

function openCreateEventModal() {
  editingEvent.value = null
  showAddEventModal.value = true
}

function handleEditEvent() {
  editingEvent.value = selectedEvent.value
  showAddEventModal.value = true
}

async function handleDeleteEvent() {
  if (!selectedEvent.value || !confirm('Удалить это событие и все желания в нем?')) return
  
  const success = await deleteWishlist(selectedEvent.value.id)
  if (success) {
    // Select default event
    const defaultEvent = wishlists.value.find(w => w.is_default)
    if (defaultEvent) selectedEventId.value = defaultEvent.id
  }
}

function handleShareEvent() {
  // TODO: Implement real sharing
  console.log('Sharing event:', selectedEvent.value?.id)
  if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert('Ссылка на событие скопирована!')
  } else {
      alert('Ссылка скопирована! (тест)')
  }
}

async function handleAddWish(data: any) {
  if (!selectedEventId.value || !user.value) return
  
  const newWish = await createWish({
    ...data,
    wishlist_id: selectedEventId.value
  }, user.value.id)
  
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
          @add="openCreateEventModal"
        />
      </section>

      <!-- Event Actions (Edit/Share/Delete) -->
      <EventActions
        v-if="selectedEvent"
        :event="selectedEvent"
        :can-delete="true"
        @edit="handleEditEvent"
        @share="handleShareEvent"
        @delete="handleDeleteEvent"
      />

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

      <!-- Floating Sticky Button -->
      <div class="sticky-footer">
        <button class="main-add-btn" @click="showAddWishModal = true">
          <span class="btn-icon">+</span>
          Добавить желание
        </button>
      </div>

      <!-- Modals -->
      <Teleport to="body">
         <AddWishModal
           v-if="showAddWishModal"
           @close="showAddWishModal = false"
           @submit="handleAddWish"
         />
         <AddEventModal
           v-if="showAddEventModal"
           :initial-data="editingEvent ? { 
             title: editingEvent.title, 
             emoji: editingEvent.emoji, 
             date: editingEvent.event_date 
           } : undefined"
           @close="showAddEventModal = false"
           @submit="handleSaveEvent"
         />
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100vh;
  background: transparent; /* Let Aurora shine through */
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden; /* For blurred circles if added later */
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px; /* Space for sticky button */
  -webkit-overflow-scrolling: touch;
}

.header {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  /* Liquid Glass Header */
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background-color var(--transition-normal);
}

[data-theme='dark'] .header {
  background: rgba(28, 28, 30, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--tg-border-color);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FF9F0A, #FF375F);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-info h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-text-color, #000);
  line-height: 1.2;
}

.username {
  color: var(--tg-hint-color);
  font-size: var(--font-size-secondary);
  font-weight: 400;
}

.events-section {
  padding-top: 10px;
  margin-bottom: 10px;
}

.wishes-section {
  min-height: 200px;
  padding-top: 10px;
}

.sticky-footer {
  position: fixed;
  bottom: 90px; /* Above TabBar */
  left: 0;
  right: 0;
  padding: 0 var(--spacing-lg);
  z-index: 100;
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding-bottom: env(safe-area-inset-bottom);
}

.main-add-btn {
  pointer-events: auto;
  width: 100%;
  max-width: 400px;
  height: 56px;
  
  /* Aurora Button */
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: var(--tg-text-color); /* Adaptive text */
  
  border-radius: 28px; /* Fully rounded pill */
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  cursor: pointer;
  transition: transform var(--transition-normal), background var(--transition-normal);
  
  /* Gradient text/icon if possible, but solid is safer for contrast */
}

.main-add-btn:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.4);
}

.btn-icon {
  font-size: 24px;
  font-weight: 400;
  line-height: 1;
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
