<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useWishes } from '@/composables/useWishes'
import { useWishlists } from '@/composables/useWishlists'
import { useTelegramWebApp } from '@/composables/useTelegramWebApp'
import { useUser } from '@/composables/useUser'
import type { Wish } from '@/types'
import AddWishModal from '@/components/AddWishModal.vue'

const { selectedWish, closeWish, updateWish, deleteWish, fulfillWish } = useWishes()
const { wishlists } = useWishlists()
const { user } = useTelegramWebApp()
const { getUserByTelegramId } = useUser()

const showEditModal = ref(false)
const internalUserId = ref<string | null>(null)

// Fetch internal user ID for ownership check
onMounted(async () => {
    if (user.value) {
        const internalUser = await getUserByTelegramId(user.value.id)
        if (internalUser) {
            internalUserId.value = internalUser.id
        }
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
    // Find the wishlist this wish belongs to
    const wishlist = wishlists.value.find(w => w.id === safeWish.value.wishlist_id)
    if (wishlist) {
        return wishlist.user_id === internalUserId.value
    }
    // Fallback if wishlist not found in loaded list (unlikely if we just navigated)
    return false
})

const isFulfilled = computed(() => {
    const wishlist = wishlists.value.find(w => w.id === safeWish.value.wishlist_id)
    return wishlist?.title === 'Сбывшиеся мечты'
})

function handleBack() {
  closeWish()
}

function handleEdit() {
 showEditModal.value = true
}

function handleShare() {
    // TODO: Implement share logic
    console.log('Share wish', safeWish.value.id)
}

function handleStoreLink() {
    if (safeWish.value.link) {
        window.open(safeWish.value.link, '_blank')
    } else {
        alert('Здесь может быть ссылка на магазин, но пока ее нет')
    }
}

async function handleFulfill() {
    if (!user.value || !safeWish.value) return
    
    // Optimistic UI or wait? useWishes handles loading
    const updated = await fulfillWish(safeWish.value.id, user.value.id)
    if (updated) {
        // Updated requirement: Do NOT close wish. Just update state.
        // useWishes updates selectedWish value, which triggers reactivity.
        // isFulfilled computed property should update to true.
    }
}

async function handleRestore() {
    if (!user.value || !safeWish.value) return

    // Confirm restore
    const confirmed = confirm('Вернуть желание из архива в общий список?')
    if (!confirmed) return

    // Find default wishlist
    const defaultWishlist = wishlists.value.find(w => w.is_default)
    if (!defaultWishlist) {
        alert('Не удалось найти список по умолчанию')
        return
    }

    // Move wish to default wishlist
    const updated = await updateWish(safeWish.value.id, { wishlist_id: defaultWishlist.id }, user.value.id)
    if (updated) {
        // Similarly, it might disappear from "Fulfilled" view if we were there.
        // If we want to reflect it in the current view (if we are in "My Wishes"), we might need to add it back?
        // useWishes' updateWish updates it in place if found. But we removed it on fulfill!
        // If it was removed, updateWish won't find it in the list to update.
        // But `selectedWish` is updated.
        // Ideally we should re-fetch or push it back to the list if the current view matches.
        // But for now, let's just update the wish.
        alert('Желание возвращено!')
        closeWish() // Close to refresh/go back to list
    }
}

function handleBook() {
    // TODO: Implement booking logic
    console.log('Book wish', safeWish.value.id)
    alert('Функция бронирования скоро будет доступна')
}
async function handleUpdateWish(data: any) {
    if (!user.value || !safeWish.value) return 

    // Remove id from data if present to avoid issues with update payload
    const { id, ...updateData } = data
    
    const updated = await updateWish(safeWish.value.id, updateData, user.value.id)
    if (updated) {
        showEditModal.value = false
    }
}

async function handleDeleteWish(id: string) {
    if (!user.value) return

    const success = await deleteWish(id, user.value.id)
    if (success) {
        showEditModal.value = false
        closeWish()
    }
}
</script>

<template>
  <div v-if="wish" class="wish-detail-view">
    <!-- Ambient Background Effects (Fixed) -->
    <div class="ambient-background">
        <div class="halo"></div>
        <div class="blur-circle"></div>
    </div>

    <!-- Fixed Image Layer (Behind scrolling content) -->
    <div class="image-layer">
        <div class="image-container-wrapper">
            <div class="liquid-bg"></div>
            <!-- Main Liquid Container -->
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
            
            <!-- Priority Floating Badge (On top of image bottom center) -->
            <div v-if="safeWish.priority === 'really_want'" class="floating-badge">
                <div class="badge-content">
                    <div class="amber-glow"></div>
                    <div class="amber-dot"></div>
                    <span class="badge-text">ОЧЕНЬ ХОЧУ</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Scrollable Content Layer (Foreground) -->
    <div class="scroll-container">
        <!-- Spacer to push content down and reveal image initially -->
        <div class="spacer-top"></div>

        <!-- Main Info Panel -->
        <section class="glass-panel">
            <div class="handle-bar"></div>
            <div class="panel-content">
                <!-- 1. Title (Full text) -->
                <h1 class="title">
                    {{ safeWish.title }}
                </h1>
                
                <!-- Subtitle & Price Row -->
                <div class="info-row">
                    <div class="subtitle-container">
                        <p v-if="safeWish.subtitle" class="short-description">
                            {{ safeWish.subtitle }}
                        </p>
                        <p v-else class="short-description placeholder-text">
                            Здесь может быть короткое описание или название магазина
                        </p>
                    </div>

                    <!-- Price -->
                    <div v-if="safeWish.price" class="price-tag">
                        <span class="price-text">{{ formattedPrice }}</span>
                    </div>
                    <div v-else class="price-tag placeholder-price">
                        <span class="price-text">∞ $ € ₽</span>
                    </div>
                </div>

                <!-- 4. Description 2 (Long, max lines, scrollable) -->
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
        
        <!-- Bottom spacing for scroll feel and to clear floating buttons -->
        <div class="spacer-bottom"></div>
    </div>

    <!-- Floating Actions (Fixed Overlay) -->
    <div class="floating-actions">
        <button
            @click="handleStoreLink"
            class="primary-btn">
            <span class="btn-text">Где купить</span>
            <span class="material-symbols-outlined btn-icon">arrow_outward</span>
        </button>
        
        <button
            v-if="isOwner && !isFulfilled"
            @click="handleFulfill"
            class="fulfill-btn">
            <span class="btn-text">Исполнено</span>
            <span class="material-symbols-outlined btn-icon">check_circle</span>
        </button>

        <button
            v-else-if="isOwner && isFulfilled"
            @click="handleRestore"
            class="archive-btn">
            <span class="btn-text">В архиве</span>
            <span class="material-symbols-outlined btn-icon">archive</span>
        </button>
        
        <button
            v-else-if="!isOwner"
            @click="handleBook"
            class="book-btn">
            <span class="btn-text">Забронировать</span>
        </button>
    </div>

    <!-- Fixed Header (Top of everything) -->
    <header class="header">
        <button @click="handleBack" class="glass-btn back-btn">
            <span class="material-symbols-outlined icon">arrow_back</span>
        </button>
        
        <div class="header-actions">
            <button @click="handleShare" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">share</span>
            </button>
            <button @click="handleEdit" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">edit</span>
            </button>
        </div>
    </header>

    <!-- Decorative Gloss Overlays -->
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
    background-color: #f5f6f8;
    color: #111;
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden; /* Main view doesn't scroll, inner container does */
}

