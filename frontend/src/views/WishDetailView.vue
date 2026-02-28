<script setup lang="ts">
/**
 * WishDetailView (View)
 * Full-screen view for individual wish details.
 * Moved from components/ to views/ — this is a full-screen routed view.
 *
 * Telegram integrations:
 * - BackButton managed by router guard
 * - showConfirm() replaces confirm()
 * - showAlert() replaces alert()
 * - HapticFeedback on fulfill, book, delete
 */
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWishes } from '@/composables/useWishes'
import { useWishlists } from '@/composables/useWishlists'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useUser } from '@/composables/useUser'
import { useHaptic } from '@/composables/useHaptic'
import type { Wish } from '@/types'
import AddWishModal from '@/components/AddWishModal.vue'

const router = useRouter()

const { selectedWish, closeWish, updateWish, deleteWish, fulfillWish, bookWish, unbookWish } = useWishes()
const { wishlists, fetchWishlists } = useWishlists()
const { user, showConfirm, showAlert } = useTelegramWebApp()
const { getUserByTelegramId } = useUser()
const { impact, notification } = useHaptic()

const showEditModal = ref(false)
const internalUserId = ref<string | null>(null)
const loadingOwnership = ref(true)

// Fetch internal user ID for ownership check
onMounted(async () => {
    if (user.value) {
        const internalUser = await getUserByTelegramId(user.value.id)
        if (internalUser) {
            internalUserId.value = internalUser.id
            await fetchWishlists(user.value.id)
        }
        loadingOwnership.value = false
    }
})

const wish = computed(() => selectedWish.value)
const safeWish = computed<Wish>(() => wish.value as Wish)

const formattedPrice = computed(() => {
  if (!safeWish.value.price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeWish.value.currency || 'USD',
    maximumFractionDigits: 0
  }).format(safeWish.value.price)
})

const isOwner = computed(() => {
    if (!internalUserId.value || !safeWish.value) return false
    const wishlist = wishlists.value.find(w => w.id === safeWish.value.wishlist_id)
    if (wishlist) {
        return wishlist.user_id === internalUserId.value
    }
    return false
})

const isFulfilled = computed(() => {
    const wishlist = wishlists.value.find(w => w.id === safeWish.value.wishlist_id)
    return wishlist?.title === 'Сбывшиеся мечты'
})

const isBookedByMe = computed(() => safeWish.value?.booked_by_me ?? false)

const isClosing = ref(false)

function handleBack() {
  if (isClosing.value) return
  isClosing.value = true
  router.back()
  setTimeout(() => { isClosing.value = false }, 400)
}

function handleEdit() {
 showEditModal.value = true
}

function handleShare() {
    console.log('Share wish', safeWish.value.id)
}

function handleStoreLink() {
    if (safeWish.value.link) {
        window.open(safeWish.value.link, '_blank')
    } else {
        showAlert('Здесь может быть ссылка на магазин, но пока ее нет')
    }
}

async function handleFulfill() {
    if (!user.value || !safeWish.value) return

    try {
        const updated = await fulfillWish(safeWish.value.id, user.value.id)
        if (!updated) {
            await showAlert('Не удалось выполнить желание. Попробуйте еще раз.')
            return
        }
        notification('success')
        impact('medium')
        await fetchWishlists(user.value.id)
        await nextTick()
    } catch (err) {
        console.error('Error fulfilling wish:', err)
        await showAlert('Произошла ошибка при выполнении желания')
    }
}

async function handleRestore() {
    if (!user.value || !safeWish.value) return

    const confirmed = await showConfirm('Вернуть желание из архива в общий список?')
    if (!confirmed) return

    const defaultWishlist = wishlists.value.find(w => w.is_default)
    if (!defaultWishlist) {
        await showAlert('Не удалось найти список по умолчанию')
        return
    }

    try {
        const updated = await updateWish(
            safeWish.value.id,
            {
                title: safeWish.value.title,
                subtitle: safeWish.value.subtitle ?? undefined,
                description: safeWish.value.description ?? undefined,
                link: safeWish.value.link ?? undefined,
                image_url: safeWish.value.image_url ?? undefined,
                price: safeWish.value.price ?? undefined,
                currency: safeWish.value.currency ?? undefined,
                priority: safeWish.value.priority,
                store: safeWish.value.store ?? undefined,
                wishlist_id: defaultWishlist.id
            },
            user.value.id
        )

        if (!updated) {
            await showAlert('Не удалось переместить желание. Попробуйте еще раз.')
            return
        }

        notification('success')
        await fetchWishlists(user.value.id)
        await nextTick()

        if (selectedWish.value && selectedWish.value.id === updated.id) {
            selectedWish.value = { ...updated }
        }
    } catch (err) {
        console.error('Error restoring wish:', err)
        await showAlert('Произошла ошибка при возврате желания из архива')
    }
}

