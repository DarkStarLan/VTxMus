<script setup lang="ts">
import MusicPlayer from './components/MusicPlayer.vue'
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
}

body {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #1a2a32;
  color: #fff;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.app {
  height: 100vh;
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
