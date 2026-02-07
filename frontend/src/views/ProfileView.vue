<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 */
import { ref, watch, computed } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'
import { useWishes } from '@/composables/useWishes'
import { useUser } from '@/composables/useUser'
import EventCarousel from '@/components/EventCarousel.vue'
import WishGrid from '@/components/WishGrid.vue'
import AddWishModal from '@/components/AddWishModal.vue'
import AddEventModal from '@/components/AddEventModal.vue'
import EditProfileTextModal from '@/components/EditProfileTextModal.vue'
import DeleteEventModal from '@/components/DeleteEventModal.vue'
import EventLimitModal from '@/components/EventLimitModal.vue'

const { isInTelegram, user, userDisplayName } = useTelegramWebApp()
const { wishlists, fetchWishlists, createWishlist, updateWishlist, deleteWishlist } = useWishlists()
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish, moveWishesToWishlist } = useWishes()
const { updateProfileText, getUserByTelegramId } = useUser()

const selectedEventId = ref<string | null>(null)
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)
const showEditProfileModal = ref(false)
const showDeleteEventModal = ref(false)
const showEventLimitModal = ref(false)
const editingEvent = ref<any>(null) // Event being edited
const eventToDelete = ref<any>(null) // Event being deleted
const profileText = ref('Saving for a dream ✨')

// Event limit constant
const MAX_EVENTS = 5

const selectedEvent = computed(() => 
  wishlists.value.find(w => w.id === selectedEventId.value)
)

// Initial Data Fetch
async function initData() {
  if (user.value) {
    // Load user profile data including profile_text
    const userData = await getUserByTelegramId(user.value.id)
    if (userData && userData.profile_text) {
      profileText.value = userData.profile_text
    }

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

async function handleSaveEvent(title: string, date: string, description: string) {
  if (!user.value) return

  if (editingEvent.value) {
    // Update existing
    const updated = await updateWishlist(editingEvent.value.id, {
      title,
      eventDate: date || null,
      description: description || null
    })
    if (updated) {
      showAddEventModal.value = false
      editingEvent.value = null
    }
  } else {
    // Create new (emoji removed)
    const newWishlist = await createWishlist(
      title,
      user.value.id,
      true,
      null,
      date || null,
      description || null
    )
    if (newWishlist) {
      showAddEventModal.value = false
      selectedEventId.value = newWishlist.id
    }
  }
}

function openCreateEventModal() {
  // Check event limit (max 5 events)
  if (wishlists.value.length >= MAX_EVENTS) {
    showEventLimitModal.value = true
    return
  }

  editingEvent.value = null
  showAddEventModal.value = true
}

function handleEditEvent() {
  editingEvent.value = selectedEvent.value
  showAddEventModal.value = true
}

function handleDeleteEvent() {
  if (!selectedEvent.value) return

  // Check if event has wishes
  if (wishes.value.length > 0) {
    // Show modal with options
    eventToDelete.value = selectedEvent.value
    showDeleteEventModal.value = true
  } else {
    // Delete immediately if no wishes
    confirmDeleteEvent(false)
  }
}

async function confirmDeleteEvent(moveWishes: boolean) {
  if (!eventToDelete.value && !selectedEvent.value) return

  const eventId = (eventToDelete.value || selectedEvent.value).id

  try {
    // If user wants to move wishes, move them to default wishlist first
    if (moveWishes && wishes.value.length > 0 && user.value) {
      const defaultEvent = wishlists.value.find(w => w.is_default)
      if (defaultEvent) {
        const moved = await moveWishesToWishlist(eventId, defaultEvent.id, user.value.id)
        if (!moved) {
          alert('Не удалось переместить желания')
          return
        }
      }
    }

    // Delete the wishlist
    const success = await deleteWishlist(eventId)
    if (success) {
      showDeleteEventModal.value = false
      eventToDelete.value = null

      // Select default event
      const defaultEvent = wishlists.value.find(w => w.is_default)
      if (defaultEvent) selectedEventId.value = defaultEvent.id
    }
  } catch (err) {
    console.error('Failed to delete event:', err)
    alert('Произошла ошибка при удалении события')
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

function handleEditProfile() {
  showEditProfileModal.value = true
}

async function handleSaveProfileText(text: string) {
  if (!user.value) return

  const success = await updateProfileText(user.value.id, text)
  if (success) {
    profileText.value = text
    showEditProfileModal.value = false
  }
}

// Склонение слова "желание"
function pluralizeWishes(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const titles = ['желание', 'желания', 'желаний']
  const index = (count % 100 > 4 && count % 100 < 20)
    ? 2
    : cases[Math.min(count % 10, 5)]
  return `${count} ${titles[index]}`
}
</script>

<template>
  <div class="profile-view">
    <!-- Not in Telegram -->
    <div v-if="!isInTelegram" class="not-telegram">
      <p>Only works in Telegram</p>
    </div>

    <div v-else class="content">
      <!-- Header with glass-panel -->
      <header class="header-section">
        <div class="glass-panel header-panel" @click="handleEditProfile">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img v-if="user?.photo_url" :src="user.photo_url" alt="avatar" />
              <div v-else class="avatar-placeholder">{{ userDisplayName.charAt(0) }}</div>
              <div class="avatar-status"></div>
            </div>
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ userDisplayName }}</h1>
            <p class="user-subtitle">{{ profileText }}</p>
          </div>
        </div>

        <!-- Events Carousel -->
        <div class="carousel-wrapper">
          <EventCarousel
            :events="wishlists"
            :selected-event-id="selectedEventId"
            @select="handleEventSelect"
            @add="openCreateEventModal"
          />
        </div>

        <!-- Event Description (if exists) -->
        <div v-if="selectedEvent?.description" class="event-description-wrapper">
          <div class="event-description glass-card-new">
            <p class="description-text">
              «{{ selectedEvent.description }}»
            </p>
          </div>
        </div>

        <!-- Event Actions Row -->
        <div v-if="selectedEvent" class="actions-row">
          <div class="actions-buttons">
            <button
              v-if="!selectedEvent.is_default"
              class="glass-btn flex items-center justify-center h-10 w-10 rounded-xl text-slate-400"
              @click="handleEditEvent"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              v-if="!selectedEvent.is_default"
              class="glass-btn flex items-center justify-center h-10 w-10 rounded-xl text-slate-400"
              @click="handleDeleteEvent"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
            <button class="glass-btn flex items-center justify-center h-10 w-10 rounded-xl text-slate-400" @click="handleShareEvent">
              <span class="material-symbols-outlined text-[18px]">ios_share</span>
            </button>
          </div>
          <div class="item-count">
            <span class="count-label">{{ pluralizeWishes(wishes.length) }}</span>
          </div>
        </div>
      </header>

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

      <!-- Floating FAB Button -->
      <button class="fab-button" @click="showAddWishModal = true">
        <span class="fab-icon">+</span>
      </button>

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
             date: editingEvent.event_date,
             description: editingEvent.description || ''
           } : undefined"
           @close="showAddEventModal = false"
           @submit="handleSaveEvent"
         />
         <EditProfileTextModal
           v-if="showEditProfileModal"
           :initial-text="profileText"
           @close="showEditProfileModal = false"
           @submit="handleSaveProfileText"
         />
         <DeleteEventModal
           v-if="showDeleteEventModal && eventToDelete"
           :event-title="eventToDelete.title"
           :wishes-count="wishes.length"
           @close="showDeleteEventModal = false; eventToDelete = null"
           @confirm="confirmDeleteEvent"
         />
         <EventLimitModal
           v-if="showEventLimitModal"
           @close="showEventLimitModal = false"
         />
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 120px;
  -webkit-overflow-scrolling: touch;
}

