import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { showTabBar: true, keepAlive: true }
    },
    {
        path: '/friends',
        name: 'friends',
        component: () => import('@/views/FriendsView.vue'),
        meta: { showTabBar: true, keepAlive: true }
    },
    {
        path: '/search',
        name: 'search',
        component: () => import('@/views/SearchView.vue'),
        meta: { showTabBar: true, keepAlive: true }
    },
    {
        path: '/profile/:id',
        name: 'user-profile',
        component: () => import('@/views/ProfileView.vue'),
        props: route => ({ userId: Number(route.params.id) }),
        meta: { showTabBar: false, keepAlive: false }
    },
    {
        path: '/wish/:id',
        name: 'wish-detail',
        component: () => import('@/components/WishDetailView.vue'),
        meta: { showTabBar: false, keepAlive: false }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Navigation Guards for Telegram BackButton
router.afterEach((to, from) => {
    const { backButton } = useTelegramWebApp()

    if (to.meta.showTabBar) {
        // We are on a main tab, hide the back button
        backButton.value.hide()
    } else {
        // We are deep in the app (e.g. wish detail), show back button
        backButton.value.show()
    }
})

// Setup global click handler for BackButton to trigger router.back()
let isBackButtonConfigured = false

export function setupTelegramBackButton(routerInstance: any) {
    if (isBackButtonConfigured) return

    const { backButton } = useTelegramWebApp()

    backButton.value.onClick(() => {
        // If there's nowhere to go back to natively, push to profile
        if (window.history.length <= 1) {
            routerInstance.push('/')
        } else {
            routerInstance.back()
        }
    })

    isBackButtonConfigured = true
}

export default router
