/**
 * Composable for managing wishes.
 */

import { ref } from 'vue'
import type { Wish, CreateWishRequest } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Global State (Selection & Cross-component Events)
const selectedWish = ref<Wish | null>(null)

// Simple Event Bus for list updates
type WishEventType = 'create' | 'update' | 'delete' | 'move' | 'fulfill'
type WishEventCallback = (type: WishEventType, wish?: Wish, id?: string) => void
const listeners = new Set<WishEventCallback>()

function emitWishEvent(type: WishEventType, wish?: Wish, id?: string) {
    listeners.forEach(cb => cb(type, wish, id))
}

function onWishUpdate(callback: WishEventCallback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
}

export function useWishes() {
    // Local State (Per component/view)
    const wishes = ref<Wish[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentWishlistId = ref<string | null>(null)

    function openWish(wish: Wish) {
        window.history.pushState({ type: 'wish', id: wish.id }, '')
        selectedWish.value = wish
    }

    // This gets called by PopState when swiping back, OR by the BackButton 
    // Usually closing manually should invoke `history.back()` so the state remains consistent
    function closeWish() {
        selectedWish.value = null
    }

    async function fetchWishes(wishlistId: string, viewerTelegramId?: number): Promise<void> {
        loading.value = true
        error.value = null
        currentWishlistId.value = wishlistId

        try {
            const url = viewerTelegramId
                ? `${API_BASE_URL}/wishes?wishlist_id=${wishlistId}&viewer_telegram_id=${viewerTelegramId}`
                : `${API_BASE_URL}/wishes?wishlist_id=${wishlistId}`
            const response = await fetch(url)

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

            // Emit event for other listeners
            emitWishEvent('create', newWish)

            // Local update (if matches context)
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

            emitWishEvent('delete', undefined, wishId)

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

            emitWishEvent('update', updated)

            const index = wishes.value.findIndex(w => w.id === wishId)

            // Smart list update logic...
            // (Reusing existing logic but now operating on local 'wishes' ref)
            if (currentWishlistId.value && updated.wishlist_id !== currentWishlistId.value) {
                if (index !== -1) wishes.value.splice(index, 1)
            } else if (currentWishlistId.value && updated.wishlist_id === currentWishlistId.value) {
                if (index !== -1) {
                    wishes.value[index] = updated
                } else {
                    wishes.value.unshift(updated)
                }
            } else {
                if (index !== -1) wishes.value[index] = updated
            }

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

    // Optimized moveWishesToWishlist with batching (max 5 simultaneous requests)
    async function moveWishesToWishlist(
        fromWishlistId: string,
        toWishlistId: string,
        telegramId: number
    ): Promise<boolean> {
        loading.value = true
        try {
            // 1. Fetch wishes to move
            const response = await fetch(`${API_BASE_URL}/wishes?wishlist_id=${fromWishlistId}`)
            if (!response.ok) throw new Error('Failed to fetch wishes')
            const wishesToMove: Wish[] = await response.json()

            // 2. Batch update - max 5 simultaneous requests to avoid overload
            const BATCH_SIZE = 5
            for (let i = 0; i < wishesToMove.length; i += BATCH_SIZE) {
                const batch = wishesToMove.slice(i, i + BATCH_SIZE)
                const batchPromises = batch.map(wish =>
                    fetch(`${API_BASE_URL}/wishes/${wish.id}?telegram_id=${telegramId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wishlist_id: toWishlistId }),
                    })
                )
                const results = await Promise.all(batchPromises)
                if (results.some(r => !r.ok)) throw new Error('Failed to move some wishes')
            }

            emitWishEvent('move')

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
            emitWishEvent('fulfill', updated)

            const index = wishes.value.findIndex(w => w.id === wishId)
            // ... Logic ...
            if (currentWishlistId.value && updated.wishlist_id !== currentWishlistId.value) {
                if (index !== -1) wishes.value.splice(index, 1)
            } else {
                if (index !== -1) wishes.value[index] = updated
            }

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

    async function bookWish(wishId: string, telegramId: number): Promise<Wish | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}/book?telegram_id=${telegramId}`, {
                method: 'POST',
            })
            if (!response.ok) throw new Error('Failed to book wish')
            const updated: Wish = await response.json()
            emitWishEvent('update', updated)
            const index = wishes.value.findIndex(w => w.id === wishId)
            if (index !== -1) wishes.value[index] = updated
            if (selectedWish.value?.id === wishId) selectedWish.value = updated
            return updated
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to book wish'
            return null
        }
    }

    async function unbookWish(wishId: string, telegramId: number): Promise<Wish | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/wishes/${wishId}/book?telegram_id=${telegramId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to unbook wish')
            const updated: Wish = await response.json()
            emitWishEvent('update', updated)
            const index = wishes.value.findIndex(w => w.id === wishId)
            if (index !== -1) wishes.value[index] = updated
            if (selectedWish.value?.id === wishId) selectedWish.value = updated
            return updated
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to unbook wish'
            return null
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
        bookWish,
        unbookWish,
        openWish,
        closeWish,
        onWishUpdate // Export this
    }
}
