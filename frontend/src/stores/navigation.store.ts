/**
 * NavigationStore - Tab configuration and route mapping.
 *
 * Architecture Decision:
 * - With Vue Router handling all navigation, this store is simplified
 *   to only provide tab configuration and route-to-tab mapping.
 */

import type { TabId, TabConfig } from '@/types'

/**
 * Tab configurations.
 * Icons use Material Symbols.
 * Order: Wishes (Мои желания) → Friends (Друзья) → Ideas (Идеи)
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
  return 'profile' // /wishes and everything else defaults to profile
}

export const navigationStore = {
  tabs: TAB_CONFIGS,
  getTabIdFromPath,
}
