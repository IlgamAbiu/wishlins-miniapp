/**
 * useNavigation - Composable for tab navigation.
 */

import { computed } from 'vue'
import { navigationStore, TAB_CONFIGS } from '@/stores'
import type { TabId } from '@/types'

export function useNavigation() {
  const { state, switchTab, goBack, isTabActive, activeTabConfig } = navigationStore

  /**
   * Current active tab ID.
   */
  const activeTab = computed(() => state.activeTab)

  /**
   * All available tabs.
   */
  const tabs = TAB_CONFIGS

  /**
   * Switch to a tab.
   */
  function navigateToTab(tabId: TabId): void {
    if (state.activeTab === tabId) return
    switchTab(tabId)
  }

  /**
   * Check if a tab is currently active.
   */
  function isActive(tabId: TabId): boolean {
    return isTabActive(tabId)
  }

  /**
   * Navigate back to previous tab.
   */
  function navigateBack(): boolean {
    return goBack()
  }

  return {
    activeTab,
    activeTabConfig,
    tabs,
    navigateToTab,
    navigateBack,
    isActive,
  }
}
