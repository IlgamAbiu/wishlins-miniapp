<script setup lang="ts">
/**
 * Event Limit Modal.
 * Shows when user tries to create more than 5 events.
 */

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-icon">⚠️</div>

      <h3 class="modal-title">Лимит событий</h3>

      <div class="modal-body">
        <p class="main-text">
          Вы можете создать максимум <strong>5 событий</strong> в MVP версии.
        </p>
        <p class="sub-text">
          Удалите ненужные события, чтобы добавить новые.
        </p>
        <div class="premium-hint">
          <span class="diamond-icon">💎</span>
          <p>Скоро будет доступна Premium версия без лимитов</p>
        </div>
      </div>

      <button class="btn-primary" @click="$emit('close')">
        Понятно
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 360px;
  background: var(--tg-bg-color);
  border-radius: 24px;
  padding: 32px 24px 24px;
  text-align: center;
  animation: scale-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.modal-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease-out;
}

.modal-title {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--tg-text-color);
  letter-spacing: -0.02em;
}

.modal-body {
  margin-bottom: 24px;
}

.main-text {
  margin: 0 0 12px 0;
  font-size: 16px;
  line-height: 1.5;
  color: var(--tg-text-color);
}

.main-text strong {
  font-weight: 700;
  color: var(--tg-button-color);
}

.sub-text {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--tg-hint-color);
}

.premium-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 159, 10, 0.1), rgba(255, 55, 95, 0.1));
  border-radius: 16px;
  border: 1px solid rgba(255, 159, 10, 0.2);
}

[data-theme='dark'] .premium-hint {
  background: linear-gradient(135deg, rgba(255, 159, 10, 0.15), rgba(255, 69, 58, 0.15));
  border: 1px solid rgba(255, 159, 10, 0.25);
}

.diamond-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.premium-hint p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-text-color);
  line-height: 1.4;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: var(--tg-button-color);
  color: var(--tg-button-text-color);
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:active {
  transform: scale(0.98);
  opacity: 0.9;
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

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-5px); }
}
</style>
