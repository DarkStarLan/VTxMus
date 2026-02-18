<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>扫码登录网易云音乐</h2>
          <button class="close-btn" @click="handleClose">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>正在生成二维码...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
            </svg>
            <p>{{ error }}</p>
            <button class="retry-btn" @click="initQRCode">重试</button>
          </div>

          <div v-else-if="success" class="success-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
            </svg>
            <p>登录成功！</p>
            <p class="success-tip">Cookie 已保存，即将关闭...</p>
          </div>

          <div v-else class="qr-state">
            <!-- 当前状态显示 -->
            <div class="current-status" :class="statusClass || 'waiting'">
              <div class="status-icon">
                <svg v-if="!statusText" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                </svg>
                <svg v-else-if="statusClass === 'scanned'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                </svg>
                <svg v-else-if="statusClass === 'expired'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
                </svg>
              </div>
              <p class="status-text">{{ statusText || '等待扫码' }}</p>
            </div>

            <div class="qr-container">
              <img v-if="qrImage" :src="qrImage" alt="登录二维码" class="qr-image" />
            </div>

            <div class="tips">
              <p class="tip-title">使用网易云音乐 APP 扫码登录</p>
              <ul class="tip-list">
                <li>打开网易云音乐 APP</li>
                <li>点击右上角扫一扫</li>
                <li>扫描二维码完成登录</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { generateQRKey, generateQRCode, checkQRStatus } from '@/api/netease'
import { saveNeteaseCooke } from '@/utils/storage'
import { toast } from '@/utils/toast'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success', cookie: string): void
}>()

const loading = ref(false)
const error = ref('')
const success = ref(false)
const qrImage = ref('')
const qrKey = ref('')
const statusText = ref('')
const statusClass = ref('')

let checkTimer: number | null = null

// 初始化二维码
async function initQRCode() {
  loading.value = true
  error.value = ''
  success.value = false
  statusText.value = ''

  try {
    // 1. 生成二维码 key
    qrKey.value = await generateQRKey()
    console.log('二维码 key:', qrKey.value)

    // 2. 生成二维码图片
    qrImage.value = await generateQRCode(qrKey.value)
    console.log('二维码图片已生成')

    loading.value = false

    // 3. 开始轮询检查扫码状态
    startCheckStatus()
  } catch (err) {
    loading.value = false
    error.value = err instanceof Error ? err.message : '生成二维码失败'
    console.error('生成二维码失败:', err)
  }
}

// 开始检查扫码状态
function startCheckStatus() {
  if (checkTimer) {
    clearInterval(checkTimer)
  }

  // 添加一个标志来防止重复处理
  let isProcessing = false

  checkTimer = window.setInterval(async () => {
    // 如果正在处理或已经成功，跳过本次检查
    if (isProcessing || success.value) {
      return
    }

    isProcessing = true

    try {
      const result = await checkQRStatus(qrKey.value)
      console.log('二维码状态:', result)

      switch (result.code) {
        case 800:
          // 二维码过期
          statusText.value = '二维码已过期'
          statusClass.value = 'expired'
          stopCheckStatus()
          setTimeout(() => {
            initQRCode() // 自动刷新二维码
          }, 2000)
          break

        case 801:
          // 等待扫码
          statusText.value = ''
          statusClass.value = ''
          break

        case 802:
          // 已扫码，等待确认
          statusText.value = '已扫码，请在手机上确认'
          statusClass.value = 'scanned'
          break

        case 803:
          // 登录成功 - 立即停止轮询
          stopCheckStatus()
          success.value = true

          // 保存 Cookie
          if (result.cookie) {
            console.log('✅ 登录成功！Cookie 长度:', result.cookie.length)
            console.log('✅ Cookie 预览:', result.cookie.substring(0, 100) + '...')
            saveNeteaseCooke(result.cookie)
            emit('success', result.cookie)
            toast.success('登录成功！Cookie 已保存')

            // 2秒后关闭弹窗
            setTimeout(() => {
              handleClose()
            }, 2000)
          } else {
            console.error('❌ 登录成功但未获取到 Cookie')
            error.value = '登录成功但未获取到 Cookie，请重试'
            stopCheckStatus()
          }
          break

        default:
          console.warn('未知的二维码状态:', result.code)
      }
    } catch (err) {
      console.error('检查二维码状态失败:', err)
    } finally {
      isProcessing = false
    }
  }, 3000) // 每3秒检查一次
}

// 停止检查状态
function stopCheckStatus() {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }
}

// 关闭弹窗
function handleClose() {
  stopCheckStatus()
  emit('update:visible', false)
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initQRCode()
  } else {
    stopCheckStatus()
    // 重置状态
    loading.value = false
    error.value = ''
    success.value = false
    qrImage.value = ''
    qrKey.value = ''
    statusText.value = ''
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCheckStatus()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: linear-gradient(135deg, rgba(26, 42, 50, 0.98) 0%, rgba(20, 35, 42, 0.98) 100%);
  border: 1px solid rgba(138, 190, 185, 0.3);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  margin: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 99999;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(138, 190, 185, 0.2);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #B7E5CD;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn svg {
  width: 16px;
  height: 16px;
  fill: rgba(255, 255, 255, 0.7);
}

.modal-body {
  padding: 32px 28px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态 */
.loading-state {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(138, 190, 185, 0.2);
  border-top-color: #8ABEB9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 错误状态 */
.error-state {
  text-align: center;
}

.error-state svg {
  width: 64px;
  height: 64px;
  fill: #ff6b6b;
  margin-bottom: 20px;
}

.error-state p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin-bottom: 24px;
}

.retry-btn {
  padding: 10px 24px;
  background: rgba(138, 190, 185, 0.2);
  border: 1px solid rgba(138, 190, 185, 0.4);
  border-radius: 8px;
  color: #B7E5CD;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(138, 190, 185, 0.3);
  border-color: rgba(138, 190, 185, 0.6);
}

/* 成功状态 */
.success-state {
  text-align: center;
}

.success-state svg {
  width: 64px;
  height: 64px;
  fill: #51cf66;
  margin-bottom: 20px;
}

.success-state p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin-bottom: 8px;
}

.success-tip {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* 二维码状态 */
.qr-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 当前状态显示 */
.current-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: rgba(138, 190, 185, 0.1);
  border: 1px solid rgba(138, 190, 185, 0.3);
  transition: all 0.3s ease;
}

.current-status.waiting {
  background: rgba(138, 190, 185, 0.1);
  border-color: rgba(138, 190, 185, 0.3);
}

.current-status.scanned {
  background: rgba(81, 207, 102, 0.1);
  border-color: rgba(81, 207, 102, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.current-status.expired {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.4);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

.status-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.status-icon svg {
  width: 100%;
  height: 100%;
}

.current-status.waiting .status-icon svg {
  fill: #8ABEB9;
}

.current-status.scanned .status-icon svg {
  fill: #51cf66;
}

.current-status.expired .status-icon svg {
  fill: #ff6b6b;
}

.status-text {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}

.current-status.waiting .status-text {
  color: #B7E5CD;
}

.current-status.scanned .status-text {
  color: #51cf66;
}

.current-status.expired .status-text {
  color: #ff6b6b;
}

.qr-container {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 0 auto 24px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.qr-image {
  width: 100%;
  height: 100%;
  display: block;
}

.tips {
  text-align: center;
}

.tip-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
}

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip-list li {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 6px 0;
  position: relative;
  padding-left: 20px;
}

.tip-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #8ABEB9;
  font-weight: bold;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9);
}
</style>

