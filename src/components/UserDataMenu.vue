<template>
  <div class="user-data-menu">
    <div class="menu-trigger" @click="toggleMenu">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M468 7c7.6 6.1 12 15.3 12 25l0 304c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6l0-116.7-224 49.8 0 206.3c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6L128 96c0-15 10.4-28 25.1-31.2l288-64c9.5-2.1 19.4 .2 27 6.3z"/>
      </svg>
      <h1>VTxMus</h1>
    </div>

    <transition name="menu-fade">
      <div v-if="showMenu" class="menu-dropdown">
        <button @click="handleLogin" class="menu-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/>
          </svg>
          <span>扫码登录账号</span>
        </button>
        <div class="menu-divider"></div>
        <button @click="handleExport" class="menu-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
          </svg>
          <span>导出用户数据</span>
        </button>
        <button @click="handleImport" class="menu-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/>
          </svg>
          <span>导入用户数据</span>
        </button>
      </div>
    </transition>

    <div v-if="showMenu" class="menu-overlay" @click="closeMenu"></div>
    <input ref="fileInput" type="file" accept=".json" @change="onFileSelected" style="display: none" />

    <!-- 登录二维码弹窗 -->
    <LoginQRModal v-model:visible="showLoginModal" @success="onLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportUserData, importUserData } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { usePlayerStore } from '@/stores/player'
import LoginQRModal from './LoginQRModal.vue'

const showMenu = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const playerStore = usePlayerStore()
const showLoginModal = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
}

function handleLogin() {
  showLoginModal.value = true
  closeMenu()
}

function onLoginSuccess(cookie: string) {
  console.log('登录成功，获取到的 Cookie:', cookie)
  toast.success('登录成功！Cookie 已保存到 localStorage 和服务器')

  // 提示用户重启应用
  setTimeout(() => {
    toast.success('请重启应用以使用新的登录状态', 3000)
  }, 2000)
}

function handleExport() {
  try {
    const data = exportUserData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vtxmus_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    closeMenu()
    toast.success('用户数据导出成功！')
  } catch (error) {
    toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function handleImport() {
  fileInput.value?.click()
  closeMenu()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      importUserData(content)

      // 立即重新加载 store 配置
      playerStore.reloadConfig()

      toast.success('用户数据导入成功！页面将刷新以应用新数据。', 2000)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
  reader.readAsText(file)

  // 重置 input，允许重复选择同一文件
  target.value = ''
}
</script>

<style scoped>
.user-data-menu {
  position: relative;
}

.menu-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.menu-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
}

.logo-icon {
  width: 32px;
  height: 32px;
  fill: #8ABEB9;
  filter: drop-shadow(0 2px 8px rgba(138, 190, 185, 0.3));
}

.menu-trigger h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(26, 42, 50, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(138, 190, 185, 0.2);
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1003;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background: rgba(138, 190, 185, 0.15);
  color: #B7E5CD;
}

.menu-item svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: rgba(138, 190, 185, 0.15);
  margin: 4px 8px;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease;
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

