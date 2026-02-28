/**
 * useHaptic Composable
 * Provides haptic feedback through Telegram WebApp API.
 */

import { useTelegramWebApp } from './useTelegramWebApp'
import type { HapticImpactStyle, HapticNotificationType } from '@/types'

export function useHaptic() {
  const { webapp } = useTelegramWebApp()

  function impact(style: HapticImpactStyle = 'medium'): void {
    webapp.value?.HapticFeedback?.impactOccurred(style)
  }

  function notification(type: HapticNotificationType): void {
    webapp.value?.HapticFeedback?.notificationOccurred(type)
  }

  function selection(): void {
    webapp.value?.HapticFeedback?.selectionChanged()
  }

  return { impact, notification, selection }
}
