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
