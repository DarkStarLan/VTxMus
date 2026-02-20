<template>
  <div class="playlist-panel">
    <div class="playlist-header">
      <h3>播放列表 ({{ playerStore.playlist.length }})</h3>
      <button @click="playerStore.clearPlaylist" class="clear-btn">清空</button>
    </div>
    <div class="playlist-content">
      <div v-if="playerStore.playlist.length === 0" class="empty">
        <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="currentColor" d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"/>
        </svg>
        <p>播放列表为空</p>
      </div>
      <div v-else class="playlist-items">
        <div
          v-for="(song, index) in playerStore.playlist"
          :key="song.id"
          class="playlist-item"
          :class="{ active: index === playerStore.currentIndex }"
          @click="playSong(index)"
        >
          <div class="item-info">
            <div class="item-name">{{ song.name }}</div>
            <div class="item-artist">{{ song.artists.map(a => a.name).join(' / ') }}</div>
          </div>
          <button @click.stop="removeFromPlaylist(index)" class="remove-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

function playSong(index: number) {
  const song = playerStore.playlist[index]
  if (song) {
    playerStore.playSong(song, index)
  }
}

function removeFromPlaylist(index: number) {
  playerStore.removeFromPlaylist(index)
}
</script>

<style scoped>
.playlist-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.playlist-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.playlist-content::-webkit-scrollbar {
  width: 6px;
}

.playlist-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.playlist-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.playlist-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  width: 64px;
  height: 64px;
  fill: rgba(138, 190, 185, 0.5);
  display: block;
  margin: 0 auto 12px;
}

.playlist-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.playlist-item.active {
  background: rgba(138, 190, 185, 0.2);
  border-left: 3px solid #8ABEB9;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 1);
}

.remove-btn svg {
  width: 12px;
  height: 12px;
  fill: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.remove-btn:hover svg {
  fill: rgba(255, 255, 255, 1);
  transform: scale(1.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .playlist-header h3 {
    font-size: 16px;
  }

  .clear-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .playlist-item {
    padding: 10px;
  }

  .item-name {
    font-size: 13px;
  }

  .item-artist {
    font-size: 11px;
  }

  .remove-btn {
    width: 32px;
    height: 32px;
    padding: 8px;
  }

  .remove-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .playlist-header h3 {
    font-size: 15px;
  }

  .clear-btn {
    padding: 5px 10px;
    font-size: 11px;
  }

  .playlist-item {
    padding: 8px;
  }

  .item-name {
    font-size: 12px;
  }

  .item-artist {
    font-size: 10px;
  }

  .empty {
    padding: 30px 20px;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .remove-btn {
    min-width: 44px;
    min-height: 44px;
  }

  .playlist-item:active {
    background: rgba(255, 255, 255, 0.12);
  }
}
</style>


