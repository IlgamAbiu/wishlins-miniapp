<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 * Used for both own profile (/wishes) and friend profile (/friends/:friendId).
 * 
 * Telegram integrations:
 * - showPopup() for delete event confirmation (replaces DeleteEventModal)
 * - showAlert() for event limit (replaces EventLimitModal)
 * - showConfirm() for destructive actions
 * - HapticFeedback on subscribe/unsubscribe
 */
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useWishlists } from '@/composables/useWishlists'
import { useWishes } from '@/composables/useWishes'
import { useUser } from '@/composables/useUser'
import { useHaptic } from '@/composables/useHaptic'
import EventCarousel from '@/components/EventCarousel.vue'
import WishGrid from '@/components/WishGrid.vue'
import AddWishModal from '@/components/AddWishModal.vue'
import AddEventModal from '@/components/AddEventModal.vue'
import EditProfileTextModal from '@/components/EditProfileTextModal.vue'

const route = useRoute()
const router = useRouter()

const { isInTelegram, user, userDisplayName, showPopup, showAlert } = useTelegramWebApp()
const { wishlists, fetchWishlists, createWishlist, updateWishlist, deleteWishlist } = useWishlists()
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish, moveWishesToWishlist, openWish, onWishUpdate } = useWishes()
const { updateProfileText, getUserByTelegramId, subscribe, unsubscribe } = useUser()
const { impact, notification } = useHaptic()

const selectedEventId = ref<string | null>(null)
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)
const showEditProfileModal = ref(false)
const editingEvent = ref<any>(null)
const profileText = ref('Saving for a dream ✨')
const isSubscribed = ref(false)
const isSubscriptionLoading = ref(false)

// Guest mode logic
const targetUserId = computed(() => {
  const friendId = route.params.friendId
  if (friendId) return Number(friendId)
  return user.value?.id
})

const isGuestMode = computed(() => !!route.params.friendId)

const isOwner = computed(() => {
  if (isGuestMode.value) {
    return Number(route.params.friendId) === user.value?.id
  }
  return true
})

// Current user display
const currentProfileUser = ref<any>(null)

const displayUser = computed(() => {
  if (isOwner.value) {
    return {
      displayName: userDisplayName.value,
      photoUrl: user.value?.photo_url,
      initial: userDisplayName.value?.charAt(0),
    }
  } else {
    if (!currentProfileUser.value) return { displayName: 'Loading...', photoUrl: null, initial: '?' }
    const u = currentProfileUser.value
    const name = u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name
    return {
      displayName: name,
      photoUrl: u.avatar_url,
      initial: name?.charAt(0) || '?',
    }
  }
})

// Event limit
const MAX_EVENTS = 5

const selectedEvent = computed(() =>
  wishlists.value.find(w => w.id === selectedEventId.value)
)

// Global wish update subscription
let wishUpdateUnsubscribe: (() => void) | null = null

onMounted(() => {
  wishUpdateUnsubscribe = onWishUpdate((type) => {
    if (selectedEventId.value) {
      fetchWishes(selectedEventId.value, user.value?.id)
    }
  })
})

onUnmounted(() => {
  if (wishUpdateUnsubscribe) wishUpdateUnsubscribe()
  if (fetchTimeout) clearTimeout(fetchTimeout)
})

// Initial data fetch
const isLoading = ref(true)

