/**
 * useHaptic Composable
 * Provides haptic feedback through Telegram WebApp API
 *
 * Usage:
 * const { impact, notification, selection } = useHaptic()
 * impact('light') // Trigger light impact
 * notification('success') // Trigger success notification
 * selection() // Trigger selection changed
 */

import { useTelegramWebApp } from './useTelegramWebApp'
import type { HapticImpactStyle, HapticNotificationType } from '@/types/glass.types'

export function useHaptic() {
  const { webapp } = useTelegramWebApp()

  /**
   * Trigger impact haptic feedback
   * @param style - Impact style (light, medium, heavy, rigid, soft)
   */
  function impact(style: HapticImpactStyle = 'medium'): void {
    if (webapp.value?.HapticFeedback) {
      webapp.value.HapticFeedback.impactOccurred(style)
    }
  }

  /**
   * Trigger notification haptic feedback
   * @param type - Notification type (error, success, warning)
   */
  function notification(type: HapticNotificationType): void {
    if (webapp.value?.HapticFeedback) {
      webapp.value.HapticFeedback.notificationOccurred(type)
    }
  }

  /**
   * Trigger selection changed haptic feedback
   */
  function selection(): void {
    if (webapp.value?.HapticFeedback) {
      webapp.value.HapticFeedback.selectionChanged()
    }
  }

  return {
    impact,
    notification,
    selection,
  }
}
