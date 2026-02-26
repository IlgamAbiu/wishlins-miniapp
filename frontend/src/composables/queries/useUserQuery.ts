import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { userApi } from '@/api/user'
import { useToast } from '@/composables/useToast'
import { subscribeVersion } from '@/composables/useUser'

export function useUserQuery(telegramId: number, currentUserId?: number) {
    return useQuery({
        queryKey: ['user', telegramId, { currentUserId }],
        queryFn: () => userApi.getByTelegramId(telegramId, currentUserId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error.message === 'NOT_FOUND') return false
            return failureCount < 3
        }
    })
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: ({ telegramId, profileText }: { telegramId: number, profileText: string }) =>
            userApi.updateProfile(telegramId, { profile_text: profileText }),
        onSuccess: (data, variables) => {
            // Update specific user data
            queryClient.setQueryData(['user', variables.telegramId, { currentUserId: variables.telegramId }], data)
            queryClient.setQueryData(['user', variables.telegramId, { currentUserId: undefined }], data)
            queryClient.invalidateQueries({ queryKey: ['user', variables.telegramId] })
            toast.success('Профиль обновлен')
        },
        onError: (error: Error) => {
            toast.error(`Ошибка: ${error.message}`)
        }
    })
}

export function useSubscriptionMutation() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: ({ currentUserId, targetTelegramId, action }: {
            currentUserId: number,
            targetTelegramId: number,
            action: 'subscribe' | 'unsubscribe'
        }) => {
            return action === 'subscribe'
                ? userApi.subscribe(currentUserId, targetTelegramId)
                : userApi.unsubscribe(currentUserId, targetTelegramId)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user', variables.targetTelegramId] })
            subscribeVersion.value++
            toast.success(variables.action === 'subscribe' ? 'Вы подписались' : 'Вы отписались')
        },
        onError: (error: Error) => {
            toast.error(`Ошибка: ${error.message}`)
        }
    })
}
