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
      <!-- Header with glass-panel -->
      <header class="header-section">
        <div class="glass-panel header-panel">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img v-if="user?.photo_url" :src="user.photo_url" alt="avatar" />
              <div v-else class="avatar-placeholder">{{ userDisplayName.charAt(0) }}</div>
              <div class="avatar-status"></div>
            </div>
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ userDisplayName }}</h1>
            <p class="user-subtitle">Saving for a dream ✨</p>
          </div>
          <button class="glass-btn notification-btn">
            <span class="icon">🔔</span>
          </button>
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

        <!-- Event Actions Row -->
        <div v-if="selectedEvent" class="actions-row">
          <div class="actions-buttons">
            <button class="glass-btn action-btn" @click="handleEditEvent">
              <span class="icon">✏️</span>
            </button>
            <button class="glass-btn action-btn" @click="handleDeleteEvent">
              <span class="icon">🗑️</span>
            </button>
            <button class="glass-btn action-btn" @click="handleShareEvent">
              <span class="icon">↗️</span>
            </button>
          </div>
          <div class="item-count">
            <span class="count-label">{{ wishes.length }} items</span>
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

.notification-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
}

[data-theme='dark'] .notification-btn {
  color: rgba(255, 255, 255, 0.8);
}

.notification-btn .icon {
  font-size: 20px;
}

/* === CAROUSEL WRAPPER === */
.carousel-wrapper {
  margin: 0 -20px;
  padding: 0 20px;
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
  border-radius: 12px;
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
