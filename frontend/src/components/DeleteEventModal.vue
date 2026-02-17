<script setup lang="ts">
/**
 * Delete Event Confirmation Modal.
 * Shows options for handling wishes when deleting an event.
 */
import { ref } from 'vue'

const props = defineProps<{
  eventTitle: string
  wishesCount: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', moveWishes: boolean): void
}>()

const selectedAction = ref<'move' | 'delete'>('move')

function handleConfirm() {
  emit('confirm', selectedAction.value === 'move')
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Удалить событие?</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="event-name">{{ eventTitle }}</p>
        <p class="wishes-info">
          В этом событии {{ wishesCount }}
          {{ wishesCount === 1 ? 'желание' : wishesCount < 5 ? 'желания' : 'желаний' }}
        </p>

        <div class="question">Что делать с желаниями?</div>

        <div class="options">
          <label class="option-card" :class="{ active: selectedAction === 'move' }">
            <input
              type="radio"
              name="action"
              value="move"
              v-model="selectedAction"
            />
            <div class="option-content">
              <span class="option-icon">📦</span>
              <div class="option-text">
                <div class="option-title">Переместить в "Мои желания"</div>
                <div class="option-description">Желания сохранятся в событии по умолчанию</div>
              </div>
            </div>
          </label>

          <label class="option-card" :class="{ active: selectedAction === 'delete' }">
            <input
              type="radio"
              name="action"
              value="delete"
              v-model="selectedAction"
            />
            <div class="option-content">
              <span class="option-icon">🗑️</span>
              <div class="option-text">
                <div class="option-title">Удалить вместе с желаниями</div>
                <div class="option-description">Все желания будут удалены безвозвратно</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" @click="$emit('close')">
          Отмена
        </button>
        <button class="btn btn-delete" @click="handleConfirm">
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--tg-bg-color);
  border-radius: 20px;
  overflow: hidden;
  animation: scale-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

[data-theme='dark'] .modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-text-color);
}

.close-btn {
  background: rgba(128, 128, 128, 0.1);
  border: none;
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--tg-hint-color);
  transition: background-color 0.2s;
}

.close-btn:active {
  background: rgba(128, 128, 128, 0.2);
}

.modal-body {
  padding: 20px;
}

.event-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--tg-text-color);
}

.wishes-info {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--tg-hint-color);
}

.question {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-text-color);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  background: var(--tg-secondary-bg-color);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:active {
  transform: scale(0.98);
}

.option-card.active {
  border-color: var(--tg-button-color);
  background: rgba(var(--tg-theme-button-color-rgb, 0, 122, 255), 0.08);
}

[data-theme='dark'] .option-card.active {
  background: rgba(10, 132, 255, 0.15);
}

.option-card input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.option-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--tg-text-color);
  margin-bottom: 4px;
}

.option-description {
  font-size: 13px;
  color: var(--tg-hint-color);
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
}

.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-cancel {
  background: var(--tg-secondary-bg-color);
  color: var(--tg-text-color);
}

.btn-cancel:active {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .btn-cancel:active {
  background: rgba(255, 255, 255, 0.1);
}

.btn-delete {
  background: #FF375F;
  color: white;
}

[data-theme='dark'] .btn-delete {
  background: #FF453A;
}

.btn-delete:active {
  background: #E02850;
}

[data-theme='dark'] .btn-delete:active {
  background: #FF3B30;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
