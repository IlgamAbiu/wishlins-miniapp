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

import { reactive, readonly, computed } from 'vue'
import type { TabId, TabConfig, NavigationState } from '@/types'

/**
 * Tab configurations.
 * Icons use simple text/emoji for MVP, can be replaced with SVG icons.
 */
export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'feed',
    label: 'Feed',
    icon: '○',
    activeIcon: '●',
  },
  {
    id: 'profile',
    label: 'Wishlist',
    icon: '☆',
    activeIcon: '★',
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: '◇',
    activeIcon: '◆',
  },
]

/**
 * Internal mutable state.
 */
const state = reactive<NavigationState>({
  activeTab: 'feed',
  previousTab: null,
  history: ['feed'],
})

/**
 * Switch to a different tab.
 */
function switchTab(tabId: TabId): void {
  if (tabId === state.activeTab) return

  state.previousTab = state.activeTab
  state.activeTab = tabId

  // Keep history for potential back navigation
  if (!state.history.includes(tabId)) {
    state.history.push(tabId)
  }
}

/**
 * Go back to previous tab.
 */
function goBack(): boolean {
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
  state.activeTab = 'feed'
  state.previousTab = null
  state.history = ['feed']
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
  // Readonly state
  state: readonly(state),

  // Computed
  activeTabConfig,
  tabs: TAB_CONFIGS,

  // Actions
  switchTab,
  goBack,
  reset,
  getTabConfig,
  isTabActive,
}
