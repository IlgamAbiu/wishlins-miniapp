/**
 * NavigationStore - Centralized state for tab navigation.
 *
 * Architecture Decision:
 * - Using custom reactive store instead of Vue Router because:
 *   1. Tab-based navigation is simpler than route-based
 *   2. No URL changes needed in Mini App context
 *   3. Lighter footprint, better performance
 *   4. Easier to maintain state between tab switches
 *   5. More control over transitions and animations
 *
 * - Vue Router would be overkill for 3 tabs with no nested routes
 * - This approach keeps all tabs mounted (preserves scroll position, state)
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages navigation state
 * - Open/Closed: Easy to add new tabs without modifying core logic
 */

import { reactive, computed } from 'vue'
import type { TabId, TabConfig, NavigationState } from '@/types'

/**
 * Tab configurations.
 * Icons use simple text/emoji for MVP, can be replaced with SVG icons.
 * Order: Profile (Мои желания) → Friends (Друзья) → Search (Поиск)
 */
export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'profile',
    label: 'Мои желания',
    icon: 'card_giftcard',
    activeIcon: 'card_giftcard',
  },
  {
    id: 'friends',
    label: 'Друзья',
    icon: 'group',
    activeIcon: 'group',
  },
  {
    id: 'search',
    label: 'Идеи',
    icon: 'lightbulb',
    activeIcon: 'lightbulb',
  },
]

/**
 * Internal mutable state.
 * Start with profile tab as the default view.
 */
const state = reactive<NavigationState>({
  activeTab: 'profile',
  previousTab: null,
  viewedUserId: null, // For 'profile' tab guest mode (legacy/main profile tab)
  selectedFriendId: null, // For 'friends' tab nested navigation
  history: ['profile'],
})


/**
 * Switch to a different tab.
 */
function switchTab(tabId: TabId): void {
  console.log(`[Navigation] Switching to tab: ${tabId}`) // Debug log
  if (tabId === state.activeTab && state.viewedUserId === null && state.selectedFriendId === null) return

  // If clicking "Profile" tab explicitly, reset to "My Profile"
  if (tabId === 'profile') {
    state.viewedUserId = null
  }

  // If clicking "Friends" tab explicitly while deep in stack?
  // Usually tapping the active tab again pops to root.
  if (tabId === 'friends' && state.activeTab === 'friends' && state.selectedFriendId !== null) {
    state.selectedFriendId = null
    return
  }

  state.previousTab = state.activeTab
  state.activeTab = tabId

  // Keep history for potential back navigation
  if (!state.history.includes(tabId)) {
    state.history.push(tabId)
  }
}

/**
 * Open a specific user's profile in the MAIN profile tab (switches tab).
 * @param telegramId The Telegram ID of the user to view.
 */
function openUserProfile(telegramId: number): void {
  state.viewedUserId = telegramId
  if (state.activeTab !== 'profile') {
    state.previousTab = state.activeTab
    state.activeTab = 'profile'
    if (!state.history.includes('profile')) {
      state.history.push('profile')
    }
  }
}

/**
 * Open a friend's profile within the Friends tab (Stack Navigation).
 */
function openFriendProfile(telegramId: number): void {
  state.selectedFriendId = telegramId
}

/**
 * Close friend profile and return to list (Stack Navigation).
 */
function closeFriendProfile(): void {
  state.selectedFriendId = null
}

/**
 * Go back to previous tab or pop stack.
 */
function goBack(): boolean {
  // 1. Priority: Close nested friend profile if open
  if (state.selectedFriendId !== null) {
    state.selectedFriendId = null
    return true
  }

  // 2. Priority: Reset guest mode on profile tab
  if (state.viewedUserId !== null) {
    state.viewedUserId = null
    // maybe verify if we should switch tab?
  }

  if (!state.previousTab) return false

  const temp = state.activeTab
  state.activeTab = state.previousTab
  state.previousTab = temp

  return true
}

/**
 * Reset navigation to initial state.
 */
function reset(): void {
  state.activeTab = 'profile'
  state.previousTab = null
  state.viewedUserId = null
  state.selectedFriendId = null
  state.history = ['profile']
}

/**
 * Get tab configuration by ID.
 */
function getTabConfig(tabId: TabId): TabConfig | undefined {
  return TAB_CONFIGS.find(tab => tab.id === tabId)
}

/**
 * Computed: current active tab config.
 */
const activeTabConfig = computed(() => getTabConfig(state.activeTab))

/**
 * Computed: check if specific tab is active.
 */
function isTabActive(tabId: TabId): boolean {
  return state.activeTab === tabId
}

/**
 * Export readonly state and actions.
 * State is readonly to enforce unidirectional data flow.
 */
export const navigationStore = {
  // Expose state directly (reactive) instead of readonly to preserve reactivity
  state,

  // Computed
  activeTabConfig,
  tabs: TAB_CONFIGS,

  // Actions
  switchTab,
  openUserProfile,
  openFriendProfile, // New action
  closeFriendProfile, // New action
  goBack,
  reset,
  getTabConfig,
  isTabActive,
}
