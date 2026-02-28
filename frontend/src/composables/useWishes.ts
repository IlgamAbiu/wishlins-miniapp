/**
 * Composable for managing wishes.
 * Uses centralized API client.
 */

import { ref } from 'vue'
import { api } from '@/services/api'
import type { Wish, CreateWishRequest } from '@/types'

// ─── Global State ───────────────────────────────────────────────────────────

const selectedWish = ref<Wish | null>(null)

// Simple Event Bus for cross-component list updates
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

// ─── Composable ─────────────────────────────────────────────────────────────

export function useWishes() {
    const wishes = ref<Wish[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentWishlistId = ref<string | null>(null)

    function openWish(wish: Wish) {
        selectedWish.value = wish
    }

    function closeWish() {
        selectedWish.value = null
    }

    async function fetchWishes(wishlistId: string, viewerTelegramId?: number): Promise<void> {
        loading.value = true
        error.value = null
        currentWishlistId.value = wishlistId

        try {
            const query = viewerTelegramId
                ? `/wishes?wishlist_id=${wishlistId}&viewer_telegram_id=${viewerTelegramId}`
                : `/wishes?wishlist_id=${wishlistId}`
            wishes.value = await api.get<Wish[]>(query)
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
            const newWish = await api.post<Wish>(`/wishes?telegram_id=${telegramId}`, wish)
            emitWishEvent('create', newWish)

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
            await api.delete(`/wishes/${wishId}?telegram_id=${telegramId}`)
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
        loading.value = true
        try {
            const updated = await api.put<Wish>(`/wishes/${wishId}?telegram_id=${telegramId}`, wish)
            emitWishEvent('update', updated)

            const index = wishes.value.findIndex(w => w.id === wishId)

            // Smart list update: handle wishlist moves
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

            if (selectedWish.value?.id === wishId) {
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
            const wishesToMove = await api.get<Wish[]>(`/wishes?wishlist_id=${fromWishlistId}`)

            // Batch update — max 5 simultaneous
            const BATCH_SIZE = 5
            for (let i = 0; i < wishesToMove.length; i += BATCH_SIZE) {
                const batch = wishesToMove.slice(i, i + BATCH_SIZE)
                await Promise.all(
                    batch.map(wish =>
                        api.put(`/wishes/${wish.id}?telegram_id=${telegramId}`, { wishlist_id: toWishlistId })
                    )
                )
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
            const updated = await api.post<Wish>(`/wishes/${wishId}/fulfill?telegram_id=${telegramId}`)
            emitWishEvent('fulfill', updated)

            const index = wishes.value.findIndex(w => w.id === wishId)
            if (currentWishlistId.value && updated.wishlist_id !== currentWishlistId.value) {
                if (index !== -1) wishes.value.splice(index, 1)
            } else {
                if (index !== -1) wishes.value[index] = updated
            }

            if (selectedWish.value?.id === wishId) {
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
            const updated = await api.post<Wish>(`/wishes/${wishId}/book?telegram_id=${telegramId}`)
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
            const updated = await api.delete<Wish>(`/wishes/${wishId}/book?telegram_id=${telegramId}`)
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
        onWishUpdate,
    }
}
