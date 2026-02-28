/**
 * Vue Router configuration for the Wishlist Mini App.
 *
 * Route hierarchy:
 * /wishes                              ← Tab 1: Мои желания
 * /wishes/:wishId                      ← Детальное желание (Level 2)
 * /friends                             ← Tab 2: Друзья
 * /friends/:friendId                   ← Профиль друга (Level 2)
 * /friends/:friendId/wishes/:wishId    ← Желание друга (Level 3)
 * /ideas                               ← Tab 3: Идеи
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const TabLayout = () => import('@/layouts/TabLayout.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const FriendsView = () => import('@/views/FriendsView.vue')
const SearchView = () => import('@/views/SearchView.vue')
const WishDetailView = () => import('@/views/WishDetailView.vue')

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/wishes',
    },
    // === Tab routes (with TabBar visible) ===
    {
        path: '/wishes',
        component: TabLayout,
        children: [
            {
                path: '',
                name: 'wishes',
                component: ProfileView,
                meta: { tab: 'profile' },
            },
        ],
    },
    {
        path: '/friends',
        component: TabLayout,
        children: [
            {
                path: '',
                name: 'friends',
                component: FriendsView,
                meta: { tab: 'friends' },
            },
        ],
    },
    {
        path: '/ideas',
        component: TabLayout,
        children: [
            {
                path: '',
                name: 'ideas',
                component: SearchView,
                meta: { tab: 'search' },
            },
        ],
    },

    // === Nested screens (no TabBar, Telegram BackButton visible) ===
    {
        path: '/wishes/:wishId',
        name: 'wish-detail',
        component: WishDetailView,
        meta: { level: 2 },
    },
    {
        path: '/friends/:friendId',
        name: 'friend-profile',
        component: ProfileView,
        props: true,
        meta: { level: 2 },
    },
    {
        path: '/friends/:friendId/wishes/:wishId',
        name: 'friend-wish-detail',
        component: WishDetailView,
        meta: { level: 3 },
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

// ─── Telegram BackButton Integration ────────────────────────────────────────

let backButtonHandler: (() => void) | null = null

router.afterEach((to) => {
    const wa = window.Telegram?.WebApp
    if (!wa) return

    const level = (to.meta.level as number) || 0
    const isNested = level >= 2

    // Clean up previous handler
    if (backButtonHandler) {
        wa.BackButton.offClick(backButtonHandler)
        backButtonHandler = null
    }

    if (isNested) {
        backButtonHandler = () => {
            router.back()
        }
        wa.BackButton.onClick(backButtonHandler)
        wa.BackButton.show()
    } else {
        wa.BackButton.hide()
    }
})

export default router
