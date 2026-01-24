/**
 * TelegramService - Centralized access to Telegram WebApp API.
 *
 * Architecture Decision:
 * - Single source of truth for all Telegram WebApp interactions
 * - Abstracts away the global window.Telegram object
 * - Provides type-safe methods for common operations
 * - Handles graceful fallbacks when running outside Telegram
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles Telegram WebApp API
 * - Open/Closed: Easy to extend with new Telegram features
 * - Dependency Inversion: Components depend on this abstraction, not window.Telegram
 */

import type { TelegramWebApp, TelegramUser, TelegramThemeParams } from '@/types'

class TelegramService {
  private webApp: TelegramWebApp | null = null
  private initialized = false

  /**
   * Check if running inside Telegram WebApp environment.
   */
  get isInTelegram(): boolean {
    return typeof window !== 'undefined' &&
           window.Telegram !== undefined &&
           window.Telegram.WebApp !== undefined
  }

  /**
   * Get the WebApp instance.
   */
  get app(): TelegramWebApp | null {
    if (!this.webApp && this.isInTelegram) {
      this.webApp = window.Telegram.WebApp
    }
    return this.webApp
  }

  /**
   * Initialize the Telegram WebApp.
   * Should be called once on app mount.
   */
  init(): void {
    if (this.initialized) return

    const app = this.app
    if (!app) {
      console.warn('[TelegramService] Not running inside Telegram WebApp')
      this.initialized = true
      return
    }

    // Tell Telegram the app is ready
    app.ready()

    // Expand to full viewport
    app.expand()

    this.initialized = true
  }

  /**
   * Get current user data from Telegram.
   */
  getUser(): TelegramUser | null {
    return this.app?.initDataUnsafe?.user ?? null
  }

  /**
   * Get user's display name.
   */
  getDisplayName(): string {
    const user = this.getUser()
    if (!user) return 'Guest'

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.first_name || user.username || 'User'
  }

  /**
   * Get user's avatar URL.
   */
  getAvatarUrl(): string | null {
    return this.getUser()?.photo_url ?? null
  }

  /**
   * Get user's Telegram ID.
   */
  getTelegramId(): number | null {
    return this.getUser()?.id ?? null
  }

  /**
   * Get current theme parameters.
   */
  getThemeParams(): TelegramThemeParams {
    return this.app?.themeParams ?? {}
  }

  /**
   * Get current color scheme.
   */
  getColorScheme(): 'light' | 'dark' {
    return this.app?.colorScheme ?? 'light'
  }

  /**
   * Get safe area insets for proper layout.
   */
  getSafeAreaInsets(): { top: number; bottom: number } {
    // Telegram provides viewport heights that account for safe areas
    const app = this.app
    if (!app) return { top: 0, bottom: 0 }

    // Calculate bottom safe area from viewport difference
    const bottomInset = app.viewportHeight - app.viewportStableHeight

    return {
      top: 0, // Header is handled by Telegram
      bottom: Math.max(bottomInset, 0),
    }
  }

  /**
   * Apply theme colors to CSS variables.
   */
  applyTheme(): void {
    const params = this.getThemeParams()
    const root = document.documentElement

    const cssVars: Record<string, string | undefined> = {
      '--tg-bg-color': params.bg_color,
      '--tg-text-color': params.text_color,
      '--tg-hint-color': params.hint_color,
      '--tg-link-color': params.link_color,
      '--tg-button-color': params.button_color,
      '--tg-button-text-color': params.button_text_color,
      '--tg-secondary-bg-color': params.secondary_bg_color,
      '--tg-header-bg-color': params.header_bg_color,
      '--tg-section-bg-color': params.section_bg_color,
      '--tg-accent-text-color': params.accent_text_color,
      '--tg-destructive-text-color': params.destructive_text_color,
    }

    Object.entries(cssVars).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(key, value)
      }
    })

    // Set color scheme class for conditional styling
    root.classList.toggle('dark', this.getColorScheme() === 'dark')
  }

  /**
   * Get init data for backend validation.
   */
  getInitData(): string {
    return this.app?.initData ?? ''
  }

  /**
   * Show the main button.
   */
  showMainButton(text: string, onClick: () => void): void {
    const button = this.app?.MainButton
    if (!button) return

    button.setText(text)
    button.onClick(onClick)
    button.show()
  }

  /**
   * Hide the main button.
   */
  hideMainButton(): void {
    this.app?.MainButton.hide()
  }

  /**
   * Close the Mini App.
   */
  close(): void {
    this.app?.close()
  }

  /**
   * Trigger haptic feedback.
   */
  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    // @ts-ignore - HapticFeedback may not be in type definitions
    this.app?.HapticFeedback?.impactOccurred(type)
  }
}

// Export singleton instance
export const telegramService = new TelegramService()
