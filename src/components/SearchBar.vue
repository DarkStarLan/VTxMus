<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
      </svg>
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        @focus="showHistory = true"
        @blur="hideHistory"
        placeholder="搜索歌曲、歌手、专辑..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/>
        </svg>
      </button>

      <!-- 搜索历史下拉框 -->
      <div v-if="showHistory && searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span>搜索历史</span>
          <button @click="handleClearHistory" class="clear-history-btn">清空</button>
        </div>
        <div class="history-items">
          <div
            v-for="item in searchHistory"
            :key="item"
            class="history-item"
            @mousedown="selectHistory(item)"
          >
            <svg class="history-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"/>
            </svg>
            <span class="history-text">{{ item }}</span>
            <button @click.stop="removeHistory(item)" class="remove-history-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <button @click="handleSearch" class="search-btn">搜索</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSearchHistory, addSearchHistory, clearSearchHistory, removeSearchHistory } from '@/utils/storage'

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref('')
const searchHistory = ref<string[]>([])
const showHistory = ref(false)

onMounted(() => {
  searchHistory.value = getSearchHistory()
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    addSearchHistory(query)
    searchHistory.value = getSearchHistory()
    showHistory.value = false
    emit('search', query)
  }
}

function clearSearch() {
  searchQuery.value = ''
}

function selectHistory(item: string) {
  searchQuery.value = item
  showHistory.value = false
  emit('search', item)
}

function removeHistory(item: string) {
  removeSearchHistory(item)
  searchHistory.value = getSearchHistory()
}

function handleClearHistory() {
  clearSearchHistory()
  searchHistory.value = []
}

function hideHistory() {
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1002;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1002;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  fill: rgba(138, 190, 185, 0.6);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 48px 14px 48px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  border-color: #8ABEB9;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(138, 190, 185, 0.15);
}

.clear-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 20px;
  height: 20px;
}

.clear-btn svg {
  width: 14px;
  height: 14px;
  fill: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.clear-btn:hover svg {
  fill: #fff;
  transform: scale(1.1);
}

.search-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  border: none;
  border-radius: 24px;
  color: #305669;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(138, 190, 185, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(138, 190, 185, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.search-history {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(26, 42, 50, 0.98);
  border: 1px solid rgba(138, 190, 185, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1003;
  overflow: hidden;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.clear-history-btn {
  background: none;
  border: none;
  color: rgba(138, 190, 185, 0.8);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  color: #8ABEB9;
  background: rgba(138, 190, 185, 0.1);
}

.history-items {
  max-height: 300px;
  overflow-y: auto;
}

.history-items::-webkit-scrollbar {
  width: 6px;
}

.history-items::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.history-items::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(138, 190, 185, 0.1);
}

.history-icon {
  width: 16px;
  height: 16px;
  fill: rgba(138, 190, 185, 0.6);
  flex-shrink: 0;
}

.history-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-history-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: all 0.2s ease;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.history-item:hover .remove-history-btn {
  opacity: 0.6;
}

.remove-history-btn:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.1);
}

.remove-history-btn svg {
  width: 10px;
  height: 10px;
  fill: rgba(255, 255, 255, 0.6);
}
</style>

