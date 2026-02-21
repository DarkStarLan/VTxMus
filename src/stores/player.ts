import { defineStore } from 'pinia'
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Song } from '@/api/netease'
import { getSongUrl, getHotSongs, getLyric } from '@/api/netease'
import { loadConfig, saveConfig } from '@/utils/storage'
import { QualityLevel } from '@/config/api'
import { parseLyric, type LyricLine } from '@/utils/lyric'
import { isElectron, sendToMain, onMainMessage } from '@/utils/electron-bridge'

export type PlayMode = 'sequence' | 'loop' | 'random' | 'recommend'
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

  // 桌面歌词相关状态（仅在 Electron 环境中使用）
  const showDesktopLyric = ref(false)
  const parsedLyrics = ref<LyricLine[]>([])
  const parsedLyricsTrans = ref<LyricLine[]>([])
  const currentLyricText = ref('')
  const isLyricLocked = ref(false)
  const lyricWindowSize = ref<'small' | 'medium' | 'large'>('medium')
  const lyricWindowOrientation = ref<'horizontal' | 'vertical'>('horizontal')

  console.log('Player Store 初始化 - 设置的音质:', musicQuality.value)

  // 计算属性
  const progress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const hasNext = computed(() => {
    // 推荐模式下始终可以点击下一首
    if (playMode.value === 'recommend') {
      return true
    }
    // 顺序播放模式下，只要有歌曲就可以点击下一首（循环到第一首）
    if (playMode.value === 'sequence') {
      return playlist.value.length > 0
    }
    return playlist.value.length > 0 && currentIndex.value < playlist.value.length - 1
  })

  const hasPrev = computed(() => {
    // 顺序播放模式下，只要有歌曲就可以点击上一首（循环到最后一首）
    if (playMode.value === 'sequence') {
      return playlist.value.length > 0
    }
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
    } else if (playMode.value === 'recommend') {
      // 推荐模式：先检查播放列表是否有下一首
      if (currentIndex.value < playlist.value.length - 1) {
        // 有下一首，播放下一首
        nextIndex = currentIndex.value + 1
        const nextSong = playlist.value[nextIndex]
        if (nextSong) {
          playSong(nextSong, nextIndex)
        }
      } else {
        // 没有下一首，播放随机热门歌曲
        playRecommendSong()
      }
      return
    } else {
      // 顺序播放模式：循环到第一首
      nextIndex = (currentIndex.value + 1) % playlist.value.length
    }

    const nextSong = playlist.value[nextIndex]
    if (nextSong) {
      playSong(nextSong, nextIndex)
    }
  }

  // 播放推荐的热门歌曲
  async function playRecommendSong() {
    try {
      // 获取热门歌曲列表
      const hotSongs = await getHotSongs(100)

      if (hotSongs.length === 0) {
        console.warn('未获取到热门歌曲，切换到顺序播放')
        // 如果获取失败，回退到顺序播放
        const nextIndex = (currentIndex.value + 1) % playlist.value.length
        const nextSong = playlist.value[nextIndex]
        if (nextSong) {
          playSong(nextSong, nextIndex)
        }
        return
      }

      // 过滤掉当前正在播放的歌曲
      const filteredSongs = hotSongs.filter(song => song.id !== currentSong.value?.id)

      if (filteredSongs.length === 0) {
        console.warn('所有热门歌曲都已播放，重新获取')
        // 如果所有歌曲都播放过了，就不过滤
        const randomIndex = Math.floor(Math.random() * hotSongs.length)
        const randomSong = hotSongs[randomIndex]

        // 将推荐的歌曲添加到播放列表
        if (randomSong) {
          addToPlaylist(randomSong)
          const newIndex = playlist.value.findIndex(s => s.id === randomSong.id)
          playSong(randomSong, newIndex)
        }
        return
      }

      // 随机选择一首热门歌曲
      const randomIndex = Math.floor(Math.random() * filteredSongs.length)
      const randomSong = filteredSongs[randomIndex]

      // 将推荐的歌曲添加到播放列表
      if (randomSong) {
        addToPlaylist(randomSong)
        const newIndex = playlist.value.findIndex(s => s.id === randomSong.id)
        playSong(randomSong, newIndex)
      }
    } catch (error) {
      console.error('播放推荐歌曲失败:', error)
      // 出错时回退到顺序播放
      const nextIndex = (currentIndex.value + 1) % playlist.value.length
      const nextSong = playlist.value[nextIndex]
      if (nextSong) {
        playSong(nextSong, nextIndex)
      }
    }
  }

  function prevSong() {
    if (playlist.value.length === 0) return

    // 顺序播放模式：循环到最后一首
    const prevIndex = currentIndex.value - 1 < 0
      ? playlist.value.length - 1
      : currentIndex.value - 1

    const prevSong = playlist.value[prevIndex]
    if (prevSong) {
      playSong(prevSong, prevIndex)
    }
  }

  function togglePlayMode() {
    const modes: PlayMode[] = ['sequence', 'loop', 'random', 'recommend']
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

  // 桌面歌词相关方法
  /**
   * 加载歌词（仅在 Electron 环境中）
   */
  async function loadLyric(songId: number) {
    if (!isElectron()) return

    try {
      console.log('开始加载歌词，歌曲ID:', songId)
      const lyric = await getLyric(songId)
      console.log('获取到的歌词数据:', lyric)
      
      // 解析原文歌词
      parsedLyrics.value = parseLyric(lyric.lrc.lyric)
      console.log('解析后的歌词数量:', parsedLyrics.value.length)
      
      // 解析翻译歌词（如果有）
      if (lyric.tlyric && lyric.tlyric.lyric) {
        parsedLyricsTrans.value = parseLyric(lyric.tlyric.lyric)
        console.log('解析后的翻译歌词数量:', parsedLyricsTrans.value.length)
      } else {
        parsedLyricsTrans.value = []
        console.log('没有翻译歌词')
      }

      if (showDesktopLyric.value) {
        console.log('歌词窗口已打开，发送歌词')
        // 转换为普通数组，避免 IPC 序列化错误
        const lyricsData = JSON.parse(JSON.stringify(parsedLyrics.value))
        const lyricsTransData = JSON.parse(JSON.stringify(parsedLyricsTrans.value))
        sendToMain('update-lyric', { 
          lyrics: lyricsData,
          lyricsTrans: lyricsTransData
        })
      }
    } catch (error) {
      console.error('加载歌词失败:', error)
      parsedLyrics.value = []
      parsedLyricsTrans.value = []
    }
  }

  /**
   * 切换桌面歌词显示/隐藏
   */
  async function toggleDesktopLyric() {
    if (!isElectron()) return

    // 如果歌词窗口已锁定，先解锁
    if (isLyricLocked.value) {
      console.log('歌词窗口已锁定，先解锁')
      unlockLyric()
      return
    }

    // 切换显示/隐藏
    showDesktopLyric.value = !showDesktopLyric.value
    sendToMain('toggle-lyric-window', showDesktopLyric.value)

    if (showDesktopLyric.value) {
      // 如果有当前歌曲但没有歌词，先加载歌词
      if (currentSong.value && parsedLyrics.value.length === 0) {
        console.log('打开桌面歌词时没有歌词数据，立即加载')
        await loadLyric(currentSong.value.id)
      }

      // 发送歌词数据到窗口
      if (parsedLyrics.value.length > 0) {
        const lyricsData = JSON.parse(JSON.stringify(parsedLyrics.value))
        const lyricsTransData = JSON.parse(JSON.stringify(parsedLyricsTrans.value))
        console.log('发送歌词到歌词窗口，数量:', lyricsData.length)
        sendToMain('update-lyric', { 
          lyrics: lyricsData,
          lyricsTrans: lyricsTransData
        })
        // 同时发送当前播放时间
        sendToMain('update-current-time', currentTime.value)
      }
    }
  }

  /**
   * 解锁歌词窗口
   */
  function unlockLyric() {
    if (!isElectron()) return
    console.log('解锁歌词窗口')
    isLyricLocked.value = false
    sendToMain('unlock-lyric-window')
  }

  /**
   * 设置歌词锁定状态（从歌词窗口接收）
   */
  function setLyricLocked(locked: boolean) {
    isLyricLocked.value = locked
  }

  /**
   * 设置歌词窗口大小
   */
  function setLyricWindowSize(size: 'small' | 'medium' | 'large') {
    if (!isElectron()) return
    lyricWindowSize.value = size
    sendToMain('set-lyric-window-size', size)
  }

  /**
   * 切换歌词窗口方向
   */
  function toggleLyricOrientation() {
    if (!isElectron()) return
    lyricWindowOrientation.value = lyricWindowOrientation.value === 'horizontal' ? 'vertical' : 'horizontal'
    sendToMain('set-lyric-orientation', lyricWindowOrientation.value)
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

  // 监听歌曲变化，自动加载歌词（仅在 Electron 环境中）
  watch(() => currentSong.value, async (song) => {
    console.log('歌曲变化监听触发，歌曲:', song)
    console.log('是否 Electron 环境:', isElectron())
    if (song && isElectron()) {
      console.log('准备加载歌词，歌曲ID:', song.id)
      await loadLyric(song.id)

      // 如果桌面歌词窗口已打开，立即发送新歌词
      if (showDesktopLyric.value && parsedLyrics.value.length > 0) {
        console.log('桌面歌词已打开，发送新歌词到窗口')
        const lyricsData = JSON.parse(JSON.stringify(parsedLyrics.value))
        const lyricsTransData = JSON.parse(JSON.stringify(parsedLyricsTrans.value))
        sendToMain('update-lyric', { 
          lyrics: lyricsData,
          lyricsTrans: lyricsTransData
        })
        // 重置播放时间为0，确保歌词从头开始
        sendToMain('update-current-time', 0)
      }
    }
  }, { immediate: true })

  // 监听播放时间，更新当前歌词（仅在 Electron 环境中）
  watch(() => currentTime.value, (time) => {
    if (isElectron() && showDesktopLyric.value && parsedLyrics.value.length > 0) {
      sendToMain('update-current-time', time)
    }
  })

  // 监听播放状态变化，确保桌面歌词有数据（仅在 Electron 环境中）
  watch(() => isPlaying.value, async (playing) => {
    if (playing && isElectron() && showDesktopLyric.value && currentSong.value) {
      console.log('播放状态变化，检查桌面歌词数据')

      // 如果没有歌词数据，立即加载
      if (parsedLyrics.value.length === 0) {
        console.log('开始播放时检测到桌面歌词无数据，立即加载')
        await loadLyric(currentSong.value.id)
      }

      // 无论是否刚加载，都发送到窗口（确保窗口有数据）
      if (parsedLyrics.value.length > 0) {
        console.log('发送歌词数据到桌面歌词窗口')
        const lyricsData = JSON.parse(JSON.stringify(parsedLyrics.value))
        const lyricsTransData = JSON.parse(JSON.stringify(parsedLyricsTrans.value))
        sendToMain('update-lyric', { 
          lyrics: lyricsData,
          lyricsTrans: lyricsTransData
        })
        sendToMain('update-current-time', currentTime.value)
      }
    }
  })

  // 在 Electron 环境中，使用定时器确保时间更新（即使不在播放器页面）
  if (typeof window !== 'undefined' && isElectron()) {
    let timeUpdateInterval: number | null = null

    watch(() => isPlaying.value, (playing) => {
      if (playing) {
        // 开始播放时，启动定时器更新时间
        if (!timeUpdateInterval) {
          timeUpdateInterval = window.setInterval(() => {
            if (isPlaying.value && duration.value > 0) {
              currentTime.value = Math.min(currentTime.value + 0.1, duration.value)
            }
          }, 100) // 每100ms更新一次
        }
      } else {
        // 暂停时，清除定时器
        if (timeUpdateInterval) {
          clearInterval(timeUpdateInterval)
          timeUpdateInterval = null
        }
      }
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

    // 监听歌词锁定状态变化（从歌词窗口）
    if (isElectron()) {
      onMainMessage('lyric-lock-changed', (locked: boolean) => {
        console.log('收到歌词锁定状态变化:', locked)
        isLyricLocked.value = locked
      })

      // 监听歌词窗口关闭事件
      onMainMessage('lyric-window-closed', () => {
        console.log('收到歌词窗口关闭通知')
        showDesktopLyric.value = false
        isLyricLocked.value = false
      })

      // 监听恢复桌面歌词状态
      onMainMessage('restore-lyric-window-state', (isVisible: boolean) => {
        console.log('恢复桌面歌词状态:', isVisible)
        showDesktopLyric.value = isVisible
        
        // 如果有当前歌曲，加载歌词
        if (isVisible && currentSong.value) {
          loadLyric(currentSong.value.id).then(() => {
            if (parsedLyrics.value.length > 0) {
              const lyricsData = JSON.parse(JSON.stringify(parsedLyrics.value))
              const lyricsTransData = JSON.parse(JSON.stringify(parsedLyricsTrans.value))
              sendToMain('update-lyric', { 
                lyrics: lyricsData,
                lyricsTrans: lyricsTransData
              })
              sendToMain('update-current-time', currentTime.value)
            }
          })
        }
      })
    }
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
    reloadConfig,
    // 桌面歌词相关
    showDesktopLyric,
    toggleDesktopLyric,
    currentLyricText,
    isLyricLocked,
    setLyricLocked,
    lyricWindowSize,
    setLyricWindowSize,
    lyricWindowOrientation,
    toggleLyricOrientation
  }
})