/* === HEADER SECTION === */
.header-section {
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-panel {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-panel:active {
  transform: scale(0.98);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
  position: relative;
}

[data-theme='dark'] .avatar {
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #34C759;
  border: 2px solid white;
  border-radius: 50%;
}

[data-theme='dark'] .avatar-status {
  background: #30D158;
  border: 2px solid #1C1C1E;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111118;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

[data-theme='dark'] .user-name {
  color: #FFFFFF;
}

.user-subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
}

[data-theme='dark'] .user-subtitle {
  color: #8E8E93;
}

/* === CAROUSEL WRAPPER === */
.carousel-wrapper {
  margin: 0 -20px;
  padding: 0 20px;
  /* Prevent shadow clipping in carousel */
  overflow: visible;
}

/* === EVENT DESCRIPTION === */
.event-description-wrapper {
  padding: 0 20px;
  margin-top: 16px;
}

.event-description {
  padding: 16px;
  border-radius: 16px;
}

.description-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  font-weight: 400;
  font-style: italic;
}

[data-theme='dark'] .description-text {
  color: #9CA3AF;
}

/* === ACTIONS ROW === */
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.actions-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

[data-theme='dark'] .action-btn {
  color: rgba(255, 255, 255, 0.6);
}

.action-btn .icon {
  font-size: 18px;
}

.item-count {
  text-align: right;
}

.count-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

[data-theme='dark'] .count-label {
  color: #6B7280;
}

/* === WISHES SECTION === */
.wishes-section {
  min-height: 200px;
  margin-top: 20px;
}

/* === FAB BUTTON === */
.fab-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--tg-button-color);
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(10, 13, 194, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
}

[data-theme='dark'] .fab-button {
  border: 4px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 25px rgba(10, 132, 255, 0.4);
}

.fab-button:hover {
  transform: scale(1.05);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 36px;
  font-weight: 300;
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
