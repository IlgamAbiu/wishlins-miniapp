import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { wishesApi } from '@/api/wishes'
import { useToast } from '@/composables/useToast'

export function useWishlistsQuery(telegramId: number | undefined) {
    return useQuery({
        queryKey: ['wishlists', telegramId],
        queryFn: () => wishesApi.getWishlists(telegramId as number),
        enabled: !!telegramId,
        staleTime: 1000 * 60 * 5,
    })
}

export function useWishesQuery(wishlistId: string | null, currentUserId?: number) {
    return useQuery({
        queryKey: ['wishes', wishlistId, { currentUserId }],
        queryFn: () => wishlistId ? wishesApi.getWishes(wishlistId, currentUserId) : Promise.resolve([]),
        enabled: !!wishlistId,
        staleTime: 1000 * 60 * 2,
    })
}

export function useWishDetailQuery(wishId: string | undefined, currentUserId?: number) {
    return useQuery({
        queryKey: ['wish', wishId, { currentUserId }],
        queryFn: () => wishesApi.getWish(wishId as string, currentUserId),
        enabled: !!wishId,
        staleTime: 1000 * 60 * 5,
    })
}

export function useWishActionMutation() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: ({ wishId, action, telegramId }: {
            wishId: string,
            action: 'book' | 'unbook' | 'fulfill' | 'archive' | 'unarchive',
            telegramId: number
        }) => {
            switch (action) {
                case 'book': return wishesApi.bookWish(wishId, telegramId)
                case 'unbook': return wishesApi.unbookWish(wishId, telegramId)
                case 'fulfill': return wishesApi.fulfillWish(wishId, telegramId)
                case 'archive': return wishesApi.archiveWish(wishId, telegramId)
                case 'unarchive': return wishesApi.unarchiveWish(wishId, telegramId)
            }
        },
        onSuccess: (data, variables) => {
            // Update individual wish cache
            queryClient.setQueryData(['wish', variables.wishId, { currentUserId: variables.telegramId }], data)
            // Invalidate the list to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['wishes'] })

            const messages = {
                book: 'Забронировано',
                unbook: 'Бронь снята',
                fulfill: 'Желание исполнено! ✨',
                archive: 'Перенесено в архив',
                unarchive: 'Восстановлено из архива'
            }
            toast.success(messages[variables.action])
        },
        onError: (error: Error) => {
            toast.error(`Ошибка: ${error.message}`)
        }
    })
}
