<template>
  <div class="recommend-section">
    <!-- 今日推荐 -->
    <div class="section-block">
      <div class="section-header">
        <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.3 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
        </svg>
        <h2>今日推荐</h2>
      </div>

      <div v-if="loadingRecommend" class="loading-state">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
        </svg>
        <span>加载中...</span>
      </div>

      <div v-else-if="recommendSongs.length > 0" class="songs-grid">
        <div
          v-for="song in recommendSongs"
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
    </div>

    <!-- 精选歌单 -->
    <div class="section-block">
      <div class="section-header">
        <svg class="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
        </svg>
        <h2>精选歌单</h2>
      </div>

      <div v-if="loadingPlaylists" class="loading-state">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getRecommendSongs, getRecommendPlaylists, type Song } from '@/api/netease'
import { toast } from '@/utils/toast'

const router = useRouter()
const playerStore = usePlayerStore()

const recommendSongs = ref<Song[]>([])
const playlists = ref<any[]>([])
const loadingRecommend = ref(false)
const loadingPlaylists = ref(false)

const emit = defineEmits<{
  openPlaylist: [id: number]
}>()

onMounted(async () => {
  await Promise.all([
    loadRecommendSongs(),
    loadPlaylists()
  ])
})

async function loadRecommendSongs() {
  loadingRecommend.value = true
  try {
    const songs = await getRecommendSongs(10)
    recommendSongs.value = songs
  } catch (error) {
    console.error('加载今日推荐失败:', error)
  } finally {
    loadingRecommend.value = false
  }
}

async function loadPlaylists() {
  loadingPlaylists.value = true
  try {
    const result = await getRecommendPlaylists(12)
    playlists.value = result
  } catch (error) {
    console.error('加载精选歌单失败:', error)
  } finally {
    loadingPlaylists.value = false
  }
}

async function playSong(song: Song) {
  try {
    // 检查歌曲是否已在播放列表中
    const existingIndex = playerStore.playlist.findIndex(s => s.id === song.id)
    if (existingIndex !== -1) {
      // 如果已存在，直接播放该位置的歌曲
      await playerStore.playSong(song, existingIndex)
    } else {
      // 如果不存在，添加到播放列表末尾并播放
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

function openPlaylist(id: number) {
  emit('openPlaylist', id)
}

function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}
</script>

<style scoped>
.recommend-section {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 28px;
  height: 28px;
  fill: #8ABEB9;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* 今日推荐歌曲网格 */
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
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

.song-card:hover .play-overlay,
.playlist-card:hover .play-overlay {
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

/* 精选歌单网格 */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
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
</style>

