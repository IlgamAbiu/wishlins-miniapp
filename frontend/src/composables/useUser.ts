/**
 * Composable for user profile operations.
 */

import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

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
  async function getUserByTelegramId(telegramId: number): Promise<any | null> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/users/telegram/${telegramId}`, {
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

  return {
    loading,
    error,
    updateProfileText,
    getUserByTelegramId,
  }
}
