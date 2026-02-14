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
    title: 'Sony WH-1000XM5',
    price: 349,
    currency: 'USD',
    // Long Description (Description 2)
    description: `Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling. The best just got better.

These headphones feature our new Integrated Processor V1, which unlocks the full potential of our HD Noise Cancelling Processor QN1. This unique combination of technology controls eight microphones to deliver unprecedented noise cancelling quality.

Precision-engineered to deliver exceptional high-resolution audio quality. Our new 30mm 
driver unit with soft edge improves noise cancelling.`,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyxEaBXFFCk5KA2xEsU3Ro5IdWItcS9nBgpYVeMomu_2EZ8zWPm4ouMBodSHxmx6Bsllf5VBD2ZZ9FjfCrhU_jc-Z93DrjbKcDQl7QRSK8ZfMw29wnr-ItqSsThlJ35ej8aNr5WLujDwE94JQS0tGo_xhAemiqSd35rSeMP7RM8ctopk7V3eH6CsmrRY28LnobRCmxk0EQwc3w7fdBhmSellPbGOFBu6QiaGv1AZFPGnvM7dJNf2t9CIwNb9--WPCNlb2P9F4s0yA',
    priority: 'really_want',
    link: 'https://amazon.com',
    // Short Description (Description 1) - simulates 'store' usage or subtitle
    store: 'Noise Cancelling Headphones with Auto NC Optimizer, Collapsible Design, and Alexa Built-in.',
    wishlist_id: 'mock-list',
    created_at: new Date().toISOString()
} as Wish

const safeWish = computed<Wish>(() => mockWish)

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
                    <span class="text-6xl filter drop-shadow-lg">✨</span>
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
                
                <!-- 2. Description 1 (Short, max 2 lines) -->
                <p v-if="safeWish.store" class="short-description">
                    {{ safeWish.store }}
                </p>

                <!-- 3. Price -->
                <div class="price-row">
                    <div v-if="safeWish.price" class="price-tag">
                        <span class="price-text">{{ formattedPrice }}</span>
                    </div>
                </div>

                <!-- 4. Description 2 (Long, max lines, scrollable) -->
                <div class="long-description-container">
                     <p v-if="safeWish.description" class="long-description">
                        {{ safeWish.description }}
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
            v-if="safeWish.link"
            @click="handleStoreLink"
            class="primary-btn">
            <span class="btn-text">Store Link</span>
            <span class="material-symbols-outlined btn-icon">arrow_outward</span>
        </button>
        <div v-else class="spacer-flex"></div>
        
        <div class="secondary-actions">
            <button @click="handleShare" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">share</span>
            </button>
            <button @click="handleEdit" class="glass-btn icon-btn">
                <span class="material-symbols-outlined">edit</span>
            </button>
        </div>
    </div>

    <!-- Fixed Header (Top of everything) -->
    <header class="header">
        <button @click="handleBack" class="glass-btn back-btn">
            <span class="material-symbols-outlined icon">arrow_back</span>
        </button>
    </header>

    <!-- Decorative Gloss Overlays -->
    <div class="gloss-top"></div>
    <div class="gloss-bottom"></div>
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
    filter: blur(80px);
    opacity: 0.7;
}

.blur-circle {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 80%;
    height: 60%;
    background: rgba(88, 28, 135, 0.3);
    filter: blur(100px);
    border-radius: 50%;
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
    /* Ensure top padding includes safe area + 20px visual margin */
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    z-index: 50; /* Above everything */
    pointer-events: none; /* Let clicks pass through if needed, but buttons enable valid clicks */
}
.header button {
    pointer-events: auto;
}

/* Buttons */
.glass-btn {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(26px); /* Liquid Glass Effect */
    -webkit-backdrop-filter: blur(26px);
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
    filter: blur(40px);
    transform: scale(1.1);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1.1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}

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
    transform: scale(1.1);
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

/* Floating Badge */
.floating-badge {
    position: absolute;
    bottom: -43px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
}

.badge-content {
    position: relative;
    padding: 8px 24px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
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
    height: 450px; /* Push content below image initially. Adjust based on Image height + padding */
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
    margin-top: 24px;
    /* margin-bottom handled by spacer-bottom */
    
    backdrop-filter: blur(26px) saturate(180%);
    -webkit-backdrop-filter: blur(26px) saturate(180%);
    background: rgba(30, 30, 45, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
    
    display: flex;
    flex-direction: column;
}

[data-theme='light'] .glass-panel {
    background: rgba(255, 255, 255, 0.8);
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

.short-description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    /* Max 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
[data-theme='light'] .short-description { color: #555; }

.price-row {
    margin-top: 4px;
}

.price-tag {
    display: inline-flex;
    padding: 8px 20px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
}
[data-theme='light'] .price-tag { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }

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
.floating-actions .icon-btn {
    pointer-events: auto; /* Re-enable clicks */
}

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
    backdrop-filter: blur(26px);
    -webkit-backdrop-filter: blur(26px);
    box-shadow: 0 10px 30px rgba(10, 13, 194, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
}

.primary-btn:active { transform: scale(0.98); }

.spacer-flex { flex-grow: 1; }

.secondary-actions { display: flex; gap: 12px; }

.icon-btn {
    width: 56px;
    height: 56px;
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