async function handleBook() {
    if (!user.value || !safeWish.value) return

    if (safeWish.value.is_booked && !isBookedByMe.value) return

    if (isBookedByMe.value) {
        const confirmed = await showConfirm('Отменить бронирование?')
        if (!confirmed) return
        const updated = await unbookWish(safeWish.value.id, user.value.id)
        if (updated) impact('light')
    } else {
        const updated = await bookWish(safeWish.value.id, user.value.id)
        if (updated) {
            notification('success')
            impact('medium')
        }
    }
}

async function handleUpdateWish(data: any) {
    if (!user.value || !safeWish.value) return
    const { id, ...updateData } = data

    const updated = await updateWish(safeWish.value.id, updateData, user.value.id)
    if (updated) {
        showEditModal.value = false
        notification('success')
    }
}

async function handleDeleteWish(id: string) {
    if (!user.value) return
    impact('medium')
    const success = await deleteWish(id, user.value.id)
    if (success) {
        showEditModal.value = false
        router.back()
    }
}
</script>

<template>
  <div v-if="wish" class="wish-detail-view">
    <!-- Ambient Background Effects -->
    <div class="ambient-background">
        <div class="halo"></div>
        <div class="blur-circle"></div>
    </div>

    <!-- Fixed Image Layer -->
    <div class="image-layer">
        <div class="image-container-wrapper">
            <div class="liquid-bg"></div>
            <div class="liquid-container">
                <div class="glass-shine"></div>
                <img
                    v-if="safeWish.image_url"
                    :src="safeWish.image_url"
                    :alt="safeWish.title"
                    class="product-image"
                />
                <div v-else class="placeholder">
                    <div class="placeholder-content">
                        <span class="material-symbols-outlined placeholder-icon">image</span>
                    </div>
                </div>
            </div>

            <!-- Priority Badge -->
            <div v-if="safeWish.priority === 'really_want'" class="floating-badge">
                <div class="badge-content">
                    <div class="amber-glow"></div>
                    <div class="amber-dot"></div>
                    <span class="badge-text">ОЧЕНЬ ХОЧУ</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="scroll-container">
        <div class="spacer-top"></div>
        <section class="glass-panel">
            <div class="handle-bar"></div>
            <div class="panel-content">
                <h1 class="title">{{ safeWish.title }}</h1>

                <div class="info-row">
                    <div class="subtitle-container">
                        <p v-if="safeWish.subtitle" class="short-description">
                            {{ safeWish.subtitle }}
                        </p>
                        <p v-else class="short-description placeholder-text">
                            Здесь может быть короткое описание или название магазина
                        </p>
                    </div>
                    <div v-if="safeWish.price" class="price-tag">
                        <span class="price-text">{{ formattedPrice }}</span>
                    </div>
                    <div v-else class="price-tag placeholder-price">
                        <span class="price-text">∞ $ € ₽</span>
                    </div>
                </div>

                <div class="long-description-container">
                     <p v-if="safeWish.description" class="long-description">
                        {{ safeWish.description }}
                    </p>
                    <p v-else class="long-description placeholder-text">
                        Здесь может быть полное описание вашего желания, никаких ограничений на символы
                    </p>
                </div>
            </div>
        </section>
        <div class="spacer-bottom"></div>
    </div>

    <!-- Floating Actions -->
    <div class="floating-actions">
        <button @click="handleStoreLink" class="primary-btn">
            <span class="btn-text">Где купить</span>
            <span class="material-symbols-outlined btn-icon">arrow_outward</span>
        </button>

        <div v-if="loadingOwnership" class="skeleton-btn"></div>

        <!-- Owner: Fulfill -->
        <button v-else-if="isOwner && !isFulfilled" @click="handleFulfill" class="fulfill-btn">
            <span class="btn-text">Исполнено</span>
            <span class="material-symbols-outlined btn-icon">check_circle</span>
        </button>

        <!-- Owner: Archive -->
        <button v-else-if="isOwner && isFulfilled" @click="handleRestore" class="archive-btn">
            <span class="btn-text">В архиве</span>
            <span class="material-symbols-outlined btn-icon">archive</span>
        </button>

        <!-- Non-owner: booked by someone else -->
        <button v-else-if="safeWish.is_booked && !isBookedByMe" class="book-btn book-btn--taken" disabled>
            <span class="btn-text">🔒 Занято</span>
        </button>

        <!-- Non-owner: I already booked -->
        <button v-else-if="isBookedByMe" @click="handleBook" class="book-btn book-btn--mine">
            <span class="btn-text">🎁 Я уже дарю</span>
        </button>

        <!-- Non-owner: available to book -->
        <button v-else @click="handleBook" class="book-btn">
            <span class="btn-text">Забронировать</span>
        </button>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="header-spacer"></div>
        <div class="header-actions">
            <button @click="handleShare" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">ios_share</span>
            </button>
            <button v-if="isOwner" @click="handleEdit" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">edit</span>
            </button>
        </div>
    </header>

    <!-- Gloss Overlays -->
    <div class="gloss-top"></div>
    <div class="gloss-bottom"></div>

    <!-- Edit Modal -->
    <Teleport to="body">
        <AddWishModal
            v-if="showEditModal"
            :initial-wish="safeWish"
            @close="showEditModal = false"
            @submit="handleUpdateWish"
            @delete="handleDeleteWish"
        />
    </Teleport>
  </div>
