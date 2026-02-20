// 本地存储管理工具

export interface UserConfig {
  volume: number
  playMode: 'sequence' | 'loop' | 'random' | 'recommend'
  currentSong: {
    id: number
    name: string
    artists: Array<{ id: number; name: string }>
    album: { id: number; name: string; picUrl: string }
    duration: number
  } | null
  currentTime: number
  isPlaying: boolean
  playlist: Array<{
    id: number
    name: string
    artists: Array<{ id: number; name: string }>
    album: { id: number; name: string; picUrl: string }
    duration: number
  }>
  currentIndex: number
  searchHistory: string[]
  favorites: number[]
  musicQuality?: 'standard' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
  favoriteSongs?: Array<[number, {
    id: number
    name: string
    artists: Array<{ id: number; name: string }>
    album: { id: number; name: string; picUrl: string }
    duration: number
  }]>
}

const STORAGE_KEY = 'vtxmus_config'
const MAX_SEARCH_HISTORY = 10

// 默认配置
const defaultConfig: UserConfig = {
  volume: 0.7,
  playMode: 'sequence',
  currentSong: null,
  currentTime: 0,
  isPlaying: false,
  playlist: [],
  currentIndex: -1,
  searchHistory: [],
  favorites: [],
  musicQuality: 'lossless'
}

// 加载配置
export function loadConfig(): UserConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      const merged = { ...defaultConfig, ...config }
      return merged
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
  return defaultConfig
}

// 保存配置
export function saveConfig(config: Partial<UserConfig>): void {
  try {
    const current = loadConfig()
    const updated = { ...current, ...config }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 添加搜索历史
export function addSearchHistory(keyword: string): void {
  if (!keyword.trim()) return

  const config = loadConfig()
  const history = config.searchHistory.filter(item => item !== keyword)
  history.unshift(keyword)

  // 限制历史记录数量
  if (history.length > MAX_SEARCH_HISTORY) {
    history.pop()
  }

  saveConfig({ searchHistory: history })
}

// 获取搜索历史
export function getSearchHistory(): string[] {
  return loadConfig().searchHistory
}

// 清空搜索历史
export function clearSearchHistory(): void {
  saveConfig({ searchHistory: [] })
}

// 删除单条搜索历史
export function removeSearchHistory(keyword: string): void {
  const config = loadConfig()
  const history = config.searchHistory.filter(item => item !== keyword)
  saveConfig({ searchHistory: history })
}

// 导出用户数据
export function exportUserData(): string {
  try {
    const config = loadConfig()

    console.log('导出用户数据 - 当前音质设置:', config.musicQuality)

    const exportData = {
      config,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }

    console.log('导出的完整配置:', exportData)

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('导出用户数据失败:', error)
    throw new Error('导出失败')
  }
}

// 导入用户数据
export function importUserData(jsonData: string): boolean {
  try {
    const importData = JSON.parse(jsonData)

    // 验证数据格式
    if (!importData.config) {
      throw new Error('数据格式不正确')
    }

    // 导入配置，但将 isPlaying 设为 false，避免导入后自动播放
    const configToImport = {
      ...importData.config,
      isPlaying: false,
      // 确保音质设置存在，如果没有则使用默认值
      musicQuality: importData.config.musicQuality || 'lossless'
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToImport))

    console.log('用户数据导入成功')
    console.log('导入的音质设置:', configToImport.musicQuality)

    // 验证保存是否成功
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const savedConfig = JSON.parse(saved)
      console.log('验证保存的音质设置:', savedConfig.musicQuality)
    }

    return true
  } catch (error) {
    console.error('导入用户数据失败:', error)
    throw new Error('导入失败，请检查文件格式')
  }
}

// ==================== Cookie 管理 ====================

const COOKIE_KEY = 'vtxmus_netease_cookie'

// 保存网易云 Cookie
export function saveNeteaseCooke(cookie: string): void {
  try {
    localStorage.setItem(COOKIE_KEY, cookie)
    console.log('网易云 Cookie 已保存')
  } catch (error) {
    console.error('保存 Cookie 失败:', error)
  }
}

// 获取网易云 Cookie
export function getNeteaseCooke(): string | null {
  try {
    return localStorage.getItem(COOKIE_KEY)
  } catch (error) {
    console.error('获取 Cookie 失败:', error)
    return null
  }
}

// 清除网易云 Cookie
export function clearNeteaseCooke(): void {
  try {
    localStorage.removeItem(COOKIE_KEY)
    console.log('网易云 Cookie 已清除')
  } catch (error) {
    console.error('清除 Cookie 失败:', error)
  }
}

