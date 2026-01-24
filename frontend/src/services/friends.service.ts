/**
 * FriendsService - Handles social graph and friends data.
 *
 * Architecture Decision:
 * - Prepared for Telegram social graph integration
 * - Provides mock data for MVP
 * - Structured for future contact sync feature
 *
 * SOLID Principles:
 * - Single Responsibility: Only manages friends data
 * - Interface Segregation: Clean interface for social features
 * - Open/Closed: Ready for Telegram Contacts API integration
 */

import type { Friend } from '@/types'

// Simulated network delay
const MOCK_DELAY = 250

class FriendsService {
  private cachedFriends: Friend[] | null = null

  /**
   * Get user's friends list.
   * In production, would fetch from backend/Telegram.
   */
  async getFriends(): Promise<Friend[]> {
    if (this.cachedFriends) return this.cachedFriends

    await this.delay(MOCK_DELAY)

    // For MVP, return empty list to show empty state
    // Set to this.generateMockFriends() to test with data
    this.cachedFriends = []
    return this.cachedFriends
  }

  /**
   * Search friends by name or username.
   */
  async searchFriends(query: string): Promise<Friend[]> {
    const friends = await this.getFriends()

    if (!query.trim()) return friends

    const lowerQuery = query.toLowerCase()
    return friends.filter(friend =>
      friend.firstName.toLowerCase().includes(lowerQuery) ||
      friend.lastName?.toLowerCase().includes(lowerQuery) ||
      friend.username?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get friend by ID.
   */
  async getFriendById(friendId: string): Promise<Friend | null> {
    const friends = await this.getFriends()
    return friends.find(f => f.id === friendId) ?? null
  }

  /**
   * Invite friend via Telegram.
   * Placeholder for future implementation.
   */
  async inviteFriend(): Promise<void> {
    // In production, would use Telegram's share API
    console.log('[FriendsService] Invite friend - not implemented')
  }

  /**
   * Sync contacts from Telegram.
   * Placeholder for future Telegram Contacts API integration.
   */
  async syncContacts(): Promise<Friend[]> {
    await this.delay(MOCK_DELAY)

    // In production, would request contacts permission
    // and sync with backend
    console.log('[FriendsService] Sync contacts - not implemented')

    return []
  }

  /**
   * Clear cached data.
   */
  clearCache(): void {
    this.cachedFriends = null
  }

  /**
   * Generate mock friends data for testing.
   * Uncomment in getFriends() to use.
   */
  private generateMockFriends(): Friend[] {
    return [
      {
        id: 'friend-1',
        telegramId: 100001,
        username: 'alice_w',
        firstName: 'Alice',
        lastName: 'Wilson',
        wishlistCount: 5,
      },
      {
        id: 'friend-2',
        telegramId: 100002,
        username: 'bob_smith',
        firstName: 'Bob',
        lastName: 'Smith',
        wishlistCount: 12,
      },
      {
        id: 'friend-3',
        telegramId: 100003,
        firstName: 'Charlie',
        wishlistCount: 3,
      },
      {
        id: 'friend-4',
        telegramId: 100004,
        username: 'diana_k',
        firstName: 'Diana',
        lastName: 'Kim',
        wishlistCount: 8,
      },
    ]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const friendsService = new FriendsService()
