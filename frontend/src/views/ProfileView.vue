<script setup lang="ts">
/**
 * ProfileView - User profile with Events (Wishlists) and Wishes.
 * Re-engineered with TanStack Query for SWR caching.
 */
import { ref, watch, computed, onUnmounted } from 'vue'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useRoute, useRouter } from 'vue-router'
import { useUserQuery, useUpdateProfileMutation, useSubscriptionMutation } from '@/composables/queries/useUserQuery'
import { useWishlistsQuery, useWishesQuery } from '@/composables/queries/useWishesQuery'
import { useToast } from '@/composables/useToast'
import { useQueryClient } from '@tanstack/vue-query'
import { wishesApi } from '@/api/wishes'
import type { Wish } from '@/types'

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

const { isInTelegram, user, userDisplayName, webapp, settingsButton } = useTelegramWebApp()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()

// Guest Mode Logic
const targetUserId = computed(() => {
    if (props.userId) return Number(props.userId)
    const routeFriendId = route.params.friendId
    if (routeFriendId) return Number(routeFriendId)
    return user.value?.id
})

const isOwner = computed(() => targetUserId.value === user.value?.id)

// --- Data Fetching (Vue Query) ---
const { 
  data: profileUser, 
  isLoading: userLoading, 
  error: userError 
} = useUserQuery(targetUserId.value as number, user.value?.id)

const { 
  data: rawWishlists, 
  isLoading: listsLoading 
} = useWishlistsQuery(targetUserId.value as number)

const wishlists = computed(() => rawWishlists.value || [])

const selectedEventId = ref<string | null>(null)

// Select default event automatically when wishlists are loaded
watch(wishlists, (newList) => {
  if (newList.length > 0 && !selectedEventId.value) {
    const defaultEvent = newList.find(w => w.is_default)
    selectedEventId.value = defaultEvent ? defaultEvent.id : newList[0].id
  }
}, { immediate: true })

const { 
  data: rawWishes, 
  isLoading: wishesLoading, 
  error: wishesError 
} = useWishesQuery(selectedEventId.value, user.value?.id)

const wishes = computed(() => rawWishes.value || [])

const combinedLoading = computed(() => userLoading.value || listsLoading.value)


// --- Mutations ---
const updateProfileMutation = useUpdateProfileMutation()
const subscriptionMutation = useSubscriptionMutation()

// --- UI State ---
const showAddWishModal = ref(false)
const showAddEventModal = ref(false)
const showEditProfileModal = ref(false)
const showDeleteEventModal = ref(false)
const showEventLimitModal = ref(false)
const editingEvent = ref<any>(null)
const eventToDelete = ref<any>(null)

const displayUser = computed(() => {
    const u = profileUser.value
    const name = u ? (u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name) : (isOwner.value ? userDisplayName.value : 'Загрузка...')
    const photo = u ? u.photo_url : (isOwner.value ? user.value?.photo_url : null)
    
    return {
        displayName: name,
        photoUrl: photo,
        initial: name?.charAt(0) || '?'
    }
})

const selectedEvent = computed(() => 
  wishlists.value.find(w => w.id === selectedEventId.value)
)

const isSubscribed = computed(() => profileUser.value?.is_subscribed || false)

// --- Lifecycle & Side Effects ---
onUnmounted(() => {
  if (webapp.value) {
    settingsButton.value.offClick(handleEditProfile)
  }
})

watch([isOwner, webapp], ([owner, app]) => {
  if (app && owner) {
    settingsButton.value.onClick(handleEditProfile)
  }
}, { immediate: true })

// --- Handlers ---
function handleEventSelect(id: string) {
  selectedEventId.value = id
}

async function handleWishPrefetch(wish: Wish) {
  // Prefetch wish detail data
  queryClient.prefetchQuery({
    queryKey: ['wish', wish.id, user.value?.id],
    queryFn: () => wishesApi.getWish(wish.id, user.value?.id)
  })
}

async function handleSaveProfileText(text: string) {
  updateProfileMutation.mutate({ 
    telegramId: user.value?.id as number, 
    profileText: text 
  }, {
    onSuccess: () => {
      showEditProfileModal.value = false
    }
  })
}

async function handleSubscribe() {
  if (!user.value || !targetUserId.value) return
  
  subscriptionMutation.mutate({
    currentUserId: user.value.id,
    targetTelegramId: targetUserId.value,
    action: isSubscribed.value ? 'unsubscribe' : 'subscribe'
  })
}

// ... legacy modal handlers kept for MVP ... (will migrate to mutations later)
import { useWishlists as useLegacyWishlists } from '@/composables/useWishlists'
import { useWishes as useLegacyWishes } from '@/composables/useWishes'
const { createWishlist, updateWishlist, deleteWishlist } = useLegacyWishlists()
const { createWish, moveWishesToWishlist } = useLegacyWishes()

const MAX_EVENTS = 5

async function handleSaveEvent(title: string, date: string, description: string) {
  if (!user.value) return
  if (editingEvent.value) {
    const updated = await updateWishlist(editingEvent.value.id, { title, eventDate: date, description })
    if (updated) showAddEventModal.value = false
  } else {
    const newWishlist = await createWishlist(title, user.value.id, true, date, description)
    if (newWishlist) {
      showAddEventModal.value = false
      selectedEventId.value = newWishlist.id
    }
  }
}

