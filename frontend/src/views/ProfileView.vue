<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 */
import { ref, watch, computed, onMounted } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'
import { useWishes } from '@/composables/useWishes'
import { useUser } from '@/composables/useUser'
import { navigationStore } from '@/stores/navigation.store'
import EventCarousel from '@/components/EventCarousel.vue'
import WishGrid from '@/components/WishGrid.vue'
import AddWishModal from '@/components/AddWishModal.vue'
import AddEventModal from '@/components/AddEventModal.vue'
import EditProfileTextModal from '@/components/EditProfileTextModal.vue'
import DeleteEventModal from '@/components/DeleteEventModal.vue'
import EventLimitModal from '@/components/EventLimitModal.vue'

const props = defineProps<{
    userId?: number // Optional prop for direct user ID (Stack Navigation)
}>()

const { isInTelegram, user, userDisplayName } = useTelegramWebApp()
const { wishlists, fetchWishlists, createWishlist, updateWishlist, deleteWishlist } = useWishlists()
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish, moveWishesToWishlist, openWish, onWishUpdate } = useWishes()
const { updateProfileText, getUserByTelegramId } = useUser()

const selectedEventId = ref<string | null>(null)
// ... modal state refs ...
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)
const showEditProfileModal = ref(false)
const showDeleteEventModal = ref(false)
const showEventLimitModal = ref(false)
const editingEvent = ref<any>(null)
const eventToDelete = ref<any>(null)
const profileText = ref('Saving for a dream ✨')

// Guest Mode Logic
const targetUserId = computed(() => {
    if (props.userId) return props.userId
    return navigationStore.state.viewedUserId || user.value?.id
})

// Check if we are in "Stack Mode" (navigated from Friends list)
const isStackMode = computed(() => !!props.userId)

const isOwner = computed(() => {
    if (props.userId) return props.userId === user.value?.id
    if (!navigationStore.state.viewedUserId) return true
    return navigationStore.state.viewedUserId === user.value?.id
})

// Current User Display
const currentProfileUser = ref<any>(null)
// ... displayUser computed ...

const displayUser = computed(() => {
    if (isOwner.value) {
        return {
            displayName: userDisplayName.value,
            photoUrl: user.value?.photo_url,
            initial: userDisplayName.value?.charAt(0)
        }
    } else {
        if (!currentProfileUser.value) return { displayName: 'Loading...', photoUrl: null, initial: '?' }
        const u = currentProfileUser.value
        const name = u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name
        return {
            displayName: name,
            photoUrl: u.avatar_url,
            initial: name?.charAt(0) || '?'
        }
    }
})

// Subscribe to global wish updates to keep this list fresh
onMounted(() => {
    // If a global wish update happens (e.g. from Detail View), re-fetch or update local list
    const unsubscribe = onWishUpdate((type, wish, id) => {
        // Simple strategy: if we are viewing the wishlist that was modified, refresh it
        // Or if we don't know, just refresh everything if it affects current user context
        // For MVP, if we are owner, just refresh or let reactivity handle it if we used shared store (but we split it)
        
        // If we are the owner, we definitely want to refresh
        if (isOwner.value && type !== 'create') { 
            // 'create' is usually handled by the creating component adding it, 
            // but if created from somewhere else?
        }
        
        // Actually, easiest way is just to re-fetch wishes for current selected event if any
        if (selectedEventId.value) {
             fetchWishes(selectedEventId.value)
        }
    })
    
    // Clean up on unmount is handled automatically by Vue for top-level setup? 
    // No, onMounted needs explicit onUnmounted if we cared, but script setup is fine usually.
    // Let's add onUnmounted to be safe.
})

function handleGoBack() {
    navigationStore.closeFriendProfile()
}



// Event limit constant
const MAX_EVENTS = 5

const selectedEvent = computed(() => 
  wishlists.value.find(w => w.id === selectedEventId.value)
)

// Initial Data Fetch
const isLoading = ref(true)

async function initData() {
  const userId = targetUserId.value
  if (userId) {
    isLoading.value = true
    try {
      // Load user profile data including profile_text
      const userData = await getUserByTelegramId(userId)
      if (userData) {
        currentProfileUser.value = userData
        if (userData.profile_text) {
          profileText.value = userData.profile_text
        }
      }

      await fetchWishlists(userId)

      // Select default event or first one
      if (wishlists.value.length > 0) {
        const defaultEvent = wishlists.value.find(w => w.is_default)
        selectedEventId.value = defaultEvent ? defaultEvent.id : wishlists.value[0].id
      } else {
          selectedEventId.value = null
      }
    } finally {
      isLoading.value = false
    }
  }
}

// Watch for user changes OR navigation state changes OR prop changes
watch([() => user.value, () => navigationStore.state.viewedUserId, () => props.userId], () => {
   // Reset selected event when switching profiles
   selectedEventId.value = null
   initData()
}, { immediate: true })

