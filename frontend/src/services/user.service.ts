import type { User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Service for user-related API calls.
 */
export const userService = {
    /**
     * Get friends list for a user.
     * @param telegramId The Telegram ID of the current user.
     * @returns List of friends (users).
     */
    async getFriends(telegramId: number): Promise<User[]> {
        try {
            const response = await fetch(`${API_URL}/users/friends?telegram_id=${telegramId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch friends: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error fetching friends:', error)
            throw error
        }
    },

    async subscribe(currentUserId: number, targetId: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/users/${targetId}/subscribe?current_user_id=${currentUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to subscribe: ${response.statusText}`)
            }
        } catch (error) {
            console.error('Error subscribing:', error)
            throw error
        }
    },

    async unsubscribe(currentUserId: number, targetId: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/users/${targetId}/subscribe?current_user_id=${currentUserId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to unsubscribe: ${response.statusText}`)
            }
        } catch (error) {
            console.error('Error unsubscribing:', error)
            throw error
        }
    },

    async searchUsers(query: string, currentUserId: number): Promise<User[]> {
        try {
            const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}&current_user_id=${currentUserId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                if (response.status === 404) return []
                throw new Error(`Failed to search users: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error searching users:', error)
            throw error
        }
    },
}
