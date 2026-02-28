/**
 * Composable for Telegram BackButton management.
 * Auto-cleanup on component unmount.
 *
 * Usage:
 *   const { show, hide } = useTelegramBackButton(() => router.back())
 */

import { onUnmounted } from 'vue'
import { useTelegramWebApp } from './useTelegramWebApp'

export function useTelegramBackButton(handler?: () => void) {
    const { webapp } = useTelegramWebApp()

    let currentHandler: (() => void) | null = null

    function show(onClick?: () => void) {
        const bb = webapp.value?.BackButton
        if (!bb) return

        // Remove previous handler
        if (currentHandler) {
            bb.offClick(currentHandler)
        }

        currentHandler = onClick || handler || null
        if (currentHandler) {
            bb.onClick(currentHandler)
        }
        bb.show()
    }

    function hide() {
        const bb = webapp.value?.BackButton
        if (!bb) return

        if (currentHandler) {
            bb.offClick(currentHandler)
            currentHandler = null
        }
        bb.hide()
    }

    // Auto-cleanup
    onUnmounted(() => {
        hide()
    })

    return { show, hide }
}