function openCreateEventModal() {
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
  if (wishes.value.length > 0) {
    eventToDelete.value = selectedEvent.value
    showDeleteEventModal.value = true
  } else {
    confirmDeleteEvent(false)
  }
}

async function confirmDeleteEvent(moveWishes: boolean) {
  if (!eventToDelete.value && !selectedEvent.value) return
  const eventId = (eventToDelete.value || selectedEvent.value).id
  if (moveWishes && wishes.value.length > 0 && user.value) {
    const defaultEvent = wishlists.value.find(w => w.is_default)
    if (defaultEvent) await moveWishesToWishlist(eventId, defaultEvent.id, user.value.id)
  }
  if (await deleteWishlist(eventId)) {
    showDeleteEventModal.value = false
    const defaultEvent = wishlists.value.find(w => w.is_default)
    if (defaultEvent) selectedEventId.value = defaultEvent.id
  }
}

function handleShareEvent() {
  toast.info('Ссылка на событие скопирована!')
}

async function handleAddWish(data: any) {
  if (!selectedEventId.value || !user.value) return
  if (await createWish({ ...data, wishlist_id: selectedEventId.value }, user.value.id)) {
    showAddWishModal.value = false
  }
}

function onWishClick(wish: any) {
  if (isOwner.value) {
    router.push({ name: 'MyWishDetail', params: { id: wish.id } })
  } else {
    router.push({ name: 'FriendWishDetail', params: { friendId: targetUserId.value, id: wish.id } })
  }
}

function handleEditProfile() { showEditProfileModal.value = true }

function pluralizeWishes(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2]
  const titles = ['желание', 'желания', 'желаний']
  const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]
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
            <template v-if="combinedLoading">
              <div class="skeleton skeleton-text" style="width: 120px; height: 24px; margin-bottom: 4px;"></div>
              <div class="skeleton skeleton-text" style="width: 180px; height: 16px;"></div>
            </template>
            <template v-else>
              <h1 class="user-name">{{ displayUser.displayName }}</h1>
              <p class="user-subtitle">{{ profileUser?.profile_text || 'Save for a dream ✨' }}</p>
            </template>
          </div>
          
           <!-- Subscribe Button (Liquid Glass) -->
           <button
            v-if="!isOwner && !combinedLoading" 
            class="subscribe-btn"
            :class="{ 'subscribed': isSubscribed, 'loading': subscriptionMutation.isPending }"
            @click.stop="handleSubscribe"
          >
            <span v-if="subscriptionMutation.isPending" class="material-symbols-outlined spin">progress_activity</span>
            <template v-else>
                <span class="material-symbols-outlined text-[20px]">{{ isSubscribed ? 'check' : 'person_add' }}</span>
            </template>
          </button>

          <button v-if="isOwner" class="glass-btn edit-header-btn">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>

        <!-- Events Carousel -->
        <div class="carousel-wrapper">
          <div v-if="combinedLoading" class="skeleton-carousel">
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
            <span class="count-label">{{ pluralizeWishes(wishes?.length || 0) }}</span>
          </div>
        </div>
      </header>

      <!-- Data Status/Grid -->
      <section class="wishes-section">
         <WishGrid
           :wishes="wishes"
           :loading="wishesLoading"
           :error="wishesError ? wishesError.message : null"
           :is-owner="isOwner"
           @add="showAddWishModal = true"
           @click="onWishClick"
           @preload="handleWishPrefetch"
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
           :initial-text="profileUser?.profile_text || ''"
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
  padding: calc(var(--safe-area-top) + var(--side-padding)) var(--side-padding) 0;
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
  background: var(--gradient-festive); /* Use themed gradient */
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

/* Subscribe Button (Liquid Glass) */
.subscribe-btn {
  margin-left: auto;
  width: 44px; /* Fixed width for circle */
  height: 44px;
  border-radius: 50%; /* Circle shape */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 13, 194, 0.1); /* Primary tint */
  border: 1px solid rgba(10, 13, 194, 0.2);
  color: var(--tg-button-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 13, 194, 0.15);
  /* padding removed */
  /* gap removed */
}

.subscribe-btn:active {
  transform: scale(0.96);
  background: rgba(10, 13, 194, 0.2);
}

.subscribe-btn.subscribed {
  background: rgba(34, 197, 94, 0.15); /* Green tint */
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
}

[data-theme='dark'] .subscribe-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

[data-theme='dark'] .subscribe-btn.subscribed {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    color: #34d399;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.spin {
    animation: spin 1s linear infinite;
    font-size: 20px;
}

@keyframes spin {
    100% { transform: rotate(360deg); }
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
  background: #0a0dc2;
  border: 4px solid rgba(10, 13, 194, 0.2);
  box-shadow: 0 0 30px rgba(10, 13, 194, 0.5),
              0 8px 24px rgba(0, 0, 0, 0.4);
}

[data-theme='dark'] .fab-button:hover {
  box-shadow: 0 0 40px rgba(10, 13, 194, 0.7),
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


</style>
