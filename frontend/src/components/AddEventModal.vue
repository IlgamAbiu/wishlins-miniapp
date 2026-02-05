<script setup lang="ts">
/**
 * Add Event Modal.
 * Bottom sheet to add a new event (wishlist).
 */
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', title: string): void
}>()

const title = ref('')
const isSubmitting = ref(false)

function handleSubmit() {
  if (!title.value.trim()) return
  isSubmitting.value = true
  emit('submit', title.value)
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Новое событие</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="event-form">
        <div class="form-group">
          <label>Название события</label>
          <input
            v-model="title"
            type="text"
            placeholder="День рождения, Новый год..."
            required
            autofocus
          />
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || !title.trim()"
        >
          Создать
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles from AddWishModal or make global later */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  animation: slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
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
  padding: 8px;
  cursor: pointer;
  color: #999;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #777;
  margin-left: 4px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  background: #f9f9f9;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--tg-button-color, #3390ec);
  background: white;
}

.submit-btn {
  padding: 16px;
  background: var(--tg-button-color, #3390ec);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
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