[data-theme='dark'] .wish-detail-view {
    background-color: #101022;
    color: #fff;
}

/* Ambient Background */
.ambient-background {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.halo {
    position: absolute;
    top: -20%;
    left: -20%;
    width: 140%;
    height: 80%;
    background: radial-gradient(circle at 50% 30%, rgba(10, 13, 194, 0.4), transparent 60%);
    filter: blur(60px); /* Reduced from 80px */
    opacity: 0.7;
    will-change: transform;
}

.blur-circle {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 80%;
    height: 60%;
    background: rgba(88, 28, 135, 0.3);
    filter: blur(60px); /* Reduced from 100px */
    border-radius: 50%;
    will-change: transform;
}

/* Fixed Header */
.header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    z-index: 70; /* Above everything, including gloss (60) */
    pointer-events: none; /* Let clicks pass through if needed, but buttons enable valid clicks */
}
.header button {
    pointer-events: auto;
}

.header-actions {
    display: flex;
    gap: 12px;
    pointer-events: auto;
}

/* Buttons */
.glass-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px); /* Reduced from 26px */
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.3);
}

.glass-btn:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
}

.back-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.icon {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.8);
}

/* Image Layer (Fixed) */
.image-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; /* Occupy full height but visual content is top-centered */
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 100px; /* Space for header */
}

