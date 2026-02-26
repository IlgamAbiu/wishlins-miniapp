import { onMounted, onUnmounted, watch } from 'vue'
import { navigationStore } from '@/stores/navigation.store'
import { useWishes } from '@/composables/useWishes'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'

export function useNativeNavigation() {
    const { webapp, backButton, settingsButton, closeButton } = useTelegramWebApp()
    const { selectedWish } = useWishes()

    function handlePopState(event: PopStateEvent) {
        // Only trigger our app-level closing logic if Telegram WebApp hasn't already closed
        // Actually, popstate happens *before* app closing normally.

        const state = event.state

        // If we are popping back from a wish detail
        if (selectedWish.value && (!state || state.type !== 'wish')) {
            // Close the wish detail view
            selectedWish.value = null
        }

        // If we are popping back from a friend's profile
        if (navigationStore.state.selectedFriendId && (!state || state.type !== 'friend')) {
            navigationStore.closeFriendProfile()
        }
    }

    // Master controller for Telegram Buttons based on state
    function updateTelegramButtons() {
        if (!webapp.value) return

        // 1. Reset all buttons
        backButton.value.hide()
        backButton.value.offClick(handleNativeBackClick)
        settingsButton.value.hide()

        if (closeButton.value) {
            closeButton.value.hide()
        }

        // Note: Settings onClick is usually handled in ProfileView directly, 
        //   we just hide/show it based on conditions here.

        // 2. Logic for BackButton
        const isWishOpen = !!selectedWish.value
        const isFriendProfileOpen = !!navigationStore.state.selectedFriendId
        const isViewingOwnProfile = navigationStore.state.activeTab === 'profile' && !navigationStore.state.viewedUserId

        if (isWishOpen || isFriendProfileOpen) {
            // We are deeply nested, show BackButton
            backButton.value.show()
            backButton.value.onClick(handleNativeBackClick)
            // Forcefully hide CloseButton again just in case Telegram auto-shows it
            if (closeButton.value) closeButton.value.hide()
        } else if (isViewingOwnProfile) {
            // We are at root of own profile, show Settings Button
            // We only SHOW the button here. The actual `onClick` listener is registered in `ProfileView.vue`
            settingsButton.value.show()
        }
    }

    function handleNativeBackClick() {
        console.log('[useNativeNavigation] Native Back Button Clicked')
        // Trigger generic browser back, popstate will handle the UI updates
        window.history.back()
    }

    onMounted(() => {
        window.addEventListener('popstate', handlePopState)

        // Also listen to raw Telegram event as a fallback if SDK wrapper fails
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('back_button_pressed', handleNativeBackClick)
        }

        // Watch for state changes that dictate button visibility
        watch(
            [
                () => selectedWish.value,
                () => navigationStore.state.selectedFriendId,
                () => navigationStore.state.activeTab,
                () => navigationStore.state.viewedUserId
            ],
            updateTelegramButtons,
            { immediate: true }
        )
    })

    onUnmounted(() => {
        window.removeEventListener('popstate', handlePopState)
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.offEvent('back_button_pressed', handleNativeBackClick)
        }
    })
}
