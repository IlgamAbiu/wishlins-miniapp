<script setup lang="ts">
/**
 * Blocking screen shown when app is opened outside Telegram.
 * Displays a message and button to redirect to Telegram bot.
 */

const botUsername = import.meta.env.VITE_BOT_USERNAME || 'wishlistbot'
const telegramLink = `https://t.me/${botUsername}`

function openTelegram() {
  window.location.href = telegramLink
}
</script>

<template>
  <div class="blocked-screen">
    <div class="blocked-screen__content">
      <div class="blocked-screen__icon">🎁</div>
      <h1 class="blocked-screen__title">Wishlist</h1>
      <p class="blocked-screen__subtitle">
        Создавайте списки желаний<br>и делитесь с друзьями
      </p>

      <div class="blocked-screen__divider"></div>

      <div class="blocked-screen__warning">
        <span class="blocked-screen__warning-icon">⚠️</span>
        <p class="blocked-screen__warning-text">
          Это приложение работает<br>только в Telegram
        </p>
      </div>

      <div class="blocked-screen__instructions">
        <p class="blocked-screen__instructions-title">Для использования:</p>
        <ol class="blocked-screen__steps">
          <li>Установите Telegram</li>
          <li>Откройте @{{ botUsername }}</li>
          <li>Нажмите "Создать wishlist"</li>
        </ol>
      </div>

      <button class="blocked-screen__button" @click="openTelegram">
        Открыть в Telegram
      </button>
    </div>
  </div>
</template>

<style scoped>
.blocked-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.blocked-screen__content {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.blocked-screen__icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.blocked-screen__title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.blocked-screen__subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.blocked-screen__divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
  margin: 24px 0;
}

.blocked-screen__warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.blocked-screen__warning-icon {
  font-size: 32px;
}

.blocked-screen__warning-text {
  font-size: 15px;
  font-weight: 600;
  color: #e74c3c;
  margin: 0;
  line-height: 1.4;
}

.blocked-screen__instructions {
  text-align: left;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.blocked-screen__instructions-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.blocked-screen__steps {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #555;
  line-height: 1.8;
}

.blocked-screen__steps li {
  margin-bottom: 4px;
}

.blocked-screen__button {
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0088cc 0%, #0066aa 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.blocked-screen__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 136, 204, 0.4);
}

.blocked-screen__button:active {
  transform: translateY(0);
}
</style>
