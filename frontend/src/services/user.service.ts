/**
 * UserService - Handles user data and wishlist operations.
 *
 * Architecture Decision:
 * - Combines user profile and wishlist management
 * - Uses TelegramService for user identity
 * - Provides mock data for MVP
 *
 * SOLID Principles:
 * - Single Responsibility: User and their wishlist data
 * - Open/Closed: Easy to add new user features
 * - Dependency Inversion: Depends on TelegramService abstraction
 */

import type { User, WishlistItem, TelegramUser } from '@/types'
import { telegramService } from './telegram.service'

// Simulated network delay
const MOCK_DELAY = 200

class UserService {
  private cachedUser: User | null = null
  private cachedWishlist: WishlistItem[] | null = null

  /**
   * Get current user profile.
   * Combines Telegram data with backend user data.
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.cachedUser) return this.cachedUser

    const telegramUser = telegramService.getUser()
    if (!telegramUser) return null

    // In MVP, create user object from Telegram data
    // In production, this would fetch from backend API
    await this.delay(MOCK_DELAY)

    this.cachedUser = this.createUserFromTelegram(telegramUser)
    return this.cachedUser
  }

  /**
   * Get user's wishlist items.
   */
  async getWishlist(): Promise<WishlistItem[]> {
    if (this.cachedWishlist) return this.cachedWishlist

    await this.delay(MOCK_DELAY)

    // Mock wishlist data
    this.cachedWishlist = this.generateMockWishlist()
    return this.cachedWishlist
  }

  /**
   * Add item to wishlist.
   * Placeholder for future CRUD operations.
   */
  async addWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt' | 'isPurchased'>): Promise<WishlistItem> {
    await this.delay(MOCK_DELAY)

    const newItem: WishlistItem = {
      ...item,
      id: `item-${Date.now()}`,
      isPurchased: false,
      createdAt: new Date().toISOString(),
    }

    if (this.cachedWishlist) {
      this.cachedWishlist.unshift(newItem)
    }

    return newItem
  }

  /**
   * Remove item from wishlist.
   */
  async removeWishlistItem(itemId: string): Promise<void> {
    await this.delay(MOCK_DELAY)

    if (this.cachedWishlist) {
      this.cachedWishlist = this.cachedWishlist.filter(item => item.id !== itemId)
    }
  }

  /**
   * Toggle item purchased status.
   */
  async togglePurchased(itemId: string): Promise<WishlistItem | null> {
    await this.delay(MOCK_DELAY)

    if (!this.cachedWishlist) return null

    const item = this.cachedWishlist.find(i => i.id === itemId)
    if (item) {
      item.isPurchased = !item.isPurchased
    }

    return item ?? null
  }

  /**
   * Clear cached data (for logout/refresh).
   */
  clearCache(): void {
    this.cachedUser = null
    this.cachedWishlist = null
  }

  /**
   * Create User object from Telegram user data.
   */
  private createUserFromTelegram(telegramUser: TelegramUser): User {
    return {
      id: `tg-${telegramUser.id}`,
      telegram_id: telegramUser.id,
      username: telegramUser.username ?? null,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name ?? null,
      avatar_url: telegramUser.photo_url ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Generate mock wishlist items.
   */
  private generateMockWishlist(): WishlistItem[] {
    return [
      {
        id: 'item-1',
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise-canceling wireless headphones',
        price: 349.99,
        currency: 'USD',
        isPurchased: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'item-2',
        title: 'Kindle Paperwhite',
        description: 'E-reader with adjustable warm light',
        price: 139.99,
        currency: 'USD',
        isPurchased: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'item-3',
        title: 'Lego Architecture Set',
        description: 'Empire State Building model',
        price: 99.99,
        currency: 'USD',
        isPurchased: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const userService = new UserService()
