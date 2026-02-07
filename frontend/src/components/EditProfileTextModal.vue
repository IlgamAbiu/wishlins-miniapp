<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  initialText?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialText: ''
})

const emit = defineEmits<{
  close: []
  submit: [text: string]
}>()

const text = ref(props.initialText)

watch(() => props.initialText, (newVal) => {
  text.value = newVal
})

function handleSubmit() {
  if (text.value.trim()) {
    emit('submit', text.value.trim())
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-card glass-panel">
      <div class="modal-header">
        <h2>Редактировать статус</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div class="input-group">
          <label for="profile-text">Ваш статус</label>
          <input
            id="profile-text"
            v-model="text"
            type="text"
            placeholder="Например: Saving for a dream ✨"
            maxlength="50"
            @keyup.enter="handleSubmit"
          />
          <span class="char-count">{{ text.length }}/50</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">Отмена</button>
        <button class="btn btn-primary" @click="handleSubmit">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

[data-theme='dark'] .modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111118;
}

[data-theme='dark'] .modal-header h2 {
  color: #FFFFFF;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #64748b;
}

[data-theme='dark'] .close-btn {
  color: #8E8E93;
}

[data-theme='dark'] .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.modal-body {
  padding: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

[data-theme='dark'] .input-group label {
  color: #8E8E93;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  color: #111118;
  transition: all 0.2s ease;
}

[data-theme='dark'] .input-group input {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.input-group input:focus {
  outline: none;
  border-color: var(--tg-button-color, #0A84FF);
  background: white;
}

[data-theme='dark'] .input-group input:focus {
  background: rgba(255, 255, 255, 0.1);
}

.input-group input::placeholder {
  color: #94a3b8;
}

[data-theme='dark'] .input-group input::placeholder {
  color: #6B7280;
}

.char-count {
  position: absolute;
  right: 16px;
  bottom: 12px;
  font-size: 12px;
  color: #94a3b8;
  pointer-events: none;
}

[data-theme='dark'] .char-count {
  color: #6B7280;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #64748b;
}

[data-theme='dark'] .btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme='dark'] .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: var(--tg-button-color, #0A84FF);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