// Watch for event selection to fetch wishes
let fetchTimeout: ReturnType<typeof setTimeout>
watch(selectedEventId, (newId) => {
  if (newId) {
    // Debounce fetch to avoid lag during rapid scanning
    if (fetchTimeout) clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(() => {
      fetchWishes(newId)
    }, 300)
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
    // Create new
    const newWishlist = await createWishlist(
      title,
      user.value.id,
      true,
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
  openWish(wish)
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
    <!-- Background Decorative Blobs -->
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>

    <!-- Not in Telegram -->
    <div v-if="!isInTelegram" class="not-telegram">
      <p>Only works in Telegram</p>
    </div>

    <div v-else class="content">
      <!-- Header with glass-panel -->
      <header class="header-section">
        <!-- Back Button for Stack Mode (Guest View) -->
        <div v-if="isStackMode" class="back-button-container" @click="handleGoBack">
            <button class="glass-btn back-header-btn">
                <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
        </div>

        <div 
          class="glass-panel header-panel" 
          :class="{ 'header-with-back-btn': isStackMode }"
          @click="isOwner && handleEditProfile()"
        >
          <div class="avatar-wrapper">
            <div class="avatar">
              <img v-if="displayUser.photoUrl" :src="displayUser.photoUrl" alt="avatar" />
              <div v-else class="avatar-placeholder">{{ displayUser.initial }}</div>
              <div class="avatar-status"></div>
            </div>
          </div>
          
          <div class="user-info">
            <template v-if="isLoading">
              <div class="skeleton skeleton-text" style="width: 120px; height: 24px; margin-bottom: 4px;"></div>
              <div class="skeleton skeleton-text" style="width: 180px; height: 16px;"></div>
            </template>
            <template v-else>
              <h1 class="user-name">{{ displayUser.displayName }}</h1>
              <p class="user-subtitle">{{ profileText }}</p>
            </template>
          </div>
          <button v-if="isOwner" class="glass-btn edit-header-btn">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>

        <!-- Events Carousel -->
        <div class="carousel-wrapper">
          <div v-if="isLoading" class="skeleton-carousel">
             <div class="skeleton event-pill" style="width: 100px;"></div>
             <div class="skeleton event-add-btn"></div>
             <div class="skeleton event-pill" style="width: 120px;"></div>
             <div class="skeleton event-pill" style="width: 90px;"></div>
          </div>
          <EventCarousel
            v-else
            :events="wishlists"
            :selected-event-id="selectedEventId"
            :is-owner="isOwner"
            @select="handleEventSelect"
            @add="openCreateEventModal"
          />
        </div>

        <!-- Event Description (if exists) -->
        <div v-if="selectedEvent?.description" class="event-description-wrapper">
          <div class="event-description glass-card-new">
            <p class="description-text">
              {{ selectedEvent.description }}
            </p>
          </div>
        </div>

        <!-- Event Actions Row -->
        <div v-if="selectedEvent" class="actions-row">
          <div class="actions-buttons">
            <button
              v-if="isOwner && selectedEvent.title !== 'Сбывшиеся мечты'"
              class="glass-btn action-btn"
              @click="handleEditEvent"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              v-if="isOwner && !selectedEvent.is_default"
              class="glass-btn action-btn"
              @click="handleDeleteEvent"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
            <button class="glass-btn action-btn" @click="handleShareEvent">
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
      <button 
        v-if="isOwner && selectedEvent?.title !== 'Сбывшиеся мечты'" 
        class="fab-button" 
        @click="showAddWishModal = true"
      >
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
           :is-default-event="editingEvent?.is_default || false"
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
  isolation: isolate;
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
  gap: 20px;
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

.header-with-back-btn {
  margin-top: 60px; /* Increased from 40px to prevent overlap with 48px button + offset */
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
  background: #10b981;
  border: 2px solid #030308;
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
  color: #f8fafc;
}

.user-subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
}

[data-theme='dark'] .user-subtitle {
  color: #94a3b8;
}

.edit-header-btn {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none; /* Reset if glass-btn has border that conflicts, though glass-btn usually has one */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.4); /* Consistent with light theme template */
}

[data-theme='dark'] .edit-header-btn {
  color: #cbd5e1; /* slate-300 */
  background: rgba(255, 255, 255, 0.1);
}

/* === CAROUSEL WRAPPER === */
.carousel-wrapper {
  margin: 0 -20px;
  padding: 0 20px;
  /* Prevent shadow clipping in carousel */
  overflow: visible;
}

.skeleton-carousel {
  display: flex;
  gap: 8px;
  padding: 4px 0; /* Match EventCarousel padding */
}

.skeleton-carousel .event-pill {
  height: 44px;
  border-radius: 22px;
}

.skeleton-carousel .event-add-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* === EVENT DESCRIPTION === */
/* .event-description-wrapper removed empty rule */

.event-description {
  padding: 16px;
  border-radius: 22px;
}

.description-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  font-weight: 400;
  font-style: italic;
  white-space: pre-line;
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

[data-theme='dark'] .action-btn {
  color: rgba(248, 250, 252, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
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
  bottom: calc(100px + env(safe-area-inset-bottom));
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
  background: #4f46e5;
  border: 4px solid rgba(79, 70, 229, 0.2);
  box-shadow: 0 0 30px rgba(79, 70, 229, 0.5),
              0 8px 24px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .fab-button:hover {
  box-shadow: 0 0 40px rgba(79, 70, 229, 0.7),
              0 8px 24px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
}

[data-theme='dark'] .fab-button:active {
  transform: scale(0.95);
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

/* === BACKGROUND BLOBS === */
.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px); /* Reduced from 120px */
  opacity: 0;
  pointer-events: none;
  z-index: -1;
  mix-blend-mode: screen;
  transition: opacity 0.5s ease;
  will-change: transform;
}

[data-theme='dark'] .bg-blob {
  opacity: 0.12;
}

.bg-blob-1 {
  top: 5%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #4f46e5 0%, transparent 70%);
}

.bg-blob-2 {
  bottom: 15%;
  left: -15%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
}

.back-button-container {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 20;
}

.back-header-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-header-btn:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
}

</style>
