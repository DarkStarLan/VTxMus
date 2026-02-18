<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import SongList from '@/components/SongList.vue'
import Playlist from '@/components/Playlist.vue'
import { searchSongs, type Song } from '@/api/netease'
import { toast } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const searchResults = ref<Song[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const currentKeyword = ref('')
const currentOffset = ref(0)
const totalCount = ref(0)
const hasMore = ref(true)
const resultsContainer = ref<HTMLElement | null>(null)

async function performSearch(query: string) {
  if (!query) return

  loading.value = true
  currentKeyword.value = query
  currentOffset.value = 0
  hasMore.value = true

  try {
    const result = await searchSongs(query, 20, 0)
    searchResults.value = result.songs || []
    totalCount.value = result.songCount
    currentOffset.value = 20
    hasMore.value = searchResults.value.length < totalCount.value
  } catch (error) {
    console.error('搜索失败:', error)
    toast.error('搜索失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value || !currentKeyword.value) return

  loadingMore.value = true
  try {
    const result = await searchSongs(currentKeyword.value, 20, currentOffset.value)
    if (result.songs && result.songs.length > 0) {
      searchResults.value = [...searchResults.value, ...result.songs]
      currentOffset.value += result.songs.length
      hasMore.value = searchResults.value.length < totalCount.value
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    loadingMore.value = false
  }
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  if (scrollHeight - scrollTop - clientHeight < 200 && !loadingMore.value && hasMore.value) {
    loadMore()
  }
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  const query = route.query.q as string
  if (query) {
    performSearch(query)
  }

  const container = document.querySelector('.search-results-section')
  if (container) {
    resultsContainer.value = container as HTMLElement
    container.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (resultsContainer.value) {
    resultsContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
        </svg>
        返回
      </button>
      <div class="search-info">
        <h2>搜索结果</h2>
        <p v-if="!loading && searchResults.length > 0">找到 {{ totalCount }} 首歌曲</p>
      </div>
      <button @click="playerStore.togglePlaylist" class="playlist-toggle">
        {{ playerStore.showPlaylist ? '隐藏' : '显示' }}播放列表
      </button>
    </div>

    <div class="search-content">
      <div class="main-section">
        <div class="search-results-section">
          <div v-if="loading" class="loading">
            <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
            </svg>
            <p>搜索中...</p>
          </div>
          <div v-else-if="searchResults.length === 0" class="no-results">
            <svg class="no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
            </svg>
            <p>没有找到相关结果</p>
          </div>
          <div v-else class="results-wrapper">
            <SongList :songs="searchResults" />
            <div v-if="loadingMore" class="loading-more">
              <svg class="spinner-icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z"/>
              </svg>
              <span>加载中...</span>
            </div>
            <div v-else-if="!hasMore" class="no-more">
              <span>没有更多结果了</span>
            </div>
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
.search-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
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

.search-info {
  flex: 1;
  text-align: center;
}

.search-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
}

.search-info p {
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

.search-content {
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

.search-results-section {
  flex: 1;
  animation: fadeInUp 0.6s ease both;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 40px;
  padding-bottom: 120px;
  padding-right: 8px;
}

.search-results-section::-webkit-scrollbar {
  width: 8px;
  height: calc(100% - 80px);
}

.search-results-section::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 40px;
  margin-bottom: 80px;
}

.search-results-section::-webkit-scrollbar-thumb {
  background: rgba(138, 190, 185, 0.4);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.search-results-section::-webkit-scrollbar-thumb:hover {
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

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.no-results-icon {
  width: 80px;
  height: 80px;
  fill: rgba(138, 190, 185, 0.5);
  margin-bottom: 20px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.spinner-icon-small {
  width: 24px;
  height: 24px;
  fill: #8ABEB9;
  animation: spin 1s linear infinite;
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.no-more span {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
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