.image-container-wrapper {
    position: relative;
    width: 288px;
    height: 288px;
    max-width: 80vw;
    max-height: 80vw;
}

.liquid-bg {
    position: absolute;
    inset: 0;
    background: rgba(10, 13, 194, 0.3);
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    filter: blur(20px); /* Reduced from 40px */
    transform: scale(1); /* Removed scale 1.1 */
}

/* Animation removed for performance */
/* @keyframes pulse {
    0%, 100% { transform: scale(1.1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
} */

.liquid-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.05);
}

.glass-shine {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%);
    pointer-events: none;
    z-index: 2;
    opacity: 0.5;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1); /* Removed scale 1.1 */
    opacity: 0.9;
}

.placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%);
}

.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.8;
}

.placeholder-icon {
    font-size: 48px;
    color: white;
}

.placeholder-label {
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Floating Badge */
.floating-badge {
    position: absolute;
    bottom: -20px; /* Half of badge height (~40px total height, so -20px for half overlap) */
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
}

.badge-content {
    position: relative;
    padding: 8px 24px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px); /* Reduced from 16px */
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3), inset 0 0 5px rgba(245, 158, 11, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
}

.amber-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 70%);
    opacity: 0.6;
}

.amber-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
    position: relative;
    z-index: 1;
    animation: dot-pulse 2s infinite;
}

@keyframes dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.badge-text {
    position: relative;
    z-index: 1;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
}

