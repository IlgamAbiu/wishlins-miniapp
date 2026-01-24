/**
 * FeedService - Handles feed data operations.
 *
 * Architecture Decision:
 * - Provides mock data for MVP, ready for API integration
 * - Supports pagination for infinite scroll
 * - Single responsibility: only manages feed data
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles feed data
 * - Interface Segregation: Clean interface for feed operations
 * - Dependency Inversion: Can easily swap mock for real API
 */

import type { FeedItem, NewsItem, IdeaItem, PromoItem } from '@/types'

// Simulated network delay for realistic behavior
const MOCK_DELAY = 300

class FeedService {
  private pageSize = 10

  /**
   * Fetch feed items with pagination.
   * @param page - Page number (0-indexed)
   * @returns Promise with feed items and hasMore flag
   */
  async getFeedItems(page: number = 0): Promise<{ items: FeedItem[]; hasMore: boolean }> {
    // Simulate network delay
    await this.delay(MOCK_DELAY)

    const allItems = this.generateMockItems()
    const start = page * this.pageSize
    const end = start + this.pageSize
    const items = allItems.slice(start, end)
    const hasMore = end < allItems.length

    return { items, hasMore }
  }

  /**
   * Refresh feed (pull-to-refresh).
   */
  async refreshFeed(): Promise<{ items: FeedItem[]; hasMore: boolean }> {
    return this.getFeedItems(0)
  }

  /**
   * Generate mock feed items.
   * In production, this would be replaced with API calls.
   */
  private generateMockItems(): FeedItem[] {
    const items: FeedItem[] = []

    // Mix different item types for realistic feed
    for (let i = 0; i < 30; i++) {
      const type = i % 5 === 0 ? 'promo' : i % 3 === 0 ? 'idea' : 'news'

      switch (type) {
        case 'news':
          items.push(this.createNewsItem(i))
          break
        case 'idea':
          items.push(this.createIdeaItem(i))
          break
        case 'promo':
          items.push(this.createPromoItem(i))
          break
      }
    }

    return items
  }

  private createNewsItem(index: number): NewsItem {
    const titles = [
      'New Wishlist Features Coming Soon',
      'How to Create the Perfect Gift List',
      'Top 10 Gift Ideas for 2024',
      'Share Your Wishlist with Friends',
      'Holiday Shopping Made Easy',
    ]

    return {
      id: `news-${index}`,
      type: 'news',
      title: titles[index % titles.length],
      summary: 'Discover the latest updates and tips for making the most of your wishlist experience.',
      source: 'Wishlist Blog',
      createdAt: new Date(Date.now() - index * 3600000).toISOString(),
    }
  }

  private createIdeaItem(index: number): IdeaItem {
    const ideas = [
      { title: 'Tech Gadgets', category: 'Electronics', description: 'Latest smartphones, tablets, and accessories' },
      { title: 'Home Decor', category: 'Home', description: 'Beautiful items to make your space cozy' },
      { title: 'Fashion Picks', category: 'Clothing', description: 'Trending styles for the season' },
      { title: 'Book Collection', category: 'Books', description: 'Must-read titles for book lovers' },
      { title: 'Fitness Gear', category: 'Sports', description: 'Equipment for your workout routine' },
    ]

    const idea = ideas[index % ideas.length]

    return {
      id: `idea-${index}`,
      type: 'idea',
      title: idea.title,
      description: idea.description,
      category: idea.category,
      likes: Math.floor(Math.random() * 100) + 10,
      createdAt: new Date(Date.now() - index * 7200000).toISOString(),
    }
  }

  private createPromoItem(index: number): PromoItem {
    const promos = [
      { title: 'Premium Features', subtitle: 'Upgrade your experience', bg: '#6366f1' },
      { title: 'Invite Friends', subtitle: 'Share and earn rewards', bg: '#8b5cf6' },
      { title: 'New Categories', subtitle: 'Explore more options', bg: '#ec4899' },
    ]

    const promo = promos[index % promos.length]

    return {
      id: `promo-${index}`,
      type: 'promo',
      title: promo.title,
      subtitle: promo.subtitle,
      imageUrl: '',
      backgroundColor: promo.bg,
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const feedService = new FeedService()
