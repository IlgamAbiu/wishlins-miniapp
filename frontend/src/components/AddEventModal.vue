<script setup lang="ts">
/**
 * Add Event Modal.
 * Bottom sheet to add a new event (wishlist).
 */
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', title: string, emoji: string, date: string): void
}>()

const title = ref('')
const emoji = ref('🎉')
const eventDate = ref('')
const isSubmitting = ref(false)

const commonEmojis = ['🎉', '🎂', '🎄', '💍', '🍼', '🏠', '🎓', '✈️', '💼', '🎁']

function handleSubmit() {
  if (!title.value.trim()) return
  isSubmitting.value = true
  emit('submit', title.value, emoji.value, eventDate.value || new Date().toISOString())
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

        <div class="form-row">
          <div class="form-group emoji-group">
            <label>Иконка</label>
            <div class="emoji-selector">
              <div class="emoji-preview">{{ emoji }}</div>
              <div class="emoji-list">
                <button 
                  v-for="e in commonEmojis" 
                  :key="e"
                  type="button"
                  class="emoji-option"
                  :class="{ active: emoji === e }"
                  @click="emoji = e"
                >
                  {{ e }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-group date-group">
            <label>Дата события</label>
            <input
              v-model="eventDate"
              type="date"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || !title.trim()"
        >
          Создать событие
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
  max-height: 90vh;
  overflow-y: auto;
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

.form-row {
  display: flex;
  gap: 16px;
}

.emoji-group {
  flex: 1;
}

.date-group {
  flex: 1;
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

.emoji-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.emoji-preview {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 12px;
}

.emoji-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  /* Hide scrollbar */
  scrollbar-width: none; 
  -ms-overflow-style: none;
}

.emoji-list::-webkit-scrollbar {
  display: none;
}

.emoji-option {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: transform 0.1s;
}

.emoji-option:hover {
  background: #f5f5f5;
}

.emoji-option.active {
  background: #e0e0e0;
  transform: scale(1.1);
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
  margin-top: 10px;
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
