/**
 * useNavigation - Composable for static tab definitions.
 */
import type { TabConfig } from '@/types'

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

export function useNavigation() {
  return {
    tabs: TAB_CONFIGS,
  }
}
