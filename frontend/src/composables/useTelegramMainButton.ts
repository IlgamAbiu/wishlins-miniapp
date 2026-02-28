/**
 * Composable for Telegram MainButton management.
 * Automatically hides the button on component unmount.
 *
 * Usage:
 *   const { show, hide, setLoading, setText } = useTelegramMainButton()
 *   show('Добавить желание', handleSubmit)
 */

import { onUnmounted } from 'vue'
import { useTelegramWebApp } from './useTelegramWebApp'

export function useTelegramMainButton() {
    const { webapp } = useTelegramWebApp()

    let currentHandler: (() => void) | null = null

    function show(text: string, onClick: () => void) {
        const mb = webapp.value?.MainButton
        if (!mb) return

        // Remove previous handler
        if (currentHandler) {
            mb.offClick(currentHandler)
        }

        currentHandler = onClick
        mb.setText(text)
        mb.onClick(currentHandler)
        mb.enable()
        mb.show()
    }

    function hide() {
        const mb = webapp.value?.MainButton
        if (!mb) return

        if (currentHandler) {
            mb.offClick(currentHandler)
            currentHandler = null
        }
        mb.hide()
    }

    function setText(text: string) {
        webapp.value?.MainButton?.setText(text)
    }

    function setLoading(loading: boolean) {
        const mb = webapp.value?.MainButton
        if (!mb) return

        if (loading) {
            mb.showProgress(true)
            mb.disable()
        } else {
            mb.hideProgress()
            mb.enable()
        }
    }

    function disable() {
        webapp.value?.MainButton?.disable()
    }

    function enable() {
        webapp.value?.MainButton?.enable()
    }

    // Auto-cleanup
    onUnmounted(() => {
        hide()
    })

    return { show, hide, setText, setLoading, disable, enable }
}
