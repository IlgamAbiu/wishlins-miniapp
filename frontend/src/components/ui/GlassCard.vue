<script setup lang="ts">
/**
 * GlassCard Component
 * Reusable glass morphism card with multiple layer variants
 *
 * Usage:
 * <GlassCard variant="layer-1" hoverable>
 *   <p>Content here</p>
 * </GlassCard>
 */
import type { GlassVariant } from '@/types/glass.types'

interface Props {
  variant?: GlassVariant
  hoverable?: boolean
  pressable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'layer-1',
  hoverable: false,
  pressable: true,
})
</script>

<template>
  <div
    :class="[
      'glass-card',
      `glass-${variant}`,
      {
        'glass-hoverable': hoverable,
        'glass-pressable': pressable && !hoverable,
      },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  position: relative;
  overflow: hidden;
}

/* Variants are defined in liquid-glass.css */
/* .glass-layer-1, .glass-layer-2, .glass-layer-3, .glass-premium */

/* Hover and Press behaviors are defined in liquid-glass.css */
/* .glass-hoverable, .glass-pressable */
</style>
