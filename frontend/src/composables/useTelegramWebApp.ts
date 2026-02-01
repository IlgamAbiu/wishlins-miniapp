/**
 * Composable for Telegram Web App integration.
 * Provides access to Telegram Mini App SDK.
 */

import { ref, onMounted, computed } from 'vue'

// Extend Window interface to include Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText(text: string): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params: { text?: string }, callback?: (data: string) => boolean | void): void
  closeScanQrPopup(): void
}

export function useTelegramWebApp() {
  const isReady = ref(false)
  const isAvailable = ref(false)
  const user = ref<TelegramUser | null>(null)
  const webapp = ref<TelegramWebApp | null>(null)
  const hasValidInitData = ref(false)

  // Check if running inside Telegram with valid initData
  const isInTelegram = computed(() => isAvailable.value && hasValidInitData.value)

  const userDisplayName = computed(() => {
    if (!user.value) return 'Guest'
    const { first_name, last_name } = user.value
    return last_name ? `${first_name} ${last_name}` : first_name
  })

  onMounted(() => {
    // Check if Telegram WebApp is available
    if (window.Telegram?.WebApp) {
      webapp.value = window.Telegram.WebApp
      isAvailable.value = true

      // Check if initData exists and is not empty (confirms we're in Telegram)
      hasValidInitData.value = Boolean(webapp.value.initData && webapp.value.initData.length > 0)

      // Get user data from initDataUnsafe
      if (webapp.value.initDataUnsafe.user) {
        user.value = webapp.value.initDataUnsafe.user
      }

      // Tell Telegram that the app is ready
      webapp.value.ready()

      // Expand the Mini App to full height
      webapp.value.expand()

      // Apply Telegram theme colors to CSS variables
      const theme = webapp.value.themeParams
      if (theme.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color)
      }
      if (theme.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', theme.text_color)
      }
      if (theme.hint_color) {
        document.documentElement.style.setProperty('--tg-hint-color', theme.hint_color)
      }
      if (theme.link_color) {
        document.documentElement.style.setProperty('--tg-link-color', theme.link_color)
      }
      if (theme.button_color) {
        document.documentElement.style.setProperty('--tg-button-color', theme.button_color)
      }
      if (theme.button_text_color) {
        document.documentElement.style.setProperty('--tg-button-text-color', theme.button_text_color)
      }
      if (theme.secondary_bg_color) {
        document.documentElement.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color)
      }
    }

    // Mark as ready after all checks are complete
    isReady.value = true
  })

  return {
    isReady,
    isAvailable,
    isInTelegram,
    hasValidInitData,
    user,
    userDisplayName,
    webapp,
  }
}
