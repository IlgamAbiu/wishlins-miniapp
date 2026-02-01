/**
 * Type definitions for the Wishlist Mini App.
 * Simplified version with only navigation types.
 */

/**
 * Available tabs in the application.
 */
export type TabId = 'feed' | 'profile' | 'friends'

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
  created_at: string
  updated_at: string
}

/**
 * API response for wishlist list.
 */
export interface WishlistListResponse {
  wishlists: Wishlist[]
  total: number
}
