/**
 * useNavigation - Composable for tab navigation.
 *
 * Provides reactive access to navigation state and actions
 * for use in Vue components.
 */

import { computed } from 'vue'
import { navigationStore, TAB_CONFIGS } from '@/stores'
import type { TabId } from '@/types'
import { telegramService } from '@/services'

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
   * Switch to a tab with haptic feedback.
   */
  function navigateToTab(tabId: TabId): void {
    if (state.activeTab === tabId) return

    // Trigger haptic feedback for better UX
    telegramService.hapticFeedback('light')

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
    const success = goBack()
    if (success) {
      telegramService.hapticFeedback('light')
    }
    return success
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
