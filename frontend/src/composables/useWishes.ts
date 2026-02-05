/**
 * Composable for managing wishes.
 */

import { ref } from 'vue'
import type { Wish, CreateWishRequest } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function useWishes() {
    const wishes = ref<Wish[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchWishes(wishlistId: string): Promise<void> {
        loading.value = true
        error.value = null

        try {
            // Assuming we'll add an endpoint to get wishes by wishlist
            // For now, we might need to filter or get from wishlist details if backend structure differs
            // But based on our new backend, we should have a route or we can use the main wishlists route if it returns wishes items (it doesn't currently)
            // We haven't implemented GET /wishlists/{id}/wishes or GET /wishes?wishlist_id={id}
            // Let's assume we use the main GET /wishlists/{id} ? No, that returns just wishlist info.

            // Wait, in our backend plan we didn't explicitly add a route to get wishes for a wishlist!
            // We added `WishRepository.get_by_wishlist_id` but we didn't expose it in `WishController` (wishes.py) as a list endpoint.
            // We implicitly might have expected them to be included in Wishlist response OR we need a new endpoint.
            // Let's check backend routes again.
            // We defined `wishes` router with POST, PUT, DELETE. But no GET list!
            // We need to fix backend first to allow fetching wishes.

            // I will implement the fetch here assuming the endpoint exists, then I will go fix the backend.
            // Proposed endpoint: GET /api/v1/wishes?wishlist_id=...

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

    async function createWish(wish: CreateWishRequest): Promise<Wish | null> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE_URL}/wishes`, {
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

    async function deleteWish(wishId: string): Promise<boolean> {
        loading.value = true
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}`, {
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

    return {
        wishes,
        loading,
        error,
        fetchWishes,
        createWish,
        deleteWish
    }
}
