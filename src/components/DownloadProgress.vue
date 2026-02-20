<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="download-modal-overlay" @click="handleOverlayClick">
        <div class="download-modal" @click.stop>
          <div class="modal-header">
            <h3>下载进度</h3>
            <button @click="close" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-svg">
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
              </svg>
            </button>
          </div>

          <div class="download-list">
            <div v-for="item in downloads" :key="item.id" class="download-item">
              <div class="item-info">
                <img :src="item.cover" :alt="item.name" class="item-cover" />
                <div class="item-text">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-artist">{{ item.artist }}</div>
                </div>
              </div>

              <div class="item-progress">
                <div class="progress-info">
                  <span class="progress-text">{{ getStatusText(item) }}</span>
                  <span class="progress-percent">{{ item.progress }}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-bg">
                    <div
                      class="progress-bar-fill"
                      :class="{ 'completed': item.status === 'completed', 'error': item.status === 'error' }"
                      :style="{ width: item.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <button
                  v-if="item.status === 'error'"
                  @click="retry(item.id)"
                  class="action-btn retry-btn"
                  title="重试"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
                    <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
                  </svg>
                </button>
                <button
                  v-if="item.status === 'downloading'"
                  @click="cancel(item.id)"
                  class="action-btn cancel-btn"
                  title="取消"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-svg">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                  </svg>
                </button>
                <button
                  v-if="item.status === 'completed'"
                  @click="remove(item.id)"
                  class="action-btn remove-btn"
                  title="移除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon-svg">
                    <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="downloads.length === 0" class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="empty-icon">
                <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
              </svg>
              <p>暂无下载任务</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface DownloadItem {
  id: string
  name: string
  artist: string
  cover: string
  progress: number
  status: 'downloading' | 'completed' | 'error'
  controller?: AbortController
}

const visible = ref(false)
const downloads = ref<DownloadItem[]>([])

function show() {
  visible.value = true
}

function close() {
  visible.value = false
}

function handleOverlayClick() {
  close()
}

function addDownload(item: Omit<DownloadItem, 'progress' | 'status'>) {
  const download: DownloadItem = {
    ...item,
    progress: 0,
    status: 'downloading'
  }
  downloads.value.unshift(download)
  show()
  return download
}

function updateProgress(id: string, progress: number) {
  const item = downloads.value.find(d => d.id === id)
  if (item) {
    item.progress = Math.min(100, Math.max(0, progress))
  }
}

function setCompleted(id: string) {
  const item = downloads.value.find(d => d.id === id)
  if (item) {
    item.progress = 100
    item.status = 'completed'
  }
}

function setError(id: string) {
  const item = downloads.value.find(d => d.id === id)
  if (item) {
    item.status = 'error'
  }
}

function cancel(id: string) {
  const item = downloads.value.find(d => d.id === id)
  if (item) {
    item.controller?.abort()
    remove(id)
  }
}

function retry(id: string) {
  const item = downloads.value.find(d => d.id === id)
  if (item) {
    item.progress = 0
    item.status = 'downloading'
    // 触发重试事件，由父组件处理
    emit('retry', id)
  }
}

function remove(id: string) {
  const index = downloads.value.findIndex(d => d.id === id)
  if (index !== -1) {
    downloads.value.splice(index, 1)
  }
}

function getStatusText(item: DownloadItem): string {
  switch (item.status) {
    case 'downloading':
      return '下载中...'
    case 'completed':
      return '下载完成'
    case 'error':
      return '下载失败'
    default:
      return ''
  }
}

const emit = defineEmits<{
  retry: [id: string]
}>()

defineExpose({
  show,
  close,
  addDownload,
  updateProgress,
  setCompleted,
  setError
})
</script>

