import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'

// Define routes matching the tab structure and nested views
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/profile'
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { tabIndex: 0, requireTabBar: true }
    },
    {
        path: '/profile/wishes/:id',
        name: 'MyWishDetail',
        component: () => import('@/components/WishDetailView.vue'),
        meta: { requireTabBar: false, isNested: true }
    },
    {
        path: '/friends',
        name: 'Friends',
        component: () => import('@/views/FriendsView.vue'),
        meta: { tabIndex: 1, requireTabBar: true }
    },
    {
        path: '/friends/:friendId',
        name: 'FriendProfile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { requireTabBar: false, isNested: true },
        props: true
    },
    {
        path: '/friends/:friendId/wishes/:id',
        name: 'FriendWishDetail',
        component: () => import('@/components/WishDetailView.vue'),
        meta: { requireTabBar: false, isNested: true }
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/SearchView.vue'),
        meta: { tabIndex: 2, requireTabBar: true }
    },
    {
        // Catch all 404
        path: '/:pathMatch(.*)*',
        redirect: '/profile'
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// --- Native Telegram Navigation Handling ---

// 1. Setup the global BackButton listener ONCE
let isBackListenerRegistered = false

function initTelegramBackButton() {
    if (isBackListenerRegistered) return

    const { isAvailable, webapp } = useTelegramWebApp()

    // Need to wait until webapp is actually ready, but router starts immediately.
    // We'll rely on the global `window.Telegram` object directly here to ensure it binds correctly
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp

        // The handler simply tells Vue Router to go back
        const handleNativeBack = () => {
            router.back()
        }

        tg.onEvent('back_button_pressed', handleNativeBack)

        // As a fallback, also bind to the onClick method
        if (tg.BackButton) {
            tg.BackButton.onClick(handleNativeBack)
        }

        isBackListenerRegistered = true
    }
}

// 2. Navigation Guards
router.beforeEach((to, from, next) => {
    // Try to initialize Telegram back button event if not done yet
    initTelegramBackButton()

    // Determine transition direction based on route depth or path hierarchy
    // We'll use a simple heuristic: if 'to' is nested deeper than 'from', it's push (slide-left)
    // If 'to' is shallower, it's pop (slide-right)
    // For tab switching (depth 1 to depth 1), we can use fade or no animation

    const toDepth = to.path.split('/').filter(Boolean).length
    const fromDepth = from.path.split('/').filter(Boolean).length

    if (toDepth > fromDepth) {
        to.meta.transitionName = 'slide-left'
    } else if (toDepth < fromDepth) {
        to.meta.transitionName = 'slide-right'
    } else {
        // Tab switching or same level
        const toTabIndex = to.meta.tabIndex as number
        const fromTabIndex = from.meta.tabIndex as number

        if (toTabIndex !== undefined && fromTabIndex !== undefined) {
            to.meta.transitionName = 'fade' // Or you could do slide based on tab index comparison
        } else {
            to.meta.transitionName = 'fade'
        }
    }

    next()
})

router.afterEach((to) => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp

        // Force hide close button to prevent Telegram from replacing the Back button automatically
        if (tg.CloseButton) tg.CloseButton.hide()

        if (to.meta.isNested) {
            // We are in a nested route, show Back button
            tg.BackButton.show()
        } else {
            // We are at a root tab level, hide Back button
            tg.BackButton.hide()
        }
    }
})

export default router
