/**
 * UserStore - Centralized state for user data.
 *
 * Architecture Decision:
 * - Separates user state from navigation state
 * - Caches user data to prevent redundant API calls
 * - Single source of truth for user-related data
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages user state
 * - Dependency Inversion: Uses userService for data operations
 */

import { reactive, readonly, computed } from 'vue'
import type { User, WishlistItem } from '@/types'
import { userService } from '@/services'

interface UserState {
  user: User | null
  wishlist: WishlistItem[]
  isLoading: boolean
  isWishlistLoading: boolean
  error: string | null
}

/**
 * Internal mutable state.
 */
const state = reactive<UserState>({
  user: null,
  wishlist: [],
  isLoading: false,
  isWishlistLoading: false,
  error: null,
})

/**
 * Load current user data.
 */
async function loadUser(): Promise<void> {
  if (state.isLoading) return

  state.isLoading = true
  state.error = null

  try {
    state.user = await userService.getCurrentUser()
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Failed to load user'
    console.error('[UserStore] Load user error:', err)
  } finally {
    state.isLoading = false
  }
}

/**
 * Load user's wishlist.
 */
async function loadWishlist(): Promise<void> {
  if (state.isWishlistLoading) return

  state.isWishlistLoading = true

  try {
    state.wishlist = await userService.getWishlist()
  } catch (err) {
    console.error('[UserStore] Load wishlist error:', err)
  } finally {
    state.isWishlistLoading = false
  }
}

/**
 * Add item to wishlist.
 */
async function addToWishlist(item: Omit<WishlistItem, 'id' | 'createdAt' | 'isPurchased'>): Promise<void> {
  try {
    const newItem = await userService.addWishlistItem(item)
    state.wishlist.unshift(newItem)
  } catch (err) {
    console.error('[UserStore] Add to wishlist error:', err)
    throw err
  }
}

/**
 * Remove item from wishlist.
 */
async function removeFromWishlist(itemId: string): Promise<void> {
  try {
    await userService.removeWishlistItem(itemId)
    state.wishlist = state.wishlist.filter(item => item.id !== itemId)
  } catch (err) {
    console.error('[UserStore] Remove from wishlist error:', err)
    throw err
  }
}

/**
 * Toggle item purchased status.
 */
async function togglePurchased(itemId: string): Promise<void> {
  try {
    const updatedItem = await userService.togglePurchased(itemId)
    if (updatedItem) {
      const index = state.wishlist.findIndex(item => item.id === itemId)
      if (index !== -1) {
        state.wishlist[index] = updatedItem
      }
    }
  } catch (err) {
    console.error('[UserStore] Toggle purchased error:', err)
    throw err
  }
}

/**
 * Clear all cached data.
 */
function clearCache(): void {
  state.user = null
  state.wishlist = []
  state.error = null
  userService.clearCache()
}

/**
 * Computed: user display name.
 */
const displayName = computed(() => {
  if (!state.user) return 'Guest'
  const { first_name, last_name, username } = state.user
  if (first_name && last_name) return `${first_name} ${last_name}`
  return first_name || username || 'User'
})

/**
 * Computed: wishlist count.
 */
const wishlistCount = computed(() => state.wishlist.length)

/**
 * Computed: unpurchased items count.
 */
const unpurchasedCount = computed(() =>
  state.wishlist.filter(item => !item.isPurchased).length
)

/**
 * Export readonly state and actions.
 */
export const userStore = {
  // Readonly state
  state: readonly(state),

  // Computed
  displayName,
  wishlistCount,
  unpurchasedCount,

  // Actions
  loadUser,
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  togglePurchased,
  clearCache,
}
