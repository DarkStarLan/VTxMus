import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Song } from '@/api/netease'
import { getSongUrl } from '@/api/netease'
import { loadConfig, saveConfig } from '@/utils/storage'
import { QualityLevel } from '@/config/api'

export type PlayMode = 'sequence' | 'loop' | 'random'
export type MusicQuality = 'standard' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'

export const usePlayerStore = defineStore('player', () => {
  // 从本地存储加载配置
  const config = loadConfig()
  console.log('Player Store 初始化 - 加载的音质:', config.musicQuality)

  // 状态
  const currentSong = ref<Song | null>(config.currentSong)
  const playlist = ref<Song[]>(config.playlist)
  const currentIndex = ref(config.currentIndex)
  const isPlaying = ref(false) // 初始化时总是暂停，避免浏览器自动播放策略报错
  const playMode = ref<PlayMode>(config.playMode)
  const currentTime = ref(config.currentTime)
  const duration = ref(0)
  const volume = ref(config.volume)
  const favorites = ref<Set<number>>(new Set(config.favorites))
  const favoriteSongs = ref<Map<number, Song>>(new Map(config.favoriteSongs || []))
  const showPlaylist = ref(false) // 播放列表显示状态
  const musicQuality = ref<MusicQuality>(config.musicQuality || 'lossless') // 音质设置

  console.log('Player Store 初始化 - 设置的音质:', musicQuality.value)

  // 计算属性
  const progress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const hasNext = computed(() => {
    return playlist.value.length > 0 && currentIndex.value < playlist.value.length - 1
  })

  const hasPrev = computed(() => {
    return playlist.value.length > 0 && currentIndex.value > 0
  })

  // 方法
  async function playSong(song: Song, index?: number) {
    currentSong.value = song
    if (index !== undefined) {
      currentIndex.value = index
    }
    isPlaying.value = true

    try {
      // 获取播放 URL，使用当前音质设置
      const url = await getSongUrl(song.id, musicQuality.value)
      return url
    } catch (error) {
      console.error('播放失败:', error)
      isPlaying.value = false
      throw error
    }
  }

  function addToPlaylist(song: Song) {
    const exists = playlist.value.find(s => s.id === song.id)
    if (!exists) {
      playlist.value.push(song)
    }
  }

  function setPlaylist(songs: Song[], index = 0) {
    playlist.value = songs
    currentIndex.value = index
    if (songs[index]) {
      playSong(songs[index], index)
    }
  }

  function removeFromPlaylist(index: number) {
    playlist.value.splice(index, 1)
    if (currentIndex.value >= index && currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function clearPlaylist() {
    playlist.value = []
    currentIndex.value = -1
    currentSong.value = null
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value
  }

  function nextSong() {
    if (playlist.value.length === 0) return

    let nextIndex = currentIndex.value

    if (playMode.value === 'random') {
      nextIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'loop') {
      nextIndex = currentIndex.value // 单曲循环
    } else {
      nextIndex = (currentIndex.value + 1) % playlist.value.length
    }

    const nextSong = playlist.value[nextIndex]
    if (nextSong) {
      playSong(nextSong, nextIndex)
    }
  }

  function prevSong() {
    if (playlist.value.length === 0) return

    const prevIndex = currentIndex.value - 1 < 0
      ? playlist.value.length - 1
      : currentIndex.value - 1

    const prevSong = playlist.value[prevIndex]
    if (prevSong) {
      playSong(prevSong, prevIndex)
    }
  }

  function togglePlayMode() {
    const modes: PlayMode[] = ['sequence', 'loop', 'random']
    const currentModeIndex = modes.indexOf(playMode.value)
    const nextMode = modes[(currentModeIndex + 1) % modes.length]
    if (nextMode) {
      playMode.value = nextMode
    }
  }

  function toggleFavorite(songId: number) {
    if (favorites.value.has(songId)) {
      favorites.value.delete(songId)
      favoriteSongs.value.delete(songId)
    } else {
      favorites.value.add(songId)
      // 如果当前歌曲就是要收藏的歌曲，保存完整信息
      if (currentSong.value && currentSong.value.id === songId) {
        favoriteSongs.value.set(songId, currentSong.value)
      }
    }
    saveConfig({
      favorites: [...favorites.value],
      favoriteSongs: [...favoriteSongs.value.entries()]
    })
  }

  function addFavoriteSong(song: Song) {
    if (favorites.value.has(song.id)) {
      favoriteSongs.value.set(song.id, song)
      saveConfig({ favoriteSongs: [...favoriteSongs.value.entries()] })
    }
  }

  function isFavorite(songId: number) {
    return favorites.value.has(songId)
  }

  function togglePlaylist() {
    showPlaylist.value = !showPlaylist.value
  }

  function setMusicQuality(quality: MusicQuality) {
    console.log('setMusicQuality 被调用 - 新音质:', quality)
    console.log('setMusicQuality 被调用 - 旧音质:', musicQuality.value)
    musicQuality.value = quality
    console.log('setMusicQuality 被调用 - 更新后的音质:', musicQuality.value)
    saveConfig({ musicQuality: quality })
    console.log('setMusicQuality 被调用 - 已调用 saveConfig')

    // 验证保存
    const saved = loadConfig()
    console.log('setMusicQuality 被调用 - 验证保存的音质:', saved.musicQuality)
  }

  // 重新加载配置（用于导入数据后刷新状态）
  function reloadConfig() {
    const config = loadConfig()
    console.log('重新加载配置 - 音质:', config.musicQuality)

    volume.value = config.volume
    playMode.value = config.playMode
    currentSong.value = config.currentSong
    currentTime.value = config.currentTime
    isPlaying.value = config.isPlaying
    playlist.value = config.playlist
    currentIndex.value = config.currentIndex
    favorites.value = new Set(config.favorites)
    favoriteSongs.value = new Map(config.favoriteSongs || [])
    musicQuality.value = config.musicQuality || 'lossless'

    console.log('重新加载配置完成 - 当前音质:', musicQuality.value)
  }

  // 保存播放状态到本地存储
  function savePlayState() {
    saveConfig({
      volume: volume.value,
      playMode: playMode.value,
      currentSong: currentSong.value,
      currentTime: currentTime.value,
      isPlaying: isPlaying.value,
      playlist: playlist.value,
      currentIndex: currentIndex.value,
      favorites: [...favorites.value],
      musicQuality: musicQuality.value
    })
  }

  // 延迟启动监听器，避免在初始化时触发保存
  let watchersEnabled = false
  setTimeout(() => {
    watchersEnabled = true
  }, 1000)

  // 监听状态变化，自动保存
  watch([volume, playMode, currentSong, currentTime, playlist, currentIndex, isPlaying, musicQuality], () => {
    if (watchersEnabled) {
      savePlayState()
    }
  }, { deep: true })

  // 定期保存播放进度（每5秒）
  let saveTimer: number | null = null
  watch(currentTime, () => {
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    saveTimer = window.setTimeout(() => {
      savePlayState()
    }, 5000)
  })

  // 在窗口关闭前保存状态
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      savePlayState()
    })
  }

  return {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    playMode,
    currentTime,
    duration,
    volume,
    favorites,
    favoriteSongs,
    showPlaylist,
    musicQuality,
    progress,
    hasNext,
    hasPrev,
    playSong,
    addToPlaylist,
    setPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    togglePlay,
    nextSong,
    prevSong,
    togglePlayMode,
    toggleFavorite,
    addFavoriteSong,
    isFavorite,
    togglePlaylist,
    setMusicQuality,
    reloadConfig
  }
})

