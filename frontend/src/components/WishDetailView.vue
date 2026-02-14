<script setup lang="ts">
import { computed } from 'vue'
import { useWishes } from '@/composables/useWishes'
import type { Wish } from '@/types'

const { selectedWish, closeWish } = useWishes()

const wish = computed(() => selectedWish.value)

// If no wish is selected, we shouldn't show this view, but for safety:
// MOCK DATA FOR TESTING
const mockWish: Wish = {
    id: 'mock-1',
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    price: 348,
    currency: 'USD',
    description: 'Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling. The best just got better.',
    image_url: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF1000,1000_QL80_.jpg',
    priority: 'really_want',
    link: 'https://amazon.com',
    store: 'Amazon',
    wishlist_id: 'mock-list',
    created_at: new Date().toISOString()
} as Wish

const safeWish = computed<Wish>(() => mockWish)
// const safeWish = computed<Wish>(() => wish.value || {} as Wish)

const formattedPrice = computed(() => {
  if (!safeWish.value.price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeWish.value.currency || 'USD',
    maximumFractionDigits: 0
  }).format(safeWish.value.price)
})

function handleBack() {
  closeWish()
}

function handleEdit() {
 // TODO: Implement edit logic
 console.log('Edit wish', safeWish.value.id)
}

function handleShare() {
    // TODO: Implement share logic
    console.log('Share wish', safeWish.value.id)
}

function handleStoreLink() {
    if (safeWish.value.link) {
        window.open(safeWish.value.link, '_blank')
    }
}
</script>

