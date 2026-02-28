/**
 * Type definitions for the Wishlist Mini App.
 */

/**
 * Available tabs in the application.
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
  route: string
}

/**
 * Wish priority levels.
 */
export type WishPriority = 'just_want' | 'really_want'

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
  subtitle: string | null
  description: string | null
  link: string | null
  image_url: string | null
  price: number | null
  currency: string | null
  is_booked: boolean
  booked_by_me: boolean
  priority: WishPriority
  store: string | null
  created_at: string
  updated_at: string
}

/**
 * Request payload for creating a wish.
 */
export interface CreateWishRequest {
  wishlist_id: string
  title: string
  subtitle?: string
  description?: string
  link?: string
  image_url?: string
  price?: number
  currency?: string
  priority?: WishPriority
  store?: string
}

/**
 * API response for wishlist list.
 */
export interface WishlistListResponse {
  wishlists: Wishlist[]
  total: number
}

/**
 * User interface.
 */
export interface User {
  id: string
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string | null
  avatar_url: string | null
  profile_text: string | null
  birth_date: string | null
  is_subscribed?: boolean
  wish_count?: number
  created_at: string
  updated_at: string
}

/**
 * Haptic feedback types.
 */
export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
export type HapticNotificationType = 'error' | 'success' | 'warning'
