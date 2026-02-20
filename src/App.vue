<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import MusicPlayer from './components/MusicPlayer.vue'
import { getDeviceInfo, watchDeviceChange } from './utils/device'

// 应用设备样式
function applyDeviceStyles() {
  const deviceInfo = getDeviceInfo()
  const htmlElement = document.documentElement

  console.log('设备信息:', {
    宽度: deviceInfo.screenWidth,
    高度: deviceInfo.screenHeight,
    是否移动端: deviceInfo.isMobile,
    是否桌面: deviceInfo.isDesktop,
    设备类型: deviceInfo.deviceType
  })

  // 移除所有设备类
  htmlElement.classList.remove('mobile-layout', 'desktop-layout')

  // 添加对应的设备类
  if (deviceInfo.isMobile) {
    htmlElement.classList.add('mobile-layout')
    console.log('✓ 应用移动端布局 (.mobile-layout) - 宽度 ≤ 1000px')
  } else {
    htmlElement.classList.add('desktop-layout')
    console.log('✓ 应用桌面布局 (.desktop-layout) - 宽度 > 1000px')
  }

  // 添加触摸设备类
  if (deviceInfo.isTouchDevice) {
    htmlElement.classList.add('touch-device')
  }
}

let unwatchDevice: (() => void) | null = null

onMounted(() => {
  // 初始应用设备样式
  applyDeviceStyles()

  // 监听设备变化
  unwatchDevice = watchDeviceChange(() => {
    applyDeviceStyles()
  })
})

onUnmounted(() => {
  // 清理监听器
  if (unwatchDevice) {
    unwatchDevice()
  }
})
</script>

<template>
  <div class="app">
    <div class="background-animation">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    <div class="app-content">
      <router-view />
    </div>
    <MusicPlayer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #1a2a32;
  color: #fff;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  touch-action: manipulation;
  /* 防止移动端双击缩放 */
  -webkit-user-select: none;
  user-select: none;
}

/* 允许文本选择 */
input,
textarea,
[contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}

#app {
  height: 100vh;
  height: 100dvh; /* 动态视口高度，适配移动端 */
  overflow: hidden;
  /* 支持安全区域 */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
</style>

<style scoped>
.app {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #1a2a32 0%, #305669 50%, #2a4555 100%);
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #8ABEB9 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation: float-1 20s infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #B7E5CD 0%, transparent 70%);
  bottom: -5%;
  right: -5%;
  animation: float-2 25s infinite;
}

.orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, #6B9B96 0%, transparent 70%);
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float-3 30s infinite;
}

@keyframes float-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(100px, 80px) scale(1.1);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-80px, -100px) scale(1.15);
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  33% {
    transform: translate(-40%, -45%) scale(1.05);
  }
  66% {
    transform: translate(-60%, -55%) scale(0.95);
  }
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}
</style>
