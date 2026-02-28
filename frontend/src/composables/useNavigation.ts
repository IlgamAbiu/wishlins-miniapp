/**
 * useNavigation - Composable for tab navigation via Vue Router.
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TAB_CONFIGS, getTabIdFromPath } from '@/stores/navigation.store'
import type { TabId } from '@/types'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  /**
   * Current active tab ID (derived from route path).
   */
  const activeTab = computed(() => getTabIdFromPath(route.path))

  /**
   * All available tabs.
   */
  const tabs = TAB_CONFIGS

  /**
   * Switch to a tab via router.
   */
  function navigateToTab(tabId: TabId): void {
    const tab = TAB_CONFIGS.find(t => t.id === tabId)
    if (tab) {
      router.push(tab.route)
    }
  }

  /**
   * Check if a tab is currently active.
   */
  function isActive(tabId: TabId): boolean {
    return activeTab.value === tabId
  }

  /**
   * Navigate back via router.
   */
  function navigateBack(): void {
    router.back()
  }

  return {
    activeTab,
    tabs,
    navigateToTab,
    navigateBack,
    isActive,
  }
}
