<script setup lang="ts">
/**
 * Edit Profile Text Modal.
 * Bottom sheet with Telegram MainButton for submit.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTelegramMainButton } from '@/composables/useTelegramMainButton'
import { useHaptic } from '@/composables/useHaptic'

const props = defineProps<{
  initialText: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', text: string): void
}>()

const mainButton = useTelegramMainButton()
const { impact } = useHaptic()

const text = ref(props.initialText)
let scrollTimeout: ReturnType<typeof setTimeout>

function handleSubmit() {
  impact('light')
  mainButton.setLoading(true)
  emit('submit', text.value)
  setTimeout(() => mainButton.setLoading(false), 500)
}

function onInputFocus(event: FocusEvent) {
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

onMounted(() => {
  mainButton.show('Сохранить', handleSubmit)
})

onBeforeUnmount(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout)
})
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Редактировать статус</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-group">
          <label>О себе</label>
          <textarea
            v-model="text"
            rows="3"
            placeholder="Saving for a dream ✨"
            autofocus
            @focus="onInputFocus"
          ></textarea>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  max-height: 85vh;
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
}

.close-btn:active {
  background: rgba(128, 128, 128, 0.2);
}

.profile-form {
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

textarea {
  width: 100%;
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
