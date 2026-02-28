<script setup lang="ts">
/**
 * TabLayout - Layout component for tab-level screens.
 * Shows the main content via <router-view> with KeepAlive, and a TabBar at bottom.
 */
import { TabBar } from '@/components/navigation'
</script>

<template>
  <div class="tab-layout">
    <main class="tab-layout__content">
      <router-view v-slot="{ Component, route }">
        <KeepAlive :max="3">
          <component :is="Component" :key="route.path" />
        </KeepAlive>
      </router-view>
    </main>
    <TabBar />
  </div>
</template>

<style scoped>
.tab-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.tab-layout__content {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.tab-layout__content > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
