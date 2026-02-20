<template>
  <div class="recommend-songs-page">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
        返回
      </button>

      <div class="page-title">
        <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.3 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
        </svg>
        <h1>今日推荐</h1>
      </div>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading-state">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
        </svg>
        <span>加载中...</span>
      </div>

      <div v-else-if="songs.length > 0" class="songs-grid">
        <div
          v-for="song in songs"
          :key="song.id"
          class="song-card"
          @click="playSong(song)"
        >
          <div class="song-cover-wrapper">
            <img :src="song.album.picUrl" :alt="song.name" class="song-cover" />
            <div class="play-overlay">
              <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
              </svg>
            </div>
          </div>
          <div class="song-info">
            <div class="song-name" :title="song.name">{{ song.name }}</div>
            <div class="song-artist" :title="song.artists.map(a => a.name).join(' / ')">
              {{ song.artists.map(a => a.name).join(' / ') }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
        </svg>
        <p>暂无推荐歌曲</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getRecommendSongs, type Song } from '@/api/netease'
import { toast } from '@/utils/toast'

const router = useRouter()
const playerStore = usePlayerStore()

const songs = ref<Song[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadSongs()
})

async function loadSongs() {
  loading.value = true
  try {
    const result = await getRecommendSongs(50)
    songs.value = result
  } catch (error) {
    console.error('加载今日推荐失败:', error)
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function playSong(song: Song) {
  try {
    const existingIndex = playerStore.playlist.findIndex(s => s.id === song.id)
    if (existingIndex !== -1) {
      await playerStore.playSong(song, existingIndex)
    } else {
      playerStore.addToPlaylist(song)
      const newIndex = playerStore.playlist.length - 1
      await playerStore.playSong(song, newIndex)
    }
    router.push('/play')
  } catch (error) {
    console.error('播放失败:', error)
    toast.error(`播放失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.recommend-songs-page {
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

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  animation: fadeIn 0.5s ease;
}

.song-card {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

.song-card:hover {
  transform: translateY(-8px);
}

.song-cover-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.2);
}

.song-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.song-card:hover .song-cover {
  transform: scale(1.1);
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

.song-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 48px;
  height: 48px;
  fill: #fff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.song-info {
  margin-top: 12px;
}

.song-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .song-cover-wrapper {
    border-radius: 10px;
  }

  .play-icon {
    width: 40px;
    height: 40px;
  }

  .song-info {
    margin-top: 10px;
  }

  .song-name {
    font-size: 13px;
  }

  .song-artist {
    font-size: 11px;
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

  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .song-cover-wrapper {
    border-radius: 8px;
  }

  .play-icon {
    width: 36px;
    height: 36px;
  }

  .song-info {
    margin-top: 8px;
  }

  .song-name {
    font-size: 12px;
  }

  .song-artist {
    font-size: 10px;
  }
}
</style>

