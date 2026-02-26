import { apiFetch } from './index'
import type { Wish, Wishlist } from '@/types'

export const wishesApi = {
    getWishlists: (telegramId: number) => {
        return apiFetch<Wishlist[]>(`/wishlists?telegram_id=${telegramId}`)
    },

    getWishes: (wishlistId: string, currentUserId?: number) => {
        const url = currentUserId
            ? `/wishes?wishlist_id=${wishlistId}&current_user_id=${currentUserId}`
            : `/wishes?wishlist_id=${wishlistId}`
        return apiFetch<Wish[]>(url)
    },

    getWish: (wishId: string, currentUserId?: number) => {
        const url = currentUserId
            ? `/wishes/${wishId}?current_user_id=${currentUserId}`
            : `/wishes/${wishId}`
        return apiFetch<Wish>(url)
    },

    bookWish: (wishId: string, telegramId: number) => {
        return apiFetch<Wish>(`/wishes/${wishId}/book?telegram_id=${telegramId}`, {
            method: 'POST'
        })
    },

    unbookWish: (wishId: string, telegramId: number) => {
        return apiFetch<Wish>(`/wishes/${wishId}/unbook?telegram_id=${telegramId}`, {
            method: 'POST'
        })
    },

    fulfillWish: (wishId: string, telegramId: number) => {
        return apiFetch<Wish>(`/wishes/${wishId}/fulfill?telegram_id=${telegramId}`, {
            method: 'POST'
        })
    },

    archiveWish: (wishId: string, telegramId: number) => {
        return apiFetch<Wish>(`/wishes/${wishId}/archive?telegram_id=${telegramId}`, {
            method: 'POST'
        })
    },

    unarchiveWish: (wishId: string, telegramId: number) => {
        return apiFetch<Wish>(`/wishes/${wishId}/archive?telegram_id=${telegramId}`, {
            method: 'DELETE'
        })
    }
}