<style scoped>
.download-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.download-modal {
  background: linear-gradient(135deg, #1a2a32 0%, #305669 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(183, 229, 205, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.close-btn {
  min-width: 32px;
  max-width: 32px;
  width: 32px;
  min-height: 32px;
  max-height: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.close-btn .icon-svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.download-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.download-list::-webkit-scrollbar {
  width: 6px;
}

.download-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.download-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.download-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.download-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  max-width: 280px;
  flex-shrink: 0;
}

.item-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  min-width: 0;
  max-width: 200px;
  overflow: hidden;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-progress {
  flex: 1;
  min-width: 180px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.progress-percent {
  font-size: 12px;
  font-weight: 600;
  color: #8ABEB9;
}

.progress-bar-container {
  width: 100%;
}

.progress-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8ABEB9 0%, #B7E5CD 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar-fill.completed {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.progress-bar-fill.error {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  min-width: 32px;
  max-width: 32px;
  width: 32px;
  min-height: 32px;
  max-height: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-btn .icon-svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.retry-btn {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.retry-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.remove-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  width: 64px;
  height: 64px;
  fill: currentColor;
  margin: 0 auto 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .download-modal,
.modal-leave-to .download-modal {
  transform: scale(0.9) translateY(20px);
}

/* 移动端适配 - 使用 .mobile-layout 类 */
.mobile-layout .download-modal-overlay {
  padding: 16px;
}

.mobile-layout .download-modal {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
}

.mobile-layout .modal-header {
  padding: 16px 20px;
}

.mobile-layout .modal-header h3 {
  font-size: 16px;
}

.mobile-layout .close-btn {
  min-width: 28px;
  max-width: 28px;
  width: 28px;
  min-height: 28px;
  max-height: 28px;
  height: 28px;
}

.mobile-layout .close-btn .icon-svg {
  width: 12px;
  height: 12px;
}

.mobile-layout .download-list {
  padding: 12px 16px;
}

.mobile-layout .download-item {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.mobile-layout .item-info {
  min-width: 0;
  width: 100%;
  gap: 10px;
}

.mobile-layout .item-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
}

.mobile-layout .item-name {
  font-size: 13px;
}

.mobile-layout .item-artist {
  font-size: 11px;
}

.mobile-layout .item-progress {
  width: 100%;
}

.mobile-layout .progress-info {
  margin-bottom: 6px;
}

.mobile-layout .progress-text {
  font-size: 11px;
}

.mobile-layout .progress-percent {
  font-size: 11px;
}

.mobile-layout .progress-bar-bg {
  height: 5px;
}

.mobile-layout .item-actions {
  justify-content: flex-end;
}

.mobile-layout .action-btn {
  min-width: 36px;
  max-width: 36px;
  width: 36px;
  min-height: 36px;
  max-height: 36px;
  height: 36px;
}

.mobile-layout .action-btn .icon-svg {
  width: 16px;
  height: 16px;
}

.mobile-layout .empty-state {
  padding: 40px 20px;
}

.mobile-layout .empty-icon {
  width: 48px;
  height: 48px;
}

.mobile-layout .empty-state p {
  font-size: 13px;
}

/* 小屏幕适配 (480px以下) */
@media (max-width: 480px) {
  .mobile-layout .download-modal-overlay {
    padding: 12px;
  }

  .mobile-layout .download-modal {
    max-height: 90vh;
    border-radius: 10px;
  }

  .mobile-layout .modal-header {
    padding: 14px 16px;
  }

  .mobile-layout .modal-header h3 {
    font-size: 15px;
  }

  .mobile-layout .download-list {
    padding: 10px 12px;
  }

  .mobile-layout .download-item {
    padding: 10px;
    margin-bottom: 8px;
    gap: 10px;
  }

  .mobile-layout .item-info {
    gap: 8px;
  }

  .mobile-layout .item-cover {
    width: 40px;
    height: 40px;
    border-radius: 5px;
  }

  .mobile-layout .item-name {
    font-size: 12px;
  }

  .mobile-layout .item-artist {
    font-size: 10px;
  }

  .mobile-layout .progress-text {
    font-size: 10px;
  }

  .mobile-layout .progress-percent {
    font-size: 10px;
  }

  .mobile-layout .progress-bar-bg {
    height: 4px;
  }

  .mobile-layout .action-btn {
    min-width: 32px;
    max-width: 32px;
    width: 32px;
    min-height: 32px;
    max-height: 32px;
    height: 32px;
  }

  .mobile-layout .action-btn .icon-svg {
    width: 14px;
    height: 14px;
  }

  .mobile-layout .empty-state {
    padding: 30px 16px;
  }

  .mobile-layout .empty-icon {
    width: 40px;
    height: 40px;
  }

  .mobile-layout .empty-state p {
    font-size: 12px;
  }
}

/* 超小屏幕适配 (360px以下) */
@media (max-width: 360px) {
  .mobile-layout .download-modal-overlay {
    padding: 8px;
  }

  .mobile-layout .modal-header {
    padding: 12px 14px;
  }

  .mobile-layout .modal-header h3 {
    font-size: 14px;
  }

  .mobile-layout .close-btn {
    min-width: 26px;
    max-width: 26px;
    width: 26px;
    min-height: 26px;
    max-height: 26px;
    height: 26px;
  }

  .mobile-layout .close-btn .icon-svg {
    width: 11px;
    height: 11px;
  }

  .mobile-layout .download-list {
    padding: 8px 10px;
  }

  .mobile-layout .download-item {
    padding: 8px;
    margin-bottom: 6px;
  }

  .mobile-layout .item-cover {
    width: 36px;
    height: 36px;
  }

  .mobile-layout .action-btn {
    min-width: 30px;
    max-width: 30px;
    width: 30px;
    min-height: 30px;
    max-height: 30px;
    height: 30px;
  }

  .mobile-layout .action-btn .icon-svg {
    width: 13px;
    height: 13px;
  }
}
</style>

