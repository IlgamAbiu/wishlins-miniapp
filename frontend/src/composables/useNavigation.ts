/**
 * useNavigation - Composable for tab navigation via Vue Router.
 * Tab configs are defined here (no separate store needed).
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { TabId, TabConfig } from '@/types'

/**
 * Tab configurations.
 * Icons use Material Symbols.
 */
export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'profile',
    label: 'Мои желания',
    icon: 'card_giftcard',
    activeIcon: 'card_giftcard',
    route: '/wishes',
  },
  {
    id: 'friends',
    label: 'Друзья',
    icon: 'group',
    activeIcon: 'group',
    route: '/friends',
  },
  {
    id: 'search',
    label: 'Идеи',
    icon: 'lightbulb',
    activeIcon: 'lightbulb',
    route: '/ideas',
  },
]

/**
 * Get the active tab ID from the current route path.
 */
export function getTabIdFromPath(path: string): TabId {
  if (path.startsWith('/friends')) return 'friends'
  if (path.startsWith('/ideas')) return 'search'
  return 'profile'
}

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()

  const activeTab = computed(() => getTabIdFromPath(route.path))
  const tabs = TAB_CONFIGS

  function navigateToTab(tabId: TabId): void {
    const tab = TAB_CONFIGS.find(t => t.id === tabId)
    if (tab) {
      router.push(tab.route)
    }
  }

  function isActive(tabId: TabId): boolean {
    return activeTab.value === tabId
  }

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
