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
const { wishes, loading: wishesLoading, error: wishesError, fetchWishes, createWish, moveWishesToWishlist, openWish } = useWishes()
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

// ... (existing code)

/* === BACKGROUND BLOBS === */
.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px); /* Reduced from 120px */
  opacity: 0;
  pointer-events: none;
  z-index: 0;
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
</style>
