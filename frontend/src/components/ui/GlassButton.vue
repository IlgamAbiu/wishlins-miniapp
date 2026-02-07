<script setup lang="ts">
/**
 * GlassButton Component
 * Premium glass button with haptic feedback
 *
 * Variants:
 * - primary: Glass with tint + accent color
 * - secondary: Transparent with glass outline
 * - tertiary: Minimal, no border
 *
 * Usage:
 * <GlassButton variant="primary" @click="handleClick">
 *   Save
 * </GlassButton>
 */
import { useHaptic } from '@/composables/useHaptic'
import type { ButtonVariant, ButtonSize } from '@/types/glass.types'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const { impact } = useHaptic()

function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) return

  // Trigger haptic feedback
  impact('light')

  // Emit click event
  emit('click', e)
}
</script>

<template>
  <button
    :class="[
      'glass-button',
      `glass-button--${variant}`,
      `glass-button--${size}`,
      {
        'glass-button--loading': loading,
        'glass-button--full-width': fullWidth,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="glass-button__spinner" aria-label="Loading"></span>
    <span v-else class="glass-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.glass-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-family: var(--font-family-sf-pro);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s var(--liquid-ease);
  -webkit-tap-highlight-color: transparent;
}

.glass-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === VARIANTS === */

/* Primary - Glass with Accent */
.glass-button--primary {
  background: var(--glass-layer-1-bg);
  backdrop-filter: blur(var(--glass-layer-1-blur));
  -webkit-backdrop-filter: blur(var(--glass-layer-1-blur));
  color: var(--tg-button-text-color);
  border: 1px solid var(--glass-border-light);
  box-shadow: var(--glass-shadow-md), var(--glass-inner-glow);
  border-radius: var(--border-radius-lg);
  position: relative;
}

.glass-button--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--tg-button-color);
  opacity: 0.85;
  border-radius: inherit;
  z-index: -1;
}

.glass-button--primary:active:not(:disabled) {
  transform: scale(0.96);
  box-shadow: var(--glass-shadow-sm);
}

/* Secondary - Outline Glass */
.glass-button--secondary {
  background: transparent;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--tg-text-color);
  border: 1.5px solid var(--glass-border-medium);
  border-radius: var(--border-radius-lg);
}

.glass-button--secondary:active:not(:disabled) {
  background: var(--glass-layer-4-bg);
  transform: scale(0.96);
}

/* Tertiary - Minimal */
.glass-button--tertiary {
  background: transparent;
  color: var(--tg-button-color);
  border: none;
  border-radius: var(--border-radius-md);
}

.glass-button--tertiary:active:not(:disabled) {
  background: var(--glass-layer-4-bg);
  transform: scale(0.96);
}

/* === SIZES === */

.glass-button--sm {
  padding: 8px 16px;
  font-size: var(--font-size-footnote);
  min-height: 32px;
}

.glass-button--md {
  padding: 12px 24px;
  font-size: var(--font-size-callout);
  min-height: 44px;
}

.glass-button--lg {
  padding: 16px 32px;
  font-size: var(--font-size-body);
  min-height: 56px;
}

/* === FULL WIDTH === */

.glass-button--full-width {
  width: 100%;
}

/* === LOADING STATE === */

.glass-button--loading {
  pointer-events: none;
}

.glass-button__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.glass-button__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
