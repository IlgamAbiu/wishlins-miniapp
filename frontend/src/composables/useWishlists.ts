/**
 * Composable for managing wishlists.
 * Uses centralized API client.
 */

import { ref } from 'vue'
import { api } from '@/services/api'
import type { Wishlist, WishlistListResponse } from '@/types'

export function useWishlists() {
  const wishlists = ref<Wishlist[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWishlists(telegramId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const data = await api.get<WishlistListResponse>(`/wishlists/user/telegram/${telegramId}`)
      wishlists.value = data.wishlists
    } catch (err: any) {
      if (err.status === 404) {
        wishlists.value = []
        return
      }
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
    eventDate?: string | null,
    description?: string | null
  ): Promise<Wishlist | null> {
    loading.value = true
    error.value = null
    try {
      const newWishlist = await api.post<Wishlist>(`/wishlists/?telegram_id=${telegramId}`, {
        title,
        is_public: isPublic,
        event_date: eventDate,
        description: description || null,
      })
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
    data: { title?: string; isPublic?: boolean; eventDate?: string | null; description?: string | null }
  ): Promise<Wishlist | null> {
    loading.value = true
    try {
      const updated = await api.patch<Wishlist>(`/wishlists/${id}`, {
        title: data.title,
        is_public: data.isPublic,
        event_date: data.eventDate,
        description: data.description,
      })
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
      await api.delete(`/wishlists/${id}`)
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
