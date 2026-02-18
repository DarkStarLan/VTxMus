<template>
  <div class="song-list">
    <div v-if="songs.length === 0" class="empty-state">
      <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M468 7c7.6 6.1 12 15.3 12 25l0 304c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6l0-116.7-224 49.8 0 206.3c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6L128 96c0-15 10.4-28 25.1-31.2l288-64c9.5-2.1 19.4 .2 27 6.3z"/>
      </svg>
      <p>暂无歌曲</p>
    </div>
    <div v-else class="song-items">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-item"
        :class="{ active: isCurrentSong(song.id) }"
        @click="goToPlayPage(song, index)"
        @dblclick="playSong(song, index)"
      >
        <div class="song-index">{{ index + 1 }}</div>
        <img :src="song.album.picUrl" :alt="song.name" class="song-cover" />
        <div class="song-details">
          <div class="song-title">{{ song.name }}</div>
          <div class="song-artist">{{ song.artists.map(a => a.name).join(' / ') }}</div>
        </div>
        <div class="song-album">{{ song.album.name }}</div>
        <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        <div class="song-actions">
          <button @click.stop="toggleFavorite(song)" class="action-btn favorite-btn" :class="{ active: playerStore.isFavorite(song.id) }">
            <svg v-if="playerStore.isFavorite(song.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"/>
            </svg>
          </button>
          <button @click.stop="addToPlaylist(song)" class="action-btn add-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import type { Song } from '@/api/netease'
import { toast } from '@/utils/toast'

const props = defineProps<{
  songs: Song[]
}>()

const router = useRouter()
const playerStore = usePlayerStore()

async function goToPlayPage(song: Song, index: number) {
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

async function playSong(song: Song, index: number) {
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
  } catch (error) {
    console.error('播放失败:', error)
    toast.error(`播放失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

function addToPlaylist(song: Song) {
  playerStore.addToPlaylist(song)
}

function toggleFavorite(song: Song) {
  playerStore.toggleFavorite(song.id)
  playerStore.addFavoriteSong(song)
}

function isCurrentSong(songId: number) {
  return playerStore.currentSong?.id === songId
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.song-list {
  width: 100%;
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  width: 80px;
  height: 80px;
  fill: rgba(138, 190, 185, 0.5);
  display: block;
  margin: 0 auto 16px;
}

.song-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 20px;
}

.song-item {
  display: grid;
  grid-template-columns: 40px 56px 1fr 200px 80px 100px;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.song-item.active {
  background: rgba(138, 190, 185, 0.2);
  border-left: 3px solid #8ABEB9;
}

.song-index {
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.song-details {
  min-width: 0;
}

.song-title {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
}

.song-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.6;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  fill: rgba(183, 229, 205, 0.75);
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.action-btn:hover svg {
  fill: rgba(183, 229, 205, 1);
}

.favorite-btn.active svg {
  fill: #C1785A;
}

.favorite-btn.active:hover svg {
  fill: #d88a6d;
}

.add-btn svg {
  fill: rgba(183, 229, 205, 0.75);
}

.add-btn:hover svg {
  fill: rgba(183, 229, 205, 1);
}
</style>

