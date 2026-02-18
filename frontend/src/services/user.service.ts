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
                    // Add any auth headers if needed, though telegram_id is currently used for "auth" in this MVP
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch friends: ${response.statusText}`)
            }

            const data = await response.json()
            // The backend returns a list of UserResponse objects, which matches our User type
            return data
        } catch (error) {
            console.error('Error fetching friends:', error)
            throw error
        }
    },
}
