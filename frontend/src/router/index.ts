import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { showTabBar: true, keepAlive: true, level: 1, stackBase: true }
    },
    {
        path: '/friends',
        name: 'friends',
        component: () => import('@/views/FriendsView.vue'),
        meta: { showTabBar: true, keepAlive: true, level: 1, stackBase: true }
    },
    {
        path: '/search',
        name: 'search',
        component: () => import('@/views/SearchView.vue'),
        meta: { showTabBar: true, keepAlive: true, level: 1, stackBase: true }
    },
    {
        path: '/profile/:id',
        name: 'user-profile',
        component: () => import('@/views/ProfileView.vue'),
        props: route => ({ userId: Number(route.params.id) }),
        meta: { showTabBar: false, keepAlive: false, level: 2 }
    },
    {
        path: '/wish/:id',
        name: 'wish-detail',
        component: () => import('@/components/WishDetailView.vue'),
        meta: { showTabBar: false, keepAlive: false, level: 2 }
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes
})

// Navigation Guards for Telegram BackButton
router.afterEach((to, from) => {
    const { backButton } = useTelegramWebApp()

    // The exact logic from the architectural diagram:
    // If we're at the root level (level 1) or it's a stackBase, hide back button
    // Otherwise, we are deep in the stack (level > 1), show back button
    const level = (to.meta.level as number) || 1
    const isStackBase = to.meta.stackBase === true

    if (level === 1 || isStackBase) {
        backButton.value.hide()
    } else {
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
