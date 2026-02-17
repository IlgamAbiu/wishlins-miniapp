<script setup lang="ts">
/**
 * GlassInput Component
 * Premium glass input field with focus effects
 *
 * Usage:
 * <GlassInput
 *   v-model="form.title"
 *   placeholder="Enter title"
 *   :error="errors.title"
 * />
 */
import { ref } from 'vue'
import type { InputType } from '@/types/glass.types'

interface Props {
  modelValue: string | number
  type?: InputType
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
}>()

const isFocused = ref(false)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleFocus(e: FocusEvent) {
  isFocused.value = true
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}
</script>

<template>
  <div class="glass-input-wrapper">
    <label v-if="label" class="glass-input__label">
      {{ label }}
      <span v-if="required" class="glass-input__required">*</span>
    </label>
    <div
      :class="[
        'glass-input-container',
        {
          'glass-input-container--focused': isFocused,
          'glass-input-container--error': error,
          'glass-input-container--disabled': disabled,
        },
      ]"
    >
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="glass-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    <div v-if="error" class="glass-input__error">{{ error }}</div>
  </div>
</template>

<style scoped>
.glass-input-wrapper {
  width: 100%;
}

.glass-input__label {
  display: block;
  margin-bottom: 8px;
  font-size: var(--font-size-subhead);
  font-weight: var(--font-weight-medium);
  color: var(--tg-text-color);
}

.glass-input__required {
  color: var(--color-error);
  margin-left: 2px;
}

.glass-input-container {
  position: relative;
  border-radius: var(--border-radius-md);
  transition: all 0.2s var(--liquid-ease);

  /* Glass effect */
  background: var(--glass-layer-1-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border-medium);
  box-shadow: var(--glass-shadow-sm), var(--glass-inner-glow);
}

.glass-input {
  width: 100%;
  padding: 14px 16px;
  font-family: var(--font-family-sf-pro);
  font-size: var(--font-size-body);
  color: var(--tg-text-color);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  outline: none;
  transition: all 0.2s var(--liquid-ease);
}

.glass-input::placeholder {
  color: var(--tg-hint-color);
  opacity: 0.7;
}

/* Focused State */
.glass-input-container--focused {
  border-color: var(--tg-button-color);
  box-shadow: 0 0 0 4px rgba(var(--tg-button-color-rgb), 0.1),
              var(--glass-shadow-md),
              var(--glass-inner-glow);
  background: var(--glass-layer-2-bg);
  backdrop-filter: blur(var(--glass-layer-1-blur));
  -webkit-backdrop-filter: blur(var(--glass-layer-1-blur));
}

/* Error State */
.glass-input-container--error {
  border-color: var(--color-error);
}

.glass-input-container--error.glass-input-container--focused {
  box-shadow: 0 0 0 4px rgba(var(--color-error-rgb), 0.1),
              var(--glass-shadow-md),
              var(--glass-inner-glow);
}

.glass-input__error {
  margin-top: 6px;
  font-size: var(--font-size-caption-1);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Disabled State */
.glass-input-container--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-input:disabled {
  cursor: not-allowed;
}

/* Remove autofill background color */
.glass-input:-webkit-autofill,
.glass-input:-webkit-autofill:hover,
.glass-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
  -webkit-text-fill-color: var(--tg-text-color);
  transition: background-color 5000s ease-in-out 0s;
}
</style>
