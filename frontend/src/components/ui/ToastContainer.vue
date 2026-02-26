<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-pill"
        :class="`toast-pill--${toast.type}`"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          <span class="material-symbols-outlined toast-icon">
            {{ 
              toast.type === 'success' ? 'check_circle' : 
              toast.type === 'error' ? 'error' : 
              toast.type === 'warning' ? 'warning' : 'info' 
            }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--safe-area-top) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 90vw;
  pointer-events: none;
}

.toast-pill {
  pointer-events: auto;
  padding: 10px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  max-width: 100%;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Types */
.toast-pill--success .toast-icon { color: #10b981; }
.toast-pill--error .toast-icon { color: #ef4444; }
.toast-pill--warning .toast-icon { color: #f59e0b; }
.toast-pill--info .toast-icon { color: #3b82f6; }

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
