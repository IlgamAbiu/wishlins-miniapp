import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
    const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
        const id = nextId++
        const toast: Toast = { id, message, type, duration }

        toasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        // Trigger haptic if available
        if (window.Telegram?.WebApp?.HapticFeedback) {
            const haptic = window.Telegram.WebApp.HapticFeedback
            if (type === 'success') haptic.notificationOccurred('success')
            else if (type === 'error') haptic.notificationOccurred('error')
            else if (type === 'warning') haptic.notificationOccurred('warning')
            else haptic.impactOccurred('light')
        }
    }

    const removeToast = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    return {
        toasts,
        showToast,
        removeToast,
        success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
        error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
        info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
        warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
    }
}
