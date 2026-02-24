/**
 * Composable for user profile operations.
 */

import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Global counter — incremented whenever the subscription list changes
// FriendsView watches this to trigger a re-fetch of the friends list
export const subscribeVersion = ref(0)

export function useUser() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Update user profile text
   */
  async function updateProfileText(telegramId: number, profileText: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/users/telegram/${telegramId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_text: profileText }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to update profile')
      }

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
   * Get user by telegram ID
   */
  async function getUserByTelegramId(telegramId: number, currentUserId?: number): Promise<any | null> {
    loading.value = true
    error.value = null

    try {
      const url = currentUserId
        ? `${API_BASE_URL}/users/telegram/${telegramId}?current_user_id=${currentUserId}`
        : `${API_BASE_URL}/users/telegram/${telegramId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const data = await response.json()
        throw new Error(data.detail || 'Failed to get user')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error getting user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function subscribe(currentUserId: number, targetId: number): Promise<boolean> {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/users/${targetId}/subscribe?current_user_id=${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to subscribe')
      subscribeVersion.value++
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe(currentUserId: number, targetId: number): Promise<boolean> {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/users/${targetId}/subscribe?current_user_id=${currentUserId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to unsubscribe')
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
    subscribe,
    unsubscribe
  }
}
