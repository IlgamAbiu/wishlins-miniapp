/**
 * TypeScript Type Definitions for Liquid Glass Design System
 */

/**
 * Glass Layer Variants
 * - layer-1: Primary content cards (lightest blur)
 * - layer-2: Navigation & toolbars (medium blur)
 * - layer-3: Modals & overlays (heavy blur)
 * - premium: Special featured content with gradient border
 */
export type GlassVariant = 'layer-1' | 'layer-2' | 'layer-3' | 'layer-4' | 'premium'

/**
 * Button Variants
 * - primary: Glass with tint + accent color (main CTAs)
 * - secondary: Transparent with glass outline (alternative actions)
 * - tertiary: Minimal, no border (inline actions)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

/**
 * Button Sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Haptic Feedback Styles
 */
export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'

/**
 * Haptic Notification Types
 */
export type HapticNotificationType = 'error' | 'success' | 'warning'

/**
 * Input Types
 */
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search'

/**
 * Glass Card Props
 */
export interface GlassCardProps {
  variant?: GlassVariant
  hoverable?: boolean
  pressable?: boolean
}

/**
 * Glass Button Props
 */
export interface GlassButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

/**
 * Glass Input Props
 */
export interface GlassInputProps {
  modelValue: string | number
  type?: InputType
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

/**
 * Loading HUD Props
 */
export interface LoadingHUDProps {
  message?: string
  visible?: boolean
}

/**
 * Bottom Sheet Props
 */
export interface BottomSheetProps {
  title?: string
  closable?: boolean
  visible?: boolean
}

/**
 * Animation Timing Functions
 */
export type AnimationTiming = 'ease' | 'spring' | 'bounce' | 'smooth'

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark'
