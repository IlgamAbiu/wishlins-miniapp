/**
 * Composable for user profile operations.
 * Merges functionality from useUser.ts + user.service.ts into one file.
 * Uses centralized API client.
 */

import { ref } from 'vue'
import { api } from '@/services/api'
import type { User } from '@/types'

// Global counter — incremented whenever the subscription list changes.
// FriendsView watches this to trigger a re-fetch.
export const subscribeVersion = ref(0)

export function useUser() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Update user profile text.
   */
  async function updateProfileText(telegramId: number, profileText: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await api.patch(`/users/telegram/${telegramId}/profile`, { profile_text: profileText })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating profile:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get user by Telegram ID.
   */
  async function getUserByTelegramId(telegramId: number, currentUserId?: number): Promise<any | null> {
    loading.value = true
    error.value = null

    try {
      const query = currentUserId
        ? `/users/telegram/${telegramId}?current_user_id=${currentUserId}`
        : `/users/telegram/${telegramId}`
      return await api.get(query)
    } catch (err: any) {
      if (err.status === 404) return null
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error getting user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get friends list for a user.
   */
  async function getFriends(telegramId: number): Promise<User[]> {
    try {
      return await api.get<User[]>(`/users/friends?telegram_id=${telegramId}`)
    } catch (err) {
      console.error('Error fetching friends:', err)
      throw err
    }
  }

  /**
   * Search users by query string.
   */
  async function searchUsers(query: string, currentUserId: number): Promise<User[]> {
    try {
      return await api.get<User[]>(
        `/users/search?query=${encodeURIComponent(query)}&current_user_id=${currentUserId}`
      )
    } catch (err: any) {
      if (err.status === 404) return []
      console.error('Error searching users:', err)
      throw err
    }
  }

  /**
   * Subscribe to a user.
   */
  async function subscribe(currentUserId: number, targetId: number): Promise<boolean> {
    loading.value = true
    try {
      await api.post(`/users/${targetId}/subscribe?current_user_id=${currentUserId}`)
      subscribeVersion.value++
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Unsubscribe from a user.
   */
  async function unsubscribe(currentUserId: number, targetId: number): Promise<boolean> {
    loading.value = true
    try {
      await api.delete(`/users/${targetId}/subscribe?current_user_id=${currentUserId}`)
      subscribeVersion.value++
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    updateProfileText,
    getUserByTelegramId,
    getFriends,
    searchUsers,
    subscribe,
    unsubscribe,
  }
}