/* Scroll Container */
.scroll-container {
    position: absolute;
    inset: 0;
    z-index: 10;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    /* Smooth scroll behavior */
    scroll-behavior: smooth;
    
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.scroll-container::-webkit-scrollbar {
    display: none;
}

.spacer-top {
    flex-shrink: 0;
    width: 100%;
    height: 410px; /* Reduced to bring panel higher: 450px - 20px (badge overlap) - 20px (tighter spacing) */
}

.spacer-bottom {
    width: 100%;
    height: 140px; /* Space for floating buttons */
    flex-shrink: 0;
}

/* Glass Info Panel */
.glass-panel {
    align-self: center; /* Center horizontally if width < 100% */
    width: calc(100% - 32px); /* 16px margin on each side */
    /* Remove min-height to enable adaptive sizing */
    /* min-height: 60vh; */
    
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;
    border-bottom-left-radius: 32px; /* Add bottom radius too since it floats */
    border-bottom-right-radius: 32px;

    padding: 24px;
    
    position: relative;
    margin-top: 16px; /* Match side margins (16px) */
    /* margin-bottom handled by spacer-bottom */
    
    backdrop-filter: blur(16px) saturate(180%); /* Reduced from 26px */
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background: rgba(30, 30, 45, 0.85); /* Increased opacity */
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
    
    display: flex;
    flex-direction: column;
}

[data-theme='light'] .glass-panel {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.handle-bar {
    width: 48px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 9999px;
    margin: 0 auto 24px auto;
    flex-shrink: 0;
}

[data-theme='light'] .handle-bar {
    background: rgba(0, 0, 0, 0.2);
}

.panel-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* height: 100%; removed to allow content to dictate height */
}

.title {
    font-size: 28px;
    font-weight: 800;
    color: white;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    line-height: 1.1;
    margin: 0;
    /* Max lines? Requirement says "maximize lines". Default allow wrap */
    word-break: break-word;
}
[data-theme='light'] .title { color: #111; text-shadow: none; }

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align to top in case subtitle is multiline */
    gap: 16px;
    margin-top: 8px;
    width: 100%;
}

.subtitle-container {
    flex: 1;
    min-width: 0; /* Enable truncation in flex child */
    padding-top: 6px; /* Visual alignment with price tag */
}

.short-description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    /* Max 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-line-clamp: 2; /* Autoprefixer fallback */
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
}
[data-theme='light'] .short-description { color: #555; }

.placeholder-text {
    opacity: 0.5;
    font-style: italic;
    font-weight: 400;
}

/* Removed old .price-row margin since we use .info-row now */

.price-tag {
    display: inline-flex;
    padding: 8px 20px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
}
[data-theme='light'] .price-tag { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }

.placeholder-price {
    opacity: 0.6;
}

.price-text {
    font-size: 22px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.025em;
}
[data-theme='light'] .price-text { color: #111; }

.long-description-container {
    flex-grow: 1; /* Allow to expand */
}

.long-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    line-height: 1.6;
    font-weight: 400;
    margin: 0;
    white-space: pre-line;
}
[data-theme='light'] .long-description { color: #333; }

/* Floating Actions */
.floating-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 50;
    
    /* Layout */
    display: flex;
    align-items: flex-end; /* Buttons sit at bottom */
    gap: 16px;
    padding: 0 24px 32px 24px; /* Side padding and bottom clearance */
    box-sizing: border-box;
    
    /* Pass through clicks */
    pointer-events: none;
    
    /* No background */
}

.floating-actions .primary-btn,
.floating-actions .book-btn,
.floating-actions .fulfill-btn,
.floating-actions .archive-btn {
    pointer-events: auto; /* Re-enable clicks */
}

/* ... existing styles ... */

.archive-btn {
    flex-grow: 1;
    height: 56px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
}

.archive-btn:active { transform: scale(0.98); }

.primary-btn {
    flex-grow: 1;
    height: 56px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background: linear-gradient(135deg, rgba(10, 13, 194, 0.9) 0%, rgba(76, 29, 149, 0.9) 100%);
    backdrop-filter: blur(10px); /* Reduced from 26px */
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(10, 13, 194, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
}

.primary-btn:active { transform: scale(0.98); }

.btn-text {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.025em;
}

.btn-icon {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    transition: transform 0.2s ease;
}

.primary-btn:hover .btn-icon {
    transform: translateX(4px);
}

.book-btn {
    flex-grow: 1;
    height: 56px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px); /* Reduced from 26px */
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: rgba(16, 185, 129, 1);
}

.book-btn:active { 
    transform: scale(0.98); 
    background: rgba(16, 185, 129, 0.1);
}

.fulfill-btn {
    flex-grow: 1;
    height: 56px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
}

.fulfill-btn:active { transform: scale(0.98); }

.fulfill-btn:hover .btn-icon {
    transform: scale(1.1);
}

.spacer-flex { flex-grow: 1; }

.secondary-actions { display: flex; gap: 12px; }

.icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Inherits .glass-btn styles */
}
.icon-btn .material-symbols-outlined { color: rgba(255, 255, 255, 0.9); }
[data-theme='light'] .icon-btn .material-symbols-outlined { color: #333; }
[data-theme='light'] .glass-btn { 
    background: rgba(0,0,0,0.05); 
    border: 1px solid rgba(0,0,0,0.1); 
    color: #333;
}

/* Gloss Overlays */
.gloss-top {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
    pointer-events: none;
    z-index: 60;
}
.gloss-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
    pointer-events: none;
    z-index: 60;
}
</style>