<template>
  <div v-if="wish" class="wish-detail-view">
    <!-- Ambient Background Effects -->
    <div class="fixed inset-0 pointer-events-none w-full h-full overflow-hidden z-0">
        <div class="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] ambient-halo opacity-70"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-purple-900/30 blur-[100px] rounded-full"></div>
    </div>

    <!-- Main Container -->
    <main class="relative z-10 w-full h-full flex flex-col p-6">
        <!-- Top Navigation -->
        <header class="flex justify-between items-center mb-6 pt-safe">
            <!-- Back Button -->
            <button
                @click="handleBack"
                class="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group shadow-glass-deep">
                <span class="material-symbols-outlined text-white/80 group-hover:text-white transition-colors">arrow_back</span>
            </button>
            
             <!-- Done Button (Optional, can be used to close as well) -->
             <!-- <button @click="handleBack"
                class="px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-all shadow-glass-inset">
                Done
            </button> -->
        </header>

        <!-- Hero Section -->
        <section class="flex-grow flex flex-col items-center justify-start relative mt-4">
            <!-- Liquid Glass Image Container -->
            <div class="relative w-72 h-72 mb-8">
                <!-- Decorative blurred layer behind -->
                <div class="absolute inset-0 bg-primary/30 liquid-border blur-2xl transform scale-110 animate-pulse">
                </div>
                <!-- Main Liquid Container -->
                <div
                    class="relative w-full h-full liquid-border overflow-hidden border border-white/20 shadow-2xl backdrop-blur-sm bg-white/5">
                    <!-- Glass Shine -->
                    <div class="absolute top-0 left-0 w-full h-full bg-glass-shine z-20 pointer-events-none opacity-50">
                    </div>
                    <!-- Product Image -->
                    <img 
                        v-if="safeWish.image_url"
                        :src="safeWish.image_url" 
                        :alt="safeWish.title"
                        class="w-full h-full object-cover transform scale-110 hover:scale-100 transition-transform duration-700 opacity-90"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center gradient-placeholder">
                        <span class="text-6xl filter drop-shadow-lg">✨</span>
                    </div>

                </div>
                
                <!-- Floating Badge -->
                <div v-if="safeWish.priority === 'really_want'" class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                    <div
                        class="relative px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-neon-glow flex items-center gap-2 overflow-hidden group">
                        <!-- Amber inner glow -->
                        <div class="absolute inset-0 bg-amber-glow opacity-60"></div>
                        <div
                            class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
                        </div>
                        <span class="relative text-xs font-bold tracking-widest text-white/90 uppercase z-10">ОЧЕНЬ
                            ХОЧУ</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main Info Panel -->
        <section class="glass-panel w-full rounded-3xl p-6 pb-8 relative mt-auto transform translate-y-2">
            <!-- Handle bar -->
            <div class="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            <div class="space-y-6">
                <!-- Title & Price Row -->
                <div class="flex flex-col gap-3">
                    <h1 class="text-3xl font-display font-bold text-white text-glow leading-tight line-clamp-3">
                        {{ safeWish.title }}
                    </h1>
                    <div class="flex items-center justify-between">
                        <p v-if="safeWish.store" class="text-white/60 text-sm font-medium">{{ safeWish.store }}</p>
                         <p v-else class="text-white/60 text-sm font-medium">Wish Item</p>

                        <!-- Price Indentation -->
                        <div v-if="safeWish.price"
                            class="px-5 py-2 rounded-2xl bg-black/20 shadow-price-dent border border-white/5 flex items-center">
                            <span class="text-xl font-bold text-white tracking-wide">{{ formattedPrice }}</span>
                        </div>
                    </div>
                </div>
                <!-- Description -->
                <div v-if="safeWish.description" class="relative max-h-32 overflow-y-auto custom-scrollbar">
                    <p class="text-white/70 text-sm leading-relaxed font-light">
                        {{ safeWish.description }}
                    </p>
                </div>
                <!-- Action Area -->
                <div class="flex items-center gap-4 pt-2">
                    <!-- Primary Button: Store Link -->
                    <button
                        v-if="safeWish.link"
                        @click="handleStoreLink"
                        class="flex-grow h-14 primary-glass-btn rounded-full flex items-center justify-center gap-2 group transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                        <span class="text-white font-bold tracking-wide">In Store</span>
                        <span
                            class="material-symbols-outlined text-white/80 group-hover:translate-x-1 transition-transform text-sm">arrow_outward</span>
                    </button>
                    <!-- Spacer if no link, to push secondary actions to right, OR just let flex gap handle it if we want them left aligned. 
                         Let's keep them right aligned if no link for better reachability? Or center? 
                         If no link, maybe we make the Share/Edit buttons bigger or just align right. 
                         Let's align right for now. -->
                     <div v-else class="flex-grow"></div>
                    
                    <!-- Secondary Actions -->
                    <div class="flex gap-3">
                        <button
                            @click="handleShare"
                            class="w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all shadow-glass-inset">
                            <span class="material-symbols-outlined text-white/90">share</span>
                        </button>
                        <button
                             @click="handleEdit"
                            class="w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all shadow-glass-inset">
                            <span class="material-symbols-outlined text-white/90">edit</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </main>
  </div>
</template>

<style scoped>
.wish-detail-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000; /* High z-index to overlay everything including tab bar */
    background: radial-gradient(circle at 50% 0%, #1C1C1E 0%, #0A0A0C 100%);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 20px);
}

/* Custom Utilities copied/adapted from template */
.glass-panel {
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    background: linear-gradient(160deg, rgba(30, 30, 45, 0.6) 0%, rgba(20, 20, 30, 0.4) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.liquid-border {
    border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    transition: all 0.5s ease;
}

.text-glow {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.primary-glass-btn {
    background: linear-gradient(135deg, rgba(10, 13, 194, 0.8) 0%, rgba(76, 29, 149, 0.8) 100%);
    backdrop-filter: blur(10px);
    box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.4),
        inset 0 -2px 5px rgba(0, 0, 0, 0.2),
        0 10px 20px -5px rgba(10, 13, 194, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.ambient-halo {
    background: radial-gradient(circle at 50% 30%, rgba(10, 13, 194, 0.4), transparent 60%);
    filter: blur(80px);
    z-index: 0;
}

.shadow-glass-deep {
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.shadow-glass-inset {
    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.3);
}

.shadow-neon-glow {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3), inset 0 0 5px rgba(245, 158, 11, 0.2);
}

.bg-amber-glow {
    background: radial-gradient(circle at center, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 70%);
}

.shadow-price-dent {
    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.05);
}

.bg-glass-shine {
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.gradient-placeholder {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(20px);
}
</style>
