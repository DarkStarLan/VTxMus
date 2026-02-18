<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import SongList from '@/components/SongList.vue'
import Playlist from '@/components/Playlist.vue'
import { getSongDetail, type Song } from '@/api/netease'

const router = useRouter()
const playerStore = usePlayerStore()

const favoriteSongs = ref<Song[]>([])
const loading = ref(false)

function goBack() {
  router.push('/')
}

async function loadFavorites() {
  loading.value = true
  try {
    const favoriteIds = Array.from(playerStore.favorites)
    console.log('收藏的歌曲 ID:', favoriteIds)
    console.log('favorites Set:', playerStore.favorites)
    console.log('favoriteSongs Map:', playerStore.favoriteSongs)

    if (favoriteIds.length === 0) {
      favoriteSongs.value = []
      return
    }

    // 从 store 中获取已保存的歌曲信息
    const songs: Song[] = []
    const missingSongIds: number[] = []

    for (const id of favoriteIds) {
      const song = playerStore.favoriteSongs.get(id)
      if (song) {
        songs.push(song)
      } else {
        missingSongIds.push(id)
      }
    }

    // 如果有缺失的歌曲信息，从 API 获取
    if (missingSongIds.length > 0) {
      console.log('需要从 API 获取的歌曲 ID:', missingSongIds)
      const missingSongs = await getSongDetail(missingSongIds)
      console.log('从 API 获取到的歌曲详情:', missingSongs)

      // 保存到 store
      missingSongs.forEach(song => {
        playerStore.addFavoriteSong(song)
        songs.push(song)
      })
    }

    favoriteSongs.value = songs
    console.log('最终加载的收藏歌曲:', songs)
  } catch (error) {
    console.error('加载收藏失败:', error)
    favoriteSongs.value = []
  } finally {
    loading.value = false
  }
}

// 监听收藏列表变化，自动刷新
watch(() => playerStore.favorites.size, () => {
  loadFavorites()
})

onMounted(() => {
  loadFavorites()
})
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-header">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
        返回
      </button>
      <div class="favorites-info">
        <h2>我的收藏</h2>
        <p v-if="!loading && favoriteSongs.length > 0">共 {{ favoriteSongs.length }} 首歌曲</p>
      </div>
      <button @click="playerStore.togglePlaylist" class="playlist-toggle">
        {{ playerStore.showPlaylist ? '隐藏' : '显示' }}播放列表
      </button>
    </div>

    <div class="favorites-content">
      <div class="main-section">
        <div class="favorites-results-section">
          <div v-if="loading" class="loading">
            <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
            </svg>
            <p>加载中...</p>
          </div>
          <div v-else-if="favoriteSongs.length === 0" class="no-favorites">
            <svg class="no-favorites-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"/>
            </svg>
            <p>还没有收藏的歌曲</p>
            <button @click="goBack" class="back-home-btn">去首页看看</button>
          </div>
          <div v-else class="results-wrapper">
            <SongList :songs="favoriteSongs" />
          </div>
        </div>
      </div>

      <div v-if="playerStore.showPlaylist" class="playlist-section">
        <Playlist />
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  gap: 24px;
  position: relative;
  z-index: 1001;
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
  flex-shrink: 0;
}

.back-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.favorites-info {
  flex: 1;
  text-align: center;
}

.favorites-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
}

.favorites-info p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.playlist-toggle {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.playlist-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.favorites-content {
  flex: 1;
  display: flex;
  padding: 0 40px 32px 40px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

.main-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.favorites-results-section {
  flex: 1;
  animation: fadeInUp 0.6s ease both;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 40px;
  padding-bottom: 120px;
  padding-right: 8px;
}

.favorites-results-section::-webkit-scrollbar {
  width: 8px;
}

.favorites-results-section::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 40px;
  margin-bottom: 80px;
}

.favorites-results-section::-webkit-scrollbar-thumb {
  background: rgba(138, 190, 185, 0.4);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.favorites-results-section::-webkit-scrollbar-thumb:hover {
  background: rgba(138, 190, 185, 0.6);
}

.results-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playlist-section {
  position: fixed;
  right: 40px;
  top: 100px;
  bottom: 120px;
  width: 380px;
  animation: slideInRight 0.4s ease;
  overflow: hidden;
  z-index: 100;
  background: rgba(26, 42, 50, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner-icon {
  width: 64px;
  height: 64px;
  fill: #8ABEB9;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.no-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.no-favorites-icon {
  width: 80px;
  height: 80px;
  fill: rgba(193, 120, 90, 0.5);
  margin-bottom: 20px;
}

.no-favorites p {
  font-size: 16px;
  margin-bottom: 24px;
}

.back-home-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  border: none;
  border-radius: 24px;
  color: #305669;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(138, 190, 185, 0.3);
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(138, 190, 185, 0.4);
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

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

