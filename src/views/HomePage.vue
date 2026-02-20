<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import SearchBar from '@/components/SearchBar.vue'
import Playlist from '@/components/Playlist.vue'
import RecommendSection from '@/components/RecommendSection.vue'
import PlaylistDetailModal from '@/components/PlaylistDetailModal.vue'
import UserDataMenu from '@/components/UserDataMenu.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const selectedPlaylistId = ref<number | null>(null)

function handleSearch(query: string) {
  router.push({ path: '/search', query: { q: query } })
}

function goToFavorites() {
  router.push('/favorites')
}

function handleOpenPlaylist(id: number) {
  selectedPlaylistId.value = id
}

function closePlaylistModal() {
  selectedPlaylistId.value = null
}

function closePlaylist() {
  playerStore.showPlaylist = false
}
</script>

<template>
  <div class="home-page">
    <div class="app-header">
      <UserDataMenu />

      <div class="header-search">
        <SearchBar @search="handleSearch" />
      </div>

      <div class="header-right">
        <button @click="goToFavorites" class="favorites-btn" title="我的收藏">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/>
          </svg>
          <span>我的收藏</span>
        </button>

        <button @click="playerStore.togglePlaylist" class="playlist-toggle">
          {{ playerStore.showPlaylist ? '隐藏' : '显示' }}播放列表
        </button>
      </div>
    </div>

    <div class="app-content">
      <div class="main-section">
        <div class="content-section">
          <div class="welcome-banner">
            <svg class="welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256 32a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm-96-32a96 96 0 1 0 192 0 96 96 0 1 0 -192 0zm-56-16c0-32.4 16.3-66.6 42.8-93.2S207.6 104 240 104c13.3 0 24-10.7 24-24s-10.7-24-24-24c-47.9 0-93.7 23.5-127.1 56.9S56 192.1 56 240c0 13.3 10.7 24 24 24s24-10.7 24-24z"/>
            </svg>
            <h2>欢迎使用 VTxMus</h2>
            <p>搜索你喜欢的音乐开始播放</p>
          </div>
          <RecommendSection @open-playlist="handleOpenPlaylist" />
        </div>
      </div>

      <div v-if="playerStore.showPlaylist" class="playlist-overlay" @click.self="closePlaylist">
        <div class="playlist-section">
          <Playlist />
        </div>
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

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-search {
  flex: 1;
  max-width: 600px;
  animation: fadeIn 0.6s ease;
  position: relative;
  z-index: 1002;
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

.favorites-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #C1785A;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.favorites-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.favorites-btn:hover {
  background: rgba(193, 120, 90, 0.2);
  border-color: rgba(193, 120, 90, 0.3);
  transform: translateY(-2px);
}

.app-content {
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

.content-section {
  flex: 1;
  animation: fadeInUp 0.6s ease both;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 40px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.content-section::-webkit-scrollbar {
  display: none;
}

.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.playlist-section {
  position: fixed;
  right: 40px;
  top: 100px;
  bottom: 120px;
  width: 380px;
  animation: slideInRight 0.4s ease;
  overflow: hidden;
  z-index: 101;
  background: rgba(26, 42, 50, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 20px;
}

.welcome-banner {
  text-align: center;
  padding: 20px 20px 40px;
  animation: fadeIn 0.8s ease;
  flex-shrink: 0;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  fill: #8ABEB9;
  display: block;
  margin: 0 auto 20px;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(138, 190, 185, 0.3));
}

.welcome-banner h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-banner p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    padding: 12px 16px;
    gap: 10px;
    align-items: stretch;
  }

  .header-search {
    max-width: 100%;
    order: 2;
  }

  .header-right {
    order: 1;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .favorites-btn {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 13px;
  }

  .favorites-btn svg {
    width: 16px;
    height: 16px;
  }

  .playlist-toggle {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
  }

  .app-content {
    padding: 0 16px 16px 16px;
  }

  .content-section {
    padding-top: 16px;
    padding-bottom: 200px;
    gap: 24px;
  }

  .playlist-overlay {
    z-index: 100;
  }

  .playlist-section {
    position: fixed;
    right: 0;
    left: 0;
    top: auto;
    bottom: 0;
    width: 100%;
    max-height: 65vh;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    animation: slideInUp 0.3s ease;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 101;
  }

  .welcome-banner {
    padding: 16px 16px 24px;
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .welcome-banner h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .welcome-banner p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .favorites-btn {
    padding: 9px 10px;
    font-size: 12px;
  }

  .favorites-btn svg {
    width: 15px;
    height: 15px;
  }

  .playlist-toggle {
    padding: 9px 10px;
    font-size: 12px;
  }

  .content-section {
    padding-top: 12px;
    padding-bottom: 220px;
    gap: 20px;
  }

  .welcome-banner {
    padding: 12px 12px 20px;
  }

  .welcome-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  .welcome-banner h2 {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .welcome-banner p {
    font-size: 13px;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

