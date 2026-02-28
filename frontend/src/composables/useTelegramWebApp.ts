/**
 * Composable for Telegram Web App integration.
 * Singleton pattern — initializes once, then reuses reactive state.
 * Provides access to Telegram Mini App SDK + Promise-wrapped popup helpers.
 */

import { ref, computed, type Ref } from 'vue'

// ─── Type Definitions ───────────────────────────────────────────────────────

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
    start_param?: string
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
    setText(text: string): TelegramWebApp['MainButton']
    show(): TelegramWebApp['MainButton']
    hide(): TelegramWebApp['MainButton']
    enable(): TelegramWebApp['MainButton']
    disable(): TelegramWebApp['MainButton']
    showProgress(leaveActive?: boolean): TelegramWebApp['MainButton']
    hideProgress(): TelegramWebApp['MainButton']
    onClick(callback: () => void): TelegramWebApp['MainButton']
    offClick(callback: () => void): TelegramWebApp['MainButton']
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  requestFullscreen(): void
  exitFullscreen(): void
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
  disableVerticalSwipes(): void
  enableVerticalSwipes(): void
}

// ─── Singleton State ────────────────────────────────────────────────────────

const isReady = ref(false)
const isAvailable = ref(false)
const user = ref<TelegramUser | null>(null)
const webapp = ref<TelegramWebApp | null>(null) as Ref<TelegramWebApp | null>
const hasValidInitData = ref(false)
let initialized = false

function initializeTelegram() {
  if (initialized) return
  initialized = true

  if (window.Telegram?.WebApp) {
    webapp.value = window.Telegram.WebApp
    isAvailable.value = true

    hasValidInitData.value = Boolean(
      webapp.value.initData && webapp.value.initData.length > 0
    )

    if (webapp.value.initDataUnsafe.user) {
      user.value = webapp.value.initDataUnsafe.user
    }

    // Tell Telegram that the app is ready
    webapp.value.ready()

    // Expand and request fullscreen (Bot API 8.0+)
    webapp.value.expand()
    if (typeof webapp.value.requestFullscreen === 'function') {
      webapp.value.requestFullscreen()
    }

    // Disable vertical swipe-to-close gesture (Bot API 7.7+)
    if (typeof webapp.value.disableVerticalSwipes === 'function') {
      webapp.value.disableVerticalSwipes()
    }

    // Apply theme
    const colorScheme = webapp.value.colorScheme
    if (colorScheme) {
      document.documentElement.setAttribute('data-theme', colorScheme)
    }

    // Apply CSS variables
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
    if (theme.secondary_bg_color) {
      document.documentElement.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color)
    }
  } else {
    // Local development fallback
    const urlParams = new URLSearchParams(window.location.search)
    const themeParam = urlParams.get('theme')

    if (themeParam === 'dark' || themeParam === 'light') {
      document.documentElement.setAttribute('data-theme', themeParam)
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  isReady.value = true
}

// ─── Promise-wrapped Telegram Popup Helpers ─────────────────────────────────

/**
 * Show a Telegram popup with buttons. Returns the pressed button ID.
 */
function showPopup(params: {
  title?: string
  message: string
  buttons?: Array<{
    id?: string
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
    text?: string
  }>
}): Promise<string> {
  return new Promise((resolve) => {
    if (webapp.value) {
      webapp.value.showPopup(params, (buttonId) => {
        resolve(buttonId)
      })
    } else {
      // Fallback for dev
      resolve('')
    }
  })
}

/**
 * Show a Telegram alert. Returns when dismissed.
 */
function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    if (webapp.value) {
      webapp.value.showAlert(message, () => resolve())
    } else {
      alert(message)
      resolve()
    }
  })
}

/**
 * Show a Telegram confirm dialog. Returns true/false.
 */
function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (webapp.value) {
      webapp.value.showConfirm(message, (confirmed) => resolve(confirmed))
    } else {
      resolve(confirm(message))
    }
  })
}

// ─── Composable ─────────────────────────────────────────────────────────────

export function useTelegramWebApp() {
  // Initialize on first use
  initializeTelegram()

  const isInTelegram = computed(() => hasValidInitData.value)

  const userDisplayName = computed(() => {
    if (!user.value) return 'Guest'
    const { first_name, last_name } = user.value
    return last_name ? `${first_name} ${last_name}` : first_name
  })

  return {
    isReady,
    isAvailable,
    isInTelegram,
    hasValidInitData,
    user,
    userDisplayName,
    webapp,
    // Popup helpers
    showPopup,
    showAlert,
    showConfirm,
  }
}
