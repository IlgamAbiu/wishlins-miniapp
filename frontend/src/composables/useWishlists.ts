/**
 * Composable for managing wishlists.
 */

import { ref } from 'vue'
import type { Wishlist, WishlistListResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function useWishlists() {
  const wishlists = ref<Wishlist[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWishlists(telegramId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/user/telegram/${telegramId}`)

      if (!response.ok) {
        if (response.status === 404) {
          // User not found or has no wishlists
          wishlists.value = []
          return
        }
        throw new Error(`Failed to fetch wishlists: ${response.statusText}`)
      }

      const data: WishlistListResponse = await response.json()
      wishlists.value = data.wishlists
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      wishlists.value = []
    } finally {
      loading.value = false
    }
  }

  async function createWishlist(
    title: string,
    telegramId: number,
    isPublic: boolean = false,
    emoji?: string | null,
    eventDate?: string | null
  ): Promise<Wishlist | null> {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/?telegram_id=${telegramId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          is_public: isPublic,
          emoji,
          event_date: eventDate
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create wishlist: ${response.statusText}`)
      }

      const newWishlist = await response.json()
      wishlists.value.push(newWishlist)
      return newWishlist
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create wishlist'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateWishlist(
    id: string,
    data: { title?: string; isPublic?: boolean; emoji?: string | null; eventDate?: string | null }
  ): Promise<Wishlist | null> {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          is_public: data.isPublic,
          emoji: data.emoji,
          event_date: data.eventDate
        })
      })

      if (!response.ok) throw new Error('Failed to update wishlist')

      const updated = await response.json()
      const index = wishlists.value.findIndex(w => w.id === id)
      if (index !== -1) {
        wishlists.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteWishlist(id: string): Promise<boolean> {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete wishlist')

      wishlists.value = wishlists.value.filter(w => w.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Delete failed'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    wishlists,
    loading,
    error,
    fetchWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
  }
}
