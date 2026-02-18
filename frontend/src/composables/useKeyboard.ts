import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboard() {
    const isKeyboardOpen = ref(false)
    const keyboardHeight = ref(0)

    // Original viewport height to compare against
    let originalHeight = window.innerHeight

    function handleResize() {
        if (!window.visualViewport) return

        const currentHeight = window.visualViewport.height
        // If viewport is significantly smaller (e.g., > 20% diff), assume keyboard is open
        // This threshold prevents false positives from small browser chrome changes
        const diff = originalHeight - currentHeight

        if (diff > 150) { // 150px is a safe bet for closest keyboard height check
            isKeyboardOpen.value = true
            keyboardHeight.value = diff
        } else {
            isKeyboardOpen.value = false
            keyboardHeight.value = 0
        }
    }

    // Fallback resize handler for older browsers
    function handleResizeFallback() {
        const currentHeight = window.innerHeight
        const diff = originalHeight - currentHeight
        if (diff > 150) {
            isKeyboardOpen.value = true
            keyboardHeight.value = diff
        } else {
            isKeyboardOpen.value = false
            keyboardHeight.value = 0
        }
    }

    // Also listen to focusin/focusout as a backup/helper
    // Note: focusin doesn't guarantee keyboard, but it's a strong signal on mobile
    function handleFocusIn(e: FocusEvent) {
        const target = e.target as HTMLElement
        if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
            // We rely on resize mostly, but this can help sets state early
        }
    }

    onMounted(() => {
        // Modern browsers support visualViewport
        if (window.visualViewport) {
            originalHeight = window.visualViewport.height
            window.visualViewport.addEventListener('resize', handleResize)
        } else {
            // Fallback for older browsers (unlikely needed for Telegram Webview but good practice)
            window.addEventListener('resize', handleResizeFallback)
        }
    })

    onUnmounted(() => {
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', handleResize)
        } else {
            window.removeEventListener('resize', handleResizeFallback)
        }
    })

    return {
        isKeyboardOpen,
        keyboardHeight
    }
}
