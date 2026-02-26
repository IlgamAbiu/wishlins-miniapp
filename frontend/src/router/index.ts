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

    // Manage BackButton visibility as early as possible
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        if (to.meta.isNested) {
            tg.BackButton.show()
        } else {
            tg.BackButton.hide()
        }
    }

    // Determine transition direction
    const toDepth = to.path.split('/').filter(Boolean).length
    const fromDepth = from.path.split('/').filter(Boolean).length

    // Tab indices for comparison
    const toTabIndex = to.meta.tabIndex as number
    const fromTabIndex = from.meta.tabIndex as number

    if (toTabIndex !== undefined && fromTabIndex !== undefined && toDepth === 1 && fromDepth === 1) {
        // Switching between main tabs
        to.meta.transitionName = 'fade'
    } else if (toDepth > fromDepth) {
        // Going deeper
        to.meta.transitionName = 'slide-left'
    } else if (toDepth < fromDepth) {
        // Going back
        to.meta.transitionName = 'slide-right'
    } else {
        // Same level, different path
        to.meta.transitionName = 'fade'
    }

    next()
})

router.afterEach((to) => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        // Force hide close button
        if (tg.CloseButton) tg.CloseButton.hide()
    }
})

export default router
