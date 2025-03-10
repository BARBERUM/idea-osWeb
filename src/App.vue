<script setup>
import headComponent from './components/headComponent.vue';
import footerComponent from './components/footerComponent.vue';
</script>

<template>
  <div id="app">
    <headComponent />
    <main>
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition || 'fade'" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
    </main>
    <footerComponent />
  </div>
</template>

<style>
#app {

  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 保证页面高度始终填满屏幕 */
  text-align: center;
}
main {

  flex: 1; /* 让主内容区域自动撑开剩余空间 */
}

footer {
  margin-top: auto; /* 保证 Footer 固定在底部 */
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active {
  transition: transform 0.6s ease-out, opacity 0.5s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-left-leave-active {
  transition: transform 0.6s ease-in, opacity 0.5s ease;
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
