<script setup lang="ts">
/**
 * BlockedScreen - shown when app is opened outside Telegram.
 */
</script>

<template>
  <div class="blocked-screen">
    <div class="blocked-content">
      <div class="blocked-icon">🔒</div>
      <h1 class="blocked-title">Wishlins</h1>
      <p class="blocked-text">
        Это приложение работает только<br/>
        внутри Telegram
      </p>
      <a
        href="https://t.me/my_123_wishlist_bot"
        class="blocked-button"
        target="_blank"
      >
        Открыть в Telegram
      </a>
    </div>
  </div>
</template>

<style scoped>
.blocked-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: white;
  text-align: center;
  padding: 24px;
}

.blocked-content {
  max-width: 320px;
}

.blocked-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.blocked-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.blocked-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px;
  line-height: 1.5;
}

.blocked-button {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.blocked-button:active {
  transform: scale(0.96);
}
</style>
