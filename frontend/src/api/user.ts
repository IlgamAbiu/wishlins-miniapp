import { apiFetch } from './index'

export interface UserProfile {
    id: number
    telegram_id: number
    username?: string | null
    first_name: string
    last_name?: string | null
    photo_url?: string | null
    profile_text?: string | null
    birth_date?: string | null
    is_subscribed: boolean
}

export const userApi = {
    getByTelegramId: (telegramId: number, currentUserId?: number) => {
        const url = currentUserId
            ? `/users/telegram/${telegramId}?current_user_id=${currentUserId}`
            : `/users/telegram/${telegramId}`
        return apiFetch<UserProfile>(url)
    },

    updateProfile: (telegramId: number, data: { profile_text?: string }) => {
        return apiFetch<UserProfile>(`/users/telegram/${telegramId}/profile`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
    },

    subscribe: (currentUserId: number, targetTelegramId: number) => {
        return apiFetch<void>(`/users/${targetTelegramId}/subscribe?current_user_id=${currentUserId}`, {
            method: 'POST'
        })
    },

    unsubscribe: (currentUserId: number, targetTelegramId: number) => {
        return apiFetch<void>(`/users/${targetTelegramId}/subscribe?current_user_id=${currentUserId}`, {
            method: 'DELETE'
        })
    }
}