</template>

<style scoped>
/* Reset & Base */
.wish-detail-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    background: radial-gradient(circle at 0% 0%, var(--aurora-bg-1) 0%, var(--aurora-bg-2) 50%, var(--aurora-bg-3) 100%);
    color: var(--tg-text-color);
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
}

[data-theme='dark'] .wish-detail-view {
    background: radial-gradient(circle at 50% 0%, var(--aurora-bg-1) 0%, var(--aurora-bg-2) 60%, var(--aurora-bg-3) 100%);
}

/* Ambient Background */
.ambient-background { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

.halo {
    position: absolute; top: -20%; left: -20%; width: 140%; height: 80%;
    background: radial-gradient(circle at 50% 30%, rgba(10, 13, 194, 0.4), transparent 60%);
    filter: blur(60px); opacity: 0.7; will-change: transform;
}

.blur-circle {
    position: absolute; bottom: -10%; right: -10%; width: 80%; height: 60%;
    background: rgba(88, 28, 135, 0.3); filter: blur(60px); border-radius: 50%; will-change: transform;
}

/* Fixed Header */
.header {
    position: absolute; top: 0; left: 0; width: 100%;
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px; padding-top: calc(20px + env(safe-area-inset-top, 0px));
    z-index: 70; pointer-events: auto;
}
.header button { pointer-events: auto; position: relative; z-index: 1; }
.header-actions { display: flex; gap: 12px; pointer-events: auto; }
.header-spacer { flex: 1; }

/* Glass Buttons */
.glass-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease; cursor: pointer;
    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.3);
}
.glass-btn:active { background: rgba(255, 255, 255, 0.15); transform: scale(0.98); }

.icon-btn {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
}
.icon-btn .material-symbols-outlined { color: rgba(255, 255, 255, 0.9); }
[data-theme='light'] .icon-btn .material-symbols-outlined { color: #333; }
[data-theme='light'] .glass-btn {
    background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); color: #333;
}

/* Image Layer */
.image-layer {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start; padding-top: 100px;
}

.image-container-wrapper {
    position: relative; width: 288px; height: 288px; max-width: 80vw; max-height: 80vw;
}

.liquid-bg {
    position: absolute; inset: 0;
    background: rgba(79, 70, 229, 0.3);
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    filter: blur(20px);
}

.liquid-container {
    position: relative; width: 100%; height: 100%;
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.05);
}

.glass-shine {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%);
    pointer-events: none; z-index: 2; opacity: 0.5;
}

.product-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }

.placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%);
}

.placeholder-content { display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.8; }
.placeholder-icon { font-size: 48px; color: white; }

/* Floating Badge */
.floating-badge {
    position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); z-index: 30;
}

.badge-content {
    position: relative; padding: 8px 24px; border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3), inset 0 0 5px rgba(245, 158, 11, 0.2);
    display: flex; align-items: center; gap: 8px; overflow: hidden;
}

.amber-glow {
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 70%);
    opacity: 0.6;
}

.amber-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
    position: relative; z-index: 1; animation: dot-pulse 2s infinite;
}
@keyframes dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.badge-text {
    position: relative; z-index: 1; font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.9); text-transform: uppercase;
}

/* Scroll Container */
.scroll-container {
    position: absolute; inset: 0; z-index: 10;
    overflow-y: auto; overflow-x: hidden;
    display: flex; flex-direction: column;
    scroll-behavior: smooth; scrollbar-width: none;
}
.scroll-container::-webkit-scrollbar { display: none; }

.spacer-top { flex-shrink: 0; width: 100%; height: 410px; }
.spacer-bottom { width: 100%; height: 140px; flex-shrink: 0; }

