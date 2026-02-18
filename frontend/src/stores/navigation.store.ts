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
    icon: '☆',
    activeIcon: '★',
  },
  {
    id: 'friends',
    label: 'Друзья',
    icon: '◇',
    activeIcon: '◆',
  },
  {
    id: 'search',
    label: 'Поиск',
    icon: '○',
    activeIcon: '●',
  },
]

/**
 * Internal mutable state.
 * Start with profile tab as the default view.
 */
const state = reactive<NavigationState>({
  activeTab: 'profile',
  previousTab: null,
  viewedUserId: null,
  history: ['profile'],
})


/**
 * Switch to a different tab.
 */
function switchTab(tabId: TabId): void {
  console.log(`[Navigation] Switching to tab: ${tabId}`) // Debug log
  if (tabId === state.activeTab && state.viewedUserId === null) return

  // If we are switching TO profile tab explicitly (e.g. from bottom bar),
  // we usually want to see OUR profile.
  // But if we are already on profile (guest) and click profile...
  // Let's say: Manual switch to 'profile' resets viewedUserId.
  if (tabId === 'profile') {
    state.viewedUserId = null
  }

  state.previousTab = state.activeTab
  state.activeTab = tabId

  // Keep history for potential back navigation
  if (!state.history.includes(tabId)) {
    state.history.push(tabId)
  }
}

/**
 * Open a specific user's profile.
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
 * Go back to previous tab.
 */
function goBack(): boolean {
  // If we are in guest mode, maybe back should take us back to friends?
  // Simply using previousTab logic might be enough if we came from friends.
  if (state.viewedUserId !== null) {
    state.viewedUserId = null // Reset guest mode on back?
    // Or just standard back logic:
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
  openUserProfile, // Export new action
  goBack,
  reset,
  getTabConfig,
  isTabActive,
}
