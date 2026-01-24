/**
 * Composable for Telegram WebApp SDK integration.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TelegramWebApp, TelegramUser, TelegramThemeParams } from '@/types'

/**
 * Check if running inside Telegram WebApp.
 */
function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' &&
         window.Telegram !== undefined &&
         window.Telegram.WebApp !== undefined
}

/**
 * Get Telegram WebApp instance.
 */
function getWebApp(): TelegramWebApp | null {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp
  }
  return null
}

/**
 * Composable for Telegram WebApp functionality.
 */
export function useTelegram() {
  const webApp = getWebApp()
  const isReady = ref(false)
  const user = ref<TelegramUser | null>(null)
  const themeParams = ref<TelegramThemeParams>({})
  const colorScheme = ref<'light' | 'dark'>('light')

  const isInTelegram = computed(() => webApp !== null)

  const displayName = computed(() => {
    if (!user.value) return 'Guest'
    const { first_name, last_name } = user.value
    if (first_name && last_name) {
      return `${first_name} ${last_name}`
    }
    return first_name || 'User'
  })

  const avatarUrl = computed(() => user.value?.photo_url || null)

  /**
   * Initialize Telegram WebApp.
   */
  function init() {
    if (!webApp) {
      console.warn('Not running inside Telegram WebApp')
      isReady.value = true
      return
    }

    // Set user data
    if (webApp.initDataUnsafe?.user) {
      user.value = webApp.initDataUnsafe.user
    }

    // Set theme
    themeParams.value = webApp.themeParams || {}
    colorScheme.value = webApp.colorScheme || 'light'

    // Tell Telegram that the app is ready
    webApp.ready()

    // Expand to full height
    webApp.expand()

    isReady.value = true
  }

  /**
   * Apply Telegram theme colors to CSS variables.
   */
  function applyTheme() {
    if (!webApp) return

    const params = webApp.themeParams
    const root = document.documentElement

    if (params.bg_color) {
      root.style.setProperty('--tg-bg-color', params.bg_color)
    }
    if (params.text_color) {
      root.style.setProperty('--tg-text-color', params.text_color)
    }
    if (params.hint_color) {
      root.style.setProperty('--tg-hint-color', params.hint_color)
    }
    if (params.link_color) {
      root.style.setProperty('--tg-link-color', params.link_color)
    }
    if (params.button_color) {
      root.style.setProperty('--tg-button-color', params.button_color)
    }
    if (params.button_text_color) {
      root.style.setProperty('--tg-button-text-color', params.button_text_color)
    }
    if (params.secondary_bg_color) {
      root.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color)
    }
  }

  /**
   * Close the Mini App.
   */
  function close() {
    webApp?.close()
  }

  /**
   * Get init data for backend validation.
   */
  function getInitData(): string {
    return webApp?.initData || ''
  }

  /**
   * Get user's Telegram ID.
   */
  function getTelegramId(): number | null {
    return user.value?.id || null
  }

  onMounted(() => {
    init()
    applyTheme()
  })

  return {
    isInTelegram,
    isReady,
    user,
    displayName,
    avatarUrl,
    themeParams,
    colorScheme,
    close,
    getInitData,
    getTelegramId,
    webApp,
  }
}