async function initData() {
  const userId = targetUserId.value
  if (userId) {
    isLoading.value = true
    try {
      const currentUserTelegramId = user.value?.id
      const userData = await getUserByTelegramId(userId, currentUserTelegramId)

      if (userData) {
        currentProfileUser.value = userData
        if (userData.profile_text) profileText.value = userData.profile_text
        isSubscribed.value = !!userData.is_subscribed
      }

      await fetchWishlists(userId)

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

watch([() => user.value, () => route.params.friendId], () => {
  selectedEventId.value = null
  initData()
}, { immediate: true })

// Fetch wishes on event selection
let fetchTimeout: ReturnType<typeof setTimeout>
watch(selectedEventId, (newId) => {
  if (newId) {
    if (fetchTimeout) clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(() => {
      fetchWishes(newId, user.value?.id)
    }, 300)
  }
})

// Handlers
function handleEventSelect(id: string) {
  selectedEventId.value = id
}

async function handleSaveEvent(title: string, date: string, description: string) {
  if (!user.value) return

  if (editingEvent.value) {
    const updated = await updateWishlist(editingEvent.value.id, {
      title,
      eventDate: date || null,
      description: description || null,
    })
    if (updated) {
      showAddEventModal.value = false
      editingEvent.value = null
    }
  } else {
    const newWishlist = await createWishlist(title, user.value.id, true, date || null, description || null)
    if (newWishlist) {
      showAddEventModal.value = false
      selectedEventId.value = newWishlist.id
      notification('success')
    }
  }
}

function openCreateEventModal() {
  if (wishlists.value.length >= MAX_EVENTS) {
    // Use Telegram showAlert instead of custom EventLimitModal
    showAlert('Максимум 5 событий. Удалите одно из существующих, чтобы создать новое.')
    return
  }
  editingEvent.value = null
  showAddEventModal.value = true
}

function handleEditEvent() {
  editingEvent.value = selectedEvent.value
  showAddEventModal.value = true
}

async function handleDeleteEvent() {
  if (!selectedEvent.value) return

  if (wishes.value.length > 0) {
    // Use Telegram showPopup instead of DeleteEventModal
    const buttonId = await showPopup({
      title: `Удалить «${selectedEvent.value.title}»?`,
      message: `В этом списке ${wishes.value.length} желаний. Что сделать с ними?`,
      buttons: [
        { id: 'move', type: 'default', text: 'Переместить в основной' },
        { id: 'delete', type: 'destructive', text: 'Удалить всё' },
        { id: 'cancel', type: 'cancel' },
      ],
    })

    if (buttonId === 'move') {
      await confirmDeleteEvent(true)
    } else if (buttonId === 'delete') {
      await confirmDeleteEvent(false)
    }
    // 'cancel' — do nothing
  } else {
    await confirmDeleteEvent(false)
  }
}

async function confirmDeleteEvent(moveWishes: boolean) {
  if (!selectedEvent.value) return
  const eventId = selectedEvent.value.id

  try {
    if (moveWishes && wishes.value.length > 0 && user.value) {
      const defaultEvent = wishlists.value.find(w => w.is_default)
      if (defaultEvent) {
        const moved = await moveWishesToWishlist(eventId, defaultEvent.id, user.value.id)
        if (!moved) {
          showAlert('Не удалось переместить желания')
          return
        }
      }
    }

    const success = await deleteWishlist(eventId)
    if (success) {
      impact('medium')
      const defaultEvent = wishlists.value.find(w => w.is_default)
      if (defaultEvent) selectedEventId.value = defaultEvent.id
    }
  } catch (err) {
    console.error('Failed to delete event:', err)
    showAlert('Произошла ошибка при удалении события')
  }
}

function handleShareEvent() {
  const wa = window.Telegram?.WebApp
  if (wa) {
    wa.showAlert('Ссылка на событие скопирована!')
  }
}

async function handleAddWish(data: any) {
  if (!selectedEventId.value || !user.value) return

  const newWish = await createWish({
    ...data,
    wishlist_id: selectedEventId.value,
  }, user.value.id)

  if (newWish) {
    showAddWishModal.value = false
    notification('success')
  }
}

function onWishClick(wish: any) {
  openWish(wish)
  if (isGuestMode.value) {
    router.push(`/friends/${route.params.friendId}/wishes/${wish.id}`)
  } else {
    router.push(`/wishes/${wish.id}`)
  }
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

function pluralizeWishes(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const titles = ['желание', 'желания', 'желаний']
  const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]
  return `${count} ${titles[index]}`
}

async function handleSubscribe() {
  if (!user.value || !targetUserId.value || isSubscriptionLoading.value) return

  isSubscriptionLoading.value = true
  try {
    if (isSubscribed.value) {
      const success = await unsubscribe(user.value.id, targetUserId.value)
      if (success) isSubscribed.value = false
    } else {
      const success = await subscribe(user.value.id, targetUserId.value)
      if (success) isSubscribed.value = true
    }
    impact('medium')
  } finally {
    isSubscriptionLoading.value = false
  }
}
</script>

<template>
  <div class="profile-view">
    <div class="content">
      <!-- Header -->
      <header class="header-section">
        <div
          class="glass-panel header-panel"
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

          <!-- Subscribe Button -->
          <button
            v-if="!isOwner && !isLoading"
            class="subscribe-btn"
            :class="{ 'subscribed': isSubscribed, 'loading': isSubscriptionLoading }"
            @click.stop="handleSubscribe"
          >
            <span v-if="isSubscriptionLoading" class="material-symbols-outlined spin">progress_activity</span>
            <template v-else>
              <span class="material-symbols-outlined" style="font-size:20px">{{ isSubscribed ? 'check' : 'person_add' }}</span>
            </template>
          </button>

          <button v-if="isOwner" class="glass-btn edit-header-btn">
            <span class="material-symbols-outlined" style="font-size:20px">edit</span>
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

        <!-- Event Description -->
        <div v-if="selectedEvent?.description" class="event-description-wrapper">
          <div class="event-description glass-card-new">
            <p class="description-text">{{ selectedEvent.description }}</p>
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
              <span class="material-symbols-outlined" style="font-size:18px">edit</span>
            </button>
            <button
              v-if="isOwner && !selectedEvent.is_default"
              class="glass-btn action-btn"
              @click="handleDeleteEvent"
            >
              <span class="material-symbols-outlined" style="font-size:18px">delete</span>
            </button>
            <button class="glass-btn action-btn" @click="handleShareEvent">
              <span class="material-symbols-outlined" style="font-size:18px">ios_share</span>
            </button>
          </div>
          <div class="item-count">
            <span class="count-label">{{ pluralizeWishes(wishes.length) }}</span>
          </div>
        </div>
      </header>

      <!-- Wishes Section -->
      <section class="wishes-section">
        <WishGrid
          :wishes="wishes"
          :loading="wishesLoading"
          :error="wishesError"
          :is-owner="isOwner"
          @add="showAddWishModal = true"
          @click="onWishClick"
        />
      </section>

      <!-- FAB -->
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
            description: editingEvent.description || '',
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
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  height: 100%;
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

/* Header */
.header-section {
  padding: calc(20px + var(--safe-area-top)) 20px 0;
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

.header-panel:active { transform: scale(0.98); }

.avatar-wrapper { position: relative; }

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

.avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  width: 100%; height: 100%;
  background: var(--gradient-festive);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700;
}

.avatar-status {
  position: absolute; bottom: 0; right: 0;
  width: 14px; height: 14px;
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
  display: flex; flex-direction: column; justify-content: center;
}

.user-name {
  margin: 0; font-size: 18px; font-weight: 700;
  color: #111118; line-height: 1.2; letter-spacing: -0.02em;
}

[data-theme='dark'] .user-name { color: #f8fafc; }

.user-subtitle {
  margin: 0; font-size: 12px; font-weight: 500; color: #64748b; margin-top: 2px;
}

[data-theme='dark'] .user-subtitle { color: #94a3b8; }

.edit-header-btn {
  margin-left: auto;
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.4);
}

[data-theme='dark'] .edit-header-btn {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Subscribe Button */
.subscribe-btn {
  margin-left: auto;
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10, 13, 194, 0.1);
  border: 1px solid rgba(10, 13, 194, 0.2);
  color: var(--tg-button-color);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 13, 194, 0.15);
}

.subscribe-btn:active { transform: scale(0.96); background: rgba(10, 13, 194, 0.2); }

.subscribe-btn.subscribed {
  background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
}

[data-theme='dark'] .subscribe-btn {
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

[data-theme='dark'] .subscribe-btn.subscribed {
  background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4);
  color: #34d399; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.spin { animation: spin 1s linear infinite; font-size: 20px; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Carousel */
.carousel-wrapper { margin: 0 -20px; padding: 0 20px; overflow: visible; }

.skeleton-carousel { display: flex; gap: 8px; padding: 4px 0; }
.skeleton-carousel .event-pill { height: 44px; border-radius: 22px; }
.skeleton-carousel .event-add-btn { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }

/* Event Description */
.event-description { padding: 16px; border-radius: 22px; }

.description-text {
  margin: 0; font-size: 15px; line-height: 1.6;
  color: #64748b; font-weight: 400; font-style: italic; white-space: pre-line;
}

[data-theme='dark'] .description-text { color: #9CA3AF; }

/* Actions Row */
.actions-row { display: flex; justify-content: space-between; align-items: center; padding: 0 4px; }
.actions-buttons { display: flex; gap: 10px; }

.action-btn {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #64748b; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

[data-theme='dark'] .action-btn {
  color: rgba(248, 250, 252, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.item-count { text-align: right; }

.count-label {
  font-size: 10px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.08em;
}

[data-theme='dark'] .count-label { color: #6B7280; }

/* Wishes */
.wishes-section { min-height: 200px; margin-top: 20px; }

/* FAB */
.fab-button {
  position: fixed;
  bottom: calc(100px + env(safe-area-inset-bottom));
  right: 20px;
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--tg-button-color);
  color: white; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 300;
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.4);
  cursor: pointer;
  z-index: 50;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab-button:active { transform: scale(0.92); }
.fab-icon { line-height: 1; }
</style>