/* Glass Info Panel */
.glass-panel {
    align-self: center; width: calc(100% - 32px);
    border-radius: 32px; padding: 24px;
    position: relative; margin-top: 16px;
    backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%);
    background: rgba(30, 30, 45, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
    display: flex; flex-direction: column;
}
[data-theme='light'] .glass-panel {
    background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(255, 255, 255, 0.8);
}

.handle-bar {
    width: 48px; height: 4px; background: rgba(255, 255, 255, 0.3);
    border-radius: 9999px; margin: 0 auto 24px auto; flex-shrink: 0;
}
[data-theme='light'] .handle-bar { background: rgba(0, 0, 0, 0.2); }

.panel-content { display: flex; flex-direction: column; gap: 16px; }

.title {
    font-size: 28px; font-weight: 800; color: white;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    line-height: 1.1; margin: 0; word-break: break-word;
}
[data-theme='light'] .title { color: #111; text-shadow: none; }

.info-row {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 16px; margin-top: 8px; width: 100%;
}

.subtitle-container { flex: 1; min-width: 0; padding-top: 6px; }

.short-description {
    color: rgba(255, 255, 255, 0.7); font-size: 15px; font-weight: 500; margin: 0;
    display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;
}
[data-theme='light'] .short-description { color: #555; }

.placeholder-text { opacity: 0.5; font-style: italic; font-weight: 400; }

.price-tag {
    display: inline-flex; padding: 8px 20px; border-radius: 16px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
}
[data-theme='light'] .price-tag { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }

.placeholder-price { opacity: 0.6; }

.price-text { font-size: 22px; font-weight: 700; color: white; letter-spacing: 0.025em; }
[data-theme='light'] .price-text { color: #111; }

.long-description-container { flex-grow: 1; }

.long-description {
    color: rgba(255, 255, 255, 0.8); font-size: 16px; line-height: 1.6;
    font-weight: 400; margin: 0; white-space: pre-line;
}
[data-theme='light'] .long-description { color: #333; }

/* Floating Actions */
.floating-actions {
    position: fixed; bottom: 0; left: 0; width: 100%; z-index: 50;
    display: flex; align-items: flex-end; gap: 16px;
    padding: 0 24px calc(32px + var(--safe-area-bottom)) 24px;
    box-sizing: border-box; pointer-events: none;
}
.floating-actions .primary-btn,
.floating-actions .book-btn,
.floating-actions .fulfill-btn,
.floating-actions .archive-btn { pointer-events: auto; }

.archive-btn {
    flex-grow: 1; height: 56px; border-radius: 9999px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.7);
}
.archive-btn:active { transform: scale(0.98); }

.primary-btn {
    flex-grow: 1; height: 56px; border-radius: 9999px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s ease;
    background: linear-gradient(135deg, rgba(10, 13, 194, 0.9) 0%, rgba(76, 29, 149, 0.9) 100%);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(10, 13, 194, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1); color: white;
}
.primary-btn:active { transform: scale(0.98); }

.btn-text { font-size: 14px; font-weight: 700; letter-spacing: 0.025em; }
.btn-icon { font-size: 18px; color: rgba(255, 255, 255, 0.8); transition: transform 0.2s ease; }
.primary-btn:hover .btn-icon { transform: translateX(4px); }

.book-btn {
    flex-grow: 1; height: 56px; border-radius: 9999px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3); color: rgba(16, 185, 129, 1);
}
.book-btn:active { transform: scale(0.98); background: rgba(16, 185, 129, 0.1); }

.fulfill-btn {
    flex-grow: 1; height: 56px; border-radius: 9999px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s ease;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2); color: white;
}
.fulfill-btn:active { transform: scale(0.98); }
.fulfill-btn:hover .btn-icon { transform: scale(1.1); }

.skeleton-btn {
    flex-grow: 1; height: 56px; border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
    background-size: 200% 100%; animation: skeleton-loading 1.5s ease-in-out infinite; pointer-events: none;
}
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.book-btn--taken {
    opacity: 0.55; cursor: not-allowed;
    border-color: rgba(239, 68, 68, 0.3); color: rgba(239, 68, 68, 0.8);
}

.book-btn--mine {
    border-color: rgba(16, 185, 129, 0.5); color: rgba(16, 185, 129, 1);
    background: rgba(16, 185, 129, 0.08);
}
.book-btn--mine:active { background: rgba(16, 185, 129, 0.15); transform: scale(0.98); }

/* Gloss Overlays */
.gloss-top {
    position: fixed; top: 0; left: 0; width: 100%; height: 80px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
    pointer-events: none; z-index: 60;
}
.gloss-bottom {
    position: fixed; bottom: 0; left: 0; width: 100%; height: 80px;
    background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
    pointer-events: none; z-index: 60;
}
</style>
