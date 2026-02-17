<script setup lang="ts">
/**
 * Add Event Modal.
 * Bottom sheet to add a new event (wishlist).
 */
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps<{
  initialData?: {
    title: string
    date: string | null
    description?: string | null
  }
  isDefaultEvent?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', title: string, date: string, description: string): void
}>()

const title = ref(props.initialData?.title || '')
const description = ref(props.initialData?.description || '')
// Format date for display (DD.MM.YYYY)
const formatDateForDisplay = (isoString?: string | null) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
// Format date for input type="date" (YYYY-MM-DD)
const formatDateForInput = (isoString?: string | null) => {
  if (!isoString) return ''
  return isoString.split('T')[0]
}
const eventDate = ref(formatDateForInput(props.initialData?.date))
const displayDate = computed(() =>
  eventDate.value ? formatDateForDisplay(eventDate.value) : 'Не указана'
)

const isSubmitting = ref(false)
const isEditMode = computed(() => !!props.initialData)
const dateInput = ref<HTMLInputElement>()
let scrollTimeout: ReturnType<typeof setTimeout>

function handleDateClick() {
  dateInput.value?.showPicker?.()
  dateInput.value?.click()
}

function handleDateChange(event: Event) {
  const input = event.target as HTMLInputElement
  eventDate.value = input.value
}

function clearDate() {
  eventDate.value = ''
}

function clearDescription() {
  description.value = ''
}

function handleSubmit() {
  if (!title.value.trim()) return
  isSubmitting.value = true
  // Send empty string for empty date and description (will be converted to null in parent)
  const cleanDate = eventDate.value?.trim() || ''
  const cleanDescription = description.value?.trim() || ''
  emit('submit', title.value.trim(), cleanDate, cleanDescription)
}

function onInputFocus(event: FocusEvent) {
  // Ensure the input is visible above keyboard
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

onBeforeUnmount(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout)
})
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

        <div v-if="!isDefaultEvent" class="form-group">
          <label>Дата события (необязательно)</label>
          <div class="date-picker-wrapper">
            <div
              class="date-picker-btn"
              :class="{ 'has-date': eventDate }"
              @click="handleDateClick"
            >
              <span class="date-icon">📅</span>
              <span class="date-text">{{ displayDate }}</span>
              <button
                v-if="eventDate"
                type="button"
                class="clear-date-btn"
                @click.stop.prevent="clearDate"
              >
                ✕
              </button>
            </div>
            <input
              ref="dateInput"
              v-model="eventDate"
              type="date"
              class="date-input-hidden"
              @change="handleDateChange"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Описание события (необязательно)</label>
          <div class="textarea-wrapper">
            <textarea
              v-model="description"
              rows="3"
              placeholder="В этом году я решил сменить стиль, поэтому буду рад всему минималистичному"
              @focus="onInputFocus"
            ></textarea>
            <button
              v-if="description.trim()"
              type="button"
              class="clear-description-btn"
              @click="clearDescription"
              title="Очистить описание"
            >
              ✕
            </button>
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

label {
  font-size: 13px;
  font-weight: 500;
  color: var(--tg-hint-color);
  margin-left: 4px;
}

/* Inputs are styled globally in design-system.css,
   but we can add specific overrides if needed */
input, textarea {
  /* Ensure global styles apply correctly */
  width: 100%;
}

/* Textarea wrapper with clear button */
.textarea-wrapper {
  position: relative;
}

.clear-description-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: var(--tg-hint-color);
  flex-shrink: 0;
  transition: all 0.2s;
  z-index: 1;
}

.clear-description-btn:hover {
  background: rgba(0, 0, 0, 0.15);
}

.clear-description-btn:active {
  transform: translateY(-50%) scale(0.95);
}

[data-theme='dark'] .clear-description-btn {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .clear-description-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Date Picker Button */
.date-picker-wrapper {
  position: relative;
}

.date-picker-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--tg-secondary-bg-color);
  border: 1px solid var(--tg-border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--tg-hint-color);
  font-size: 15px;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.date-picker-btn.has-date {
  color: var(--tg-text-color);
}

.date-picker-btn:active {
  transform: scale(0.98);
  background: rgba(0, 0, 0, 0.05);
}

[data-theme='dark'] .date-picker-btn:active {
  background: rgba(255, 255, 255, 0.05);
}

.date-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.date-text {
  flex: 1;
  text-align: left;
}

.clear-date-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: var(--tg-hint-color);
  flex-shrink: 0;
  transition: all 0.2s;
}

.clear-date-btn:hover {
  background: rgba(0, 0, 0, 0.15);
}

[data-theme='dark'] .clear-date-btn {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .clear-date-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.date-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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
