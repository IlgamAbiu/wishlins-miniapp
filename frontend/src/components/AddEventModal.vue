<script setup lang="ts">
/**
 * Add Event Modal.
 * Bottom sheet to add a new event (wishlist).
 */
import { ref, computed } from 'vue'

const props = defineProps<{
  initialData?: {
    title: string
    emoji: string | null
    date: string | null
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', title: string, emoji: string, date: string): void
}>()

const title = ref(props.initialData?.title || '')
const emoji = ref(props.initialData?.emoji || '🎉')
// Format date for input type="date" (YYYY-MM-DD)
const formatDate = (isoString?: string | null) => {
  if (!isoString) return ''
  return isoString.split('T')[0]
}
const eventDate = ref(formatDate(props.initialData?.date))

const isSubmitting = ref(false)
const isEditMode = computed(() => !!props.initialData)

const commonEmojis = ['🎉', '🎂', '🎄', '💍', '🍼', '🏠', '🎓', '✈️', '💼', '🎁']

function handleSubmit() {
  if (!title.value.trim()) return
  isSubmitting.value = true
  emit('submit', title.value, emoji.value, eventDate.value || new Date().toISOString())
}

function onInputFocus(event: FocusEvent) {
  // Ensure the input is visible above keyboard
  setTimeout(() => {
    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditMode ? 'Редактировать событие' : 'Новое событие' }}</h3>
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
            @focus="onInputFocus"
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
              @focus="onInputFocus"
            />
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || !title.trim()"
        >
          {{ isEditMode ? 'Сохранить изменения' : 'Создать событие' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles from AddWishModal or make global later */
/* Reuse styles from AddWishModal or make global later */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

.modal-content {
  width: 100%;
  background: var(--tg-bg-color);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  padding: var(--spacing-lg);
  padding-bottom: max(var(--spacing-lg), env(safe-area-inset-bottom));
  animation: slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  max-height: 90vh;
  overflow-y: auto;
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

.event-form {
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
  flex-direction: column; /* Stack on mobile */
  gap: var(--spacing-lg);
}

/* Tablet/Desktop layout */
@media (min-width: 600px) {
  .form-row {
    flex-direction: row;
  }
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
  color: var(--tg-hint-color);
  margin-left: 4px;
}

/* Inputs are styled globally in design-system.css, 
   but we can add specific overrides if needed */
input {
  /* Ensure global styles apply correctly */
  width: 100%;
}

.emoji-selector {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.emoji-preview {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tg-secondary-bg-color);
  border-radius: var(--border-radius-md);
  flex-shrink: 0;
}

.emoji-list {
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
  padding-bottom: 4px;
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
  padding: 8px;
  border-radius: var(--border-radius-md);
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}

.emoji-option:hover {
  background: var(--tg-secondary-bg-color);
}

.emoji-option.active {
  background: var(--tg-secondary-bg-color);
  transform: scale(1.1);
  border: 1px solid var(--tg-border-color);
}

.submit-btn {
  padding: 16px;
  background: var(--tg-button-color);
  color: var(--tg-button-text-color);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: var(--spacing-sm);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
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
</style>
