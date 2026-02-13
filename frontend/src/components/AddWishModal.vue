<script setup lang="ts">
/**
 * Add Wish Modal.
 * Bottom sheet modal to add a new wish.
 */
import { ref, reactive } from 'vue'
import type { WishPriority } from '@/types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { title: string; priority: WishPriority; price?: number; currency?: string; link?: string; description?: string }): void
}>()

const isSubmitting = ref(false)
const form = reactive({
  title: '',
  priority: 'just_want' as WishPriority,
  price: '',
  currency: 'RUB',
  link: '',
  description: ''
})

function handleSubmit() {
  if (!form.title.trim()) return
  
  isSubmitting.value = true
  
  // Convert price string to number if present
  const priceNumber = form.price ? parseFloat(form.price) : undefined
  
  emit('submit', {
    title: form.title,
    priority: form.priority,
    price: priceNumber,
    currency: form.currency,
    link: form.link,
    description: form.description
  })
}

function onInputFocus(event: FocusEvent) {
  setTimeout(() => {
    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Новое желание</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="wish-form">
        <div class="form-group">
          <label>Название*</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Что вы хотите?"
            required
            autofocus
            @focus="onInputFocus"
          />
        </div>

        <!-- Priority Selector -->
        <div class="form-group">
          <label>Приоритет*</label>
          <div class="priority-selector">
            <label class="priority-option">
              <input
                type="radio"
                name="priority"
                value="just_want"
                v-model="form.priority"
              />
              <span class="priority-label">
                <span class="priority-emoji">😊</span>
                <span>Просто хочу</span>
              </span>
            </label>
            <label class="priority-option">
              <input
                type="radio"
                name="priority"
                value="really_want"
                v-model="form.priority"
              />
              <span class="priority-label">
                <span class="priority-emoji">🔥</span>
                <span>Очень хочу</span>
              </span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Цена</label>
            <input
              v-model="form.price"
              type="number"
              placeholder="0"
              min="0"
              @focus="onInputFocus"
            />
          </div>
          <div class="form-group currency-group">
            <label>Валюта</label>
            <select v-model="form.currency" @focus="onInputFocus">
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Ссылка</label>
          <input
            v-model="form.link"
            type="url"
            placeholder="https://..."
            @focus="onInputFocus"
          />
          <span class="field-hint">Магазин будет определен автоматически</span>
        </div>

        <!-- Photo Upload Placeholder -->
        <div class="form-group">
          <label>Фото</label>
          <button type="button" class="photo-upload-placeholder" disabled>
            <span class="icon">📷</span>
            <span>Загрузка фото скоро станет доступна</span>
          </button>
          <span class="field-hint">Пока можно вставить ссылку на изображение в поле "Ссылка"</span>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Размер, цвет, детали..."
            @focus="onInputFocus"
          ></textarea>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || !form.title.trim()"
        >
          {{ isSubmitting ? 'Добавление...' : 'Добавить желание' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles or import from a common file if possible */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end; /* Bottom sheet */
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

.modal-content {
  width: 100%;
  background: var(--tg-bg-color);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  padding: var(--spacing-lg);
  max-height: 90vh;
  overflow-y: auto;
  animation: slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  padding-bottom: max(var(--spacing-lg), env(safe-area-inset-bottom));
  box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: 700;
  color: var(--tg-text-color);
}

.close-btn {
  background: rgba(128, 128, 128, 0.1);
  border: none;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--tg-hint-color);
  transition: background-color var(--transition-fast);
}

.close-btn:active {
  background: rgba(128, 128, 128, 0.2);
}

.wish-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
}

.currency-group {
  flex: 0 0 90px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-hint-color);
  margin-left: 4px;
}

/* Inputs are globally styled, overrides here */
input, select, textarea {
  /* Ensure consistent width */
  width: 100%;
}

.submit-btn {
  margin-top: var(--spacing-sm);
  padding: 16px;
  background: var(--tg-button-color);
  color: var(--tg-button-text-color);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Priority Selector Styles */
.priority-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.priority-option {
  display: flex;
  cursor: pointer;
}

.priority-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.priority-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid var(--tg-secondary-bg-color);
  border-radius: var(--border-radius-lg);
  background: var(--tg-bg-color);
  transition: all var(--transition-fast);
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.priority-option input:checked + .priority-label {
  border-color: var(--tg-button-color);
  background: rgba(79, 70, 229, 0.1);
}

[data-theme='dark'] .priority-option input:checked + .priority-label {
  background: rgba(79, 70, 229, 0.15);
}

.priority-emoji {
  font-size: 24px;
}

.field-hint {
  font-size: 11px;
  color: var(--tg-hint-color);
  margin-top: 4px;
  display: block;
}

/* Photo Upload Placeholder */
.photo-upload-placeholder {
  width: 100%;
  padding: 16px;
  background: var(--tg-secondary-bg-color);
  border: 2px dashed var(--tg-hint-color);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  color: var(--tg-hint-color);
  cursor: not-allowed;
  opacity: 0.6;
}

.photo-upload-placeholder .icon {
  font-size: 24px;
}
</style>
