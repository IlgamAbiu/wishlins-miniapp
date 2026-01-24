/**
 * Type definitions for the Wishlist Mini App.
 */

/**
 * User entity from the backend API.
 */
export interface User {
  id: string
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * API response wrapper for user data.
 */
export interface UserResponse {
  user: User
  is_new_user: boolean
}

/**
 * Telegram WebApp user data.
 */
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/**
 * Telegram WebApp init data.
 */
export interface TelegramWebAppInitData {
  query_id?: string
  user?: TelegramUser
  auth_date: number
  hash: string
}

/**
 * Telegram WebApp theme parameters.
 */
export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

/**
 * Telegram WebApp interface.
 */
export interface TelegramWebApp {
  initData: string
  initDataUnsafe: TelegramWebAppInitData
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

/**
 * Analytics event names (placeholders).
 */
export const AnalyticsEvents = {
  BOT_START: 'bot_start',
  USER_REGISTERED: 'user_registered',
  MINIAPP_OPENED: 'miniapp_opened',
  TAB_SWITCHED: 'tab_switched',
  FEED_SCROLLED: 'feed_scrolled',
  WISHLIST_ITEM_VIEWED: 'wishlist_item_viewed',
} as const

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents]

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Available tabs in the application.
 * Using const enum for better tree-shaking and type safety.
 */
export type TabId = 'feed' | 'profile' | 'friends'

/**
 * Tab configuration for the Tab Bar.
 */
export interface TabConfig {
  id: TabId
  label: string
  icon: string
  activeIcon: string
}

/**
 * Navigation state.
 */
export interface NavigationState {
  activeTab: TabId
  previousTab: TabId | null
  history: TabId[]
}

// ============================================================================
// Feed Types
// ============================================================================

/**
 * Base interface for all feed items.
 */
export interface FeedItemBase {
  id: string
  type: 'news' | 'idea' | 'promo'
  createdAt: string
}

/**
 * News feed item.
 */
export interface NewsItem extends FeedItemBase {
  type: 'news'
  title: string
  summary: string
  imageUrl?: string
  source: string
}

/**
 * Idea card feed item.
 */
export interface IdeaItem extends FeedItemBase {
  type: 'idea'
  title: string
  description: string
  category: string
  likes: number
  imageUrl?: string
}

/**
 * Promotional banner feed item.
 */
export interface PromoItem extends FeedItemBase {
  type: 'promo'
  title: string
  subtitle: string
  imageUrl: string
  actionUrl?: string
  backgroundColor?: string
}

/**
 * Union type for all feed items.
 */
export type FeedItem = NewsItem | IdeaItem | PromoItem

/**
 * Feed state.
 */
export interface FeedState {
  items: FeedItem[]
  isLoading: boolean
  hasMore: boolean
  page: number
}

// ============================================================================
// Wishlist Types
// ============================================================================

/**
 * Wishlist item.
 */
export interface WishlistItem {
  id: string
  title: string
  description?: string
  price?: number
  currency?: string
  imageUrl?: string
  link?: string
  isPurchased: boolean
  createdAt: string
}

/**
 * Wishlist state.
 */
export interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
}

// ============================================================================
// Friends Types
// ============================================================================

/**
 * Friend entity.
 */
export interface Friend {
  id: string
  telegramId: number
  username?: string
  firstName: string
  lastName?: string
  avatarUrl?: string
  wishlistCount: number
}

/**
 * Friends state.
 */
export interface FriendsState {
  friends: Friend[]
  isLoading: boolean
}
