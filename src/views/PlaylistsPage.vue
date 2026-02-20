<template>
  <div class="playlists-page">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
        返回
      </button>

      <div class="page-title">
        <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
        </svg>
        <h1>精选歌单</h1>
      </div>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading-state">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
        </svg>
        <span>加载中...</span>
      </div>

      <div v-else-if="playlists.length > 0" class="playlists-grid">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-card"
          @click="openPlaylist(playlist.id)"
        >
          <div class="playlist-cover-wrapper">
            <img :src="playlist.picUrl" :alt="playlist.name" class="playlist-cover" />
            <div class="play-count">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4 142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-7.1 0-13.9-1.2-20.3-3.3-5.5-1.8-11.9 1.6-11.7 7.4.3 6.9 1.3 13.8 3.2 20.7 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1-5.8-.2-9.2 6.1-7.4 11.7 2.1 6.4 3.3 13.2 3.3 20.3z"/>
              </svg>
              {{ formatPlayCount(playlist.playCount) }}
            </div>
            <div class="play-overlay">
              <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
              </svg>
            </div>
          </div>
          <div class="playlist-info">
            <div class="playlist-name" :title="playlist.name">{{ playlist.name }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
        </svg>
        <p>暂无推荐歌单</p>
      </div>
    </div>

    <!-- 歌单详情弹窗 -->
    <PlaylistDetailModal
      v-if="selectedPlaylistId"
      :playlist-id="selectedPlaylistId"
      @close="closePlaylistModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendPlaylists } from '@/api/netease'
import { toast } from '@/utils/toast'
import PlaylistDetailModal from '@/components/PlaylistDetailModal.vue'

const router = useRouter()

const playlists = ref<any[]>([])
const loading = ref(false)
const selectedPlaylistId = ref<number | null>(null)

onMounted(async () => {
  await loadPlaylists()
})

async function loadPlaylists() {
  loading.value = true
  try {
    const result = await getRecommendPlaylists(50)
    playlists.value = result
  } catch (error) {
    console.error('加载精选歌单失败:', error)
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

function openPlaylist(id: number) {
  selectedPlaylistId.value = id
}

function closePlaylistModal() {
  selectedPlaylistId.value = null
}

function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.playlists-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-4px);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 32px;
  height: 32px;
  fill: #8ABEB9;
}

.page-title h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  padding-bottom: 120px;
}

.page-content::-webkit-scrollbar {
  display: none;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 32px;
  height: 32px;
  fill: #8ABEB9;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  animation: fadeIn 0.5s ease;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

.playlist-card:hover {
  transform: translateY(-8px);
}

.playlist-cover-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.2);
}

.playlist-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.playlist-card:hover .playlist-cover {
  transform: scale(1.1);
}

.play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  backdrop-filter: blur(4px);
}

.play-count svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 48px;
  height: 48px;
  fill: #fff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.playlist-info {
  margin-top: 12px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  width: 80px;
  height: 80px;
  fill: currentColor;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px;
    gap: 16px;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .back-btn svg {
    width: 14px;
    height: 14px;
  }

  .title-icon {
    width: 28px;
    height: 28px;
  }

  .page-title h1 {
    font-size: 24px;
  }

  .page-content {
    padding: 20px;
    padding-bottom: 200px;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .playlist-cover-wrapper {
    border-radius: 10px;
  }

  .play-icon {
    width: 40px;
    height: 40px;
  }

  .playlist-info {
    margin-top: 10px;
  }

  .playlist-name {
    font-size: 13px;
  }

  .play-count {
    top: 6px;
    right: 6px;
    padding: 3px 6px;
    font-size: 11px;
    border-radius: 10px;
  }

  .play-count svg {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 12px 16px;
    gap: 12px;
  }

  .back-btn {
    padding: 7px 14px;
    font-size: 12px;
  }

  .title-icon {
    width: 24px;
    height: 24px;
  }

  .page-title h1 {
    font-size: 20px;
  }

  .page-content {
    padding: 16px;
    padding-bottom: 220px;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .playlist-cover-wrapper {
    border-radius: 8px;
  }

  .play-icon {
    width: 36px;
    height: 36px;
  }

  .playlist-info {
    margin-top: 8px;
  }

  .playlist-name {
    font-size: 12px;
    min-height: 36px;
  }

  .play-count {
    top: 5px;
    right: 5px;
    padding: 2px 5px;
    font-size: 10px;
    border-radius: 8px;
  }

  .play-count svg {
    width: 11px;
    height: 11px;
  }
}
</style>

