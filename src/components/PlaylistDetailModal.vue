<template>
  <div class="playlist-detail-modal" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>歌单详情</h2>
        <button @click="close" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="loading">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
        </svg>
        <p>加载中...</p>
      </div>

      <div v-else-if="playlist" class="playlist-content">
        <div class="playlist-info">
          <img :src="playlist.coverImgUrl" :alt="playlist.name" class="playlist-cover" />
          <div class="info-text">
            <h3>{{ playlist.name }}</h3>
            <p class="creator">创建者: {{ playlist.creator?.nickname }}</p>
            <p class="description">{{ playlist.description || '暂无描述' }}</p>
            <p class="track-count">共 {{ playlist.trackCount }} 首歌曲</p>
          </div>
        </div>

        <div class="songs-list">
          <SongList :songs="songs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SongList from './SongList.vue'
import { getPlaylistDetail, type Song } from '@/api/netease'
import { toast } from '@/utils/toast'

const props = defineProps<{
  playlistId: number | null
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const playlist = ref<any>(null)
const songs = ref<Song[]>([])

watch(() => props.playlistId, async (id) => {
  if (id) {
    await loadPlaylist(id)
  }
}, { immediate: true })

async function loadPlaylist(id: number) {
  loading.value = true
  try {
    const data = await getPlaylistDetail(id)
    if (data) {
      playlist.value = data
      songs.value = data.tracks || []
    }
  } catch (error) {
    console.error('加载歌单失败:', error)
    toast.error('加载歌单失败')
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.playlist-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: linear-gradient(135deg, #1a2a32 0%, #305669 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  fill: rgba(255, 255, 255, 0.8);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 48px;
  height: 48px;
  fill: #8ABEB9;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.playlist-content::-webkit-scrollbar {
  width: 8px;
}

.playlist-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.playlist-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.playlist-info {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-text h3 {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.3;
}

.creator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  max-height: 80px;
  overflow-y: auto;
}

.track-count {
  font-size: 13px;
  color: rgba(138, 190, 185, 0.9);
  font-weight: 600;
}

.songs-list {
  margin-top: 24px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

