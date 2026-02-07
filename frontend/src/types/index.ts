/**
 * Type definitions for the Wishlist Mini App.
 * Simplified version with only navigation types.
 */

/**
 * Available tabs in the application.
 * - profile: Мои желания (My Wishes)
 * - friends: Друзья (Friends)
 * - search: Поиск (Search)
 */
export type TabId = 'profile' | 'friends' | 'search'

/**
 * Tab configuration for the Tab Bar.
 */
export interface TabConfig {
  id: TabId
  label: string
  icon: string
  activeIcon: string
}

/**
 * Navigation state.
 */
export interface NavigationState {
  activeTab: TabId
  previousTab: TabId | null
  history: TabId[]
}

/**
 * Wishlist from API.
 */
export interface Wishlist {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  is_default: boolean
  emoji: string | null
  event_date: string | null
  created_at: string
  updated_at: string
}

/**
 * Wish from API.
 */
export interface Wish {
  id: string
  wishlist_id: string
  title: string
  description: string | null
  link: string | null
  image_url: string | null
  price: number | null
  currency: string | null
  is_booked: boolean
  created_at: string
  updated_at: string
}

/**
 * Request payload for creating a wish.
 */
export interface CreateWishRequest {
  wishlist_id: string
  title: string
  description?: string
  link?: string
  image_url?: string
  price?: number
  currency?: string
}


/**
 * API response for wishlist list.
 */
export interface WishlistListResponse {
  wishlists: Wishlist[]
  total: number
}
