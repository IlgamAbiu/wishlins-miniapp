<script setup lang="ts">
/**
 * Add Wish Modal.
 * Bottom sheet modal to add a new wish.
 */
import { ref, reactive } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { title: string; price?: number; currency?: string; link?: string; description?: string }): void
}>()

const isSubmitting = ref(false)
const form = reactive({
  title: '',
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end; /* Bottom sheet */
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--tg-hint-color, #999);
  padding: 8px;
  cursor: pointer;
}

.wish-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.currency-group {
  flex: 0 0 80px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-hint-color, #777);
  margin-left: 4px;
}

input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  background: #f9f9f9;
  transition: all 0.2s;
  font-family: inherit;
  box-sizing: border-box; /* Crucial for inputs */
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--tg-button-color, #3390ec);
  background: white;
}

.submit-btn {
  margin-top: 16px;
  padding: 16px;
  background: var(--tg-button-color, #3390ec);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
