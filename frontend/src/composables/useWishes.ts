/**
 * Composable for managing wishes.
 */

import { ref } from 'vue'
import type { Wish, CreateWishRequest } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function useWishes() {
    const wishes = ref<Wish[]>([])
    const selectedWish = ref<Wish | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    function openWish(wish: Wish) {
        selectedWish.value = wish
    }

    function closeWish() {
        selectedWish.value = null
    }

    async function fetchWishes(wishlistId: string): Promise<void> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/wishes?wishlist_id=${wishlistId}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch wishes: ${response.statusText}`)
            }

            wishes.value = await response.json()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred'
            wishes.value = []
        } finally {
            loading.value = false
        }
    }

    async function createWish(wish: CreateWishRequest, telegramId: number): Promise<Wish | null> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/wishes?telegram_id=${telegramId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wish),
            })

            if (!response.ok) {
                throw new Error(`Failed to create wish: ${response.statusText}`)
            }

            const newWish = await response.json()
            wishes.value.unshift(newWish)
            return newWish
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create wish'
            return null
        } finally {
            loading.value = false
        }
    }

    async function deleteWish(wishId: string, telegramId: number): Promise<boolean> {
        loading.value = true
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}?telegram_id=${telegramId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete wish')
            }

            wishes.value = wishes.value.filter(w => w.id !== wishId)
            return true
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete wish'
            return false
        } finally {
            loading.value = false
        }
    }

    async function updateWish(wishId: string, wish: Partial<CreateWishRequest>, telegramId: number): Promise<Wish | null> {
        loading.value = true;
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}?telegram_id=${telegramId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wish),
            })

            if (!response.ok) {
                throw new Error('Failed to update wish')
            }

            const updated = await response.json()
            const index = wishes.value.findIndex(w => w.id === wishId)
            if (index !== -1) wishes.value[index] = updated
            return updated
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update wish'
            return null
        } finally {
            loading.value = false
        }
    }

    async function moveWishesToWishlist(
        fromWishlistId: string,
        toWishlistId: string,
        telegramId: number
    ): Promise<boolean> {
        loading.value = true
        try {
            // Fetch wishes from source wishlist
            const response = await fetch(`${API_BASE_URL}/wishes?wishlist_id=${fromWishlistId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch wishes')
            }

            const wishesToMove: Wish[] = await response.json()

            // Update each wish to move it to the target wishlist
            const updatePromises = wishesToMove.map(wish =>
                fetch(`${API_BASE_URL}/wishes/${wish.id}?telegram_id=${telegramId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wishlist_id: toWishlistId
                    }),
                })
            )

            const results = await Promise.all(updatePromises)

            // Check if all updates were successful
            if (results.some(r => !r.ok)) {
                throw new Error('Failed to move some wishes')
            }

            return true
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to move wishes'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        wishes,
        selectedWish,
        loading,
        error,
        fetchWishes,
        createWish,
        deleteWish,
        updateWish,
        moveWishesToWishlist,
        openWish,
        closeWish
    }
}
