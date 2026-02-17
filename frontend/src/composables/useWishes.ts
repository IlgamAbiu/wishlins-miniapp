/**
 * Composable for managing wishes.
 */

import { ref } from 'vue'
import type { Wish, CreateWishRequest } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const wishes = ref<Wish[]>([])
const selectedWish = ref<Wish | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useWishes() {

    const currentWishlistId = ref<string | null>(null)

    function openWish(wish: Wish) {
        selectedWish.value = wish
    }

    function closeWish() {
        selectedWish.value = null
    }

    async function fetchWishes(wishlistId: string): Promise<void> {
        loading.value = true
        error.value = null
        currentWishlistId.value = wishlistId // Track current list

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

            // Add to list only if matches current context
            if (currentWishlistId.value === newWish.wishlist_id || !currentWishlistId.value) {
                wishes.value.unshift(newWish)
            }
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

            // Smart list update
            if (currentWishlistId.value && updated.wishlist_id !== currentWishlistId.value) {
                // Moved out of current list
                if (index !== -1) wishes.value.splice(index, 1)
            } else if (currentWishlistId.value && updated.wishlist_id === currentWishlistId.value) {
                // Moved into or updated in current list
                if (index !== -1) {
                    wishes.value[index] = updated
                } else {
                    wishes.value.unshift(updated) // Add back if it was removed
                }
            } else {
                // No current list context or generic update
                if (index !== -1) wishes.value[index] = updated
            }

            // Update selectedWish if it's the one being updated
            if (selectedWish.value && selectedWish.value.id === wishId) {
                selectedWish.value = updated
            }

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

    async function fulfillWish(wishId: string, telegramId: number): Promise<Wish | null> {
        loading.value = true
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}/fulfill?telegram_id=${telegramId}`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to fulfill wish')
            }

            const updated = await response.json()

            // Smart list update
            const index = wishes.value.findIndex(w => w.id === wishId)

            if (currentWishlistId.value && updated.wishlist_id !== currentWishlistId.value) {
                // Moved out (fulfilled)
                if (index !== -1) wishes.value.splice(index, 1)
            } else if (currentWishlistId.value && updated.wishlist_id === currentWishlistId.value) {
                // Should be here (e.g. restoring to current list if fulfill logic was reverse? unlikely for fulfill)
                if (index !== -1) wishes.value[index] = updated
                else wishes.value.unshift(updated)
            } else {
                if (index !== -1) wishes.value[index] = updated
            }

            // Update selectedWish (keep it open and updated)
            if (selectedWish.value && selectedWish.value.id === wishId) {
                selectedWish.value = updated
            }
            return updated
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fulfill wish'
            return null
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
        fulfillWish,
        openWish,
        closeWish
    }
}
