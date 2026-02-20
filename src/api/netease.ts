// 网易云音乐 API 封装
import { API_BASE_URL, NETEASE_COOKIE, DEFAULT_QUALITY } from '@/config/api'
import { eapiRequest } from '@/utils/crypto'

const BASE_URL = API_BASE_URL
const COOKIE = NETEASE_COOKIE

// 获取 API 基础 URL
// 开发环境和 Electron 环境使用 localhost，Web 部署使用相对路径
function getApiBaseUrl(): string {
  // 如果是开发环境，使用 localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001'
  }
  // 如果是 Electron 环境（通过 file:// 协议判断），使用 localhost
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3001'
  }
  // Web 部署环境使用 /VTxMus 作为基础路径（因为部署在子目录）
  return '/VTxMus'
}

// 解析 Cookie 字符串为对象
function parseCookieString(cookieStr: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieStr.split(';').forEach(item => {
    const [key, value] = item.trim().split('=')
    if (key && value) {
      cookies[key] = value
    }
  })
  return cookies
}

const cookieObj = parseCookieString(COOKIE)

export interface Song {
  id: number
  name: string
  artists: Array<{ id: number; name: string }>
  album: { id: number; name: string; picUrl: string }
  duration: number
}

export interface SearchResult {
  songs: Song[]
  songCount: number
}

export interface Lyric {
  lrc: { lyric: string }
  tlyric?: { lyric: string }
}

// 搜索歌曲
export async function searchSongs(keywords: string, limit = 20, offset = 0): Promise<SearchResult> {
  try {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}/proxy/api/cloudsearch/pc`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        s: keywords,
        type: '1',
        limit: limit.toString(),
        offset: offset.toString()
      })
    })

    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('搜索响应:', data)

    if (data.code === 200 && data.result && data.result.songs) {
      const songs = data.result.songs.map((item: any) => ({
        id: item.id,
        name: item.name,
        artists: item.ar.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })),
        album: {
          id: item.al.id,
          name: item.al.name,
          picUrl: item.al.picUrl
        },
        duration: item.dt
      }))

      return {
        songs: songs,
        songCount: data.result.songCount
      }
    }

    throw new Error(data.message || '搜索失败')
  } catch (error) {
    console.error('搜索错误:', error)
    throw error
  }
}

// 获取歌曲详情
export async function getSongDetail(ids: number[]): Promise<Song[]> {
  try {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}/proxy/api/v3/song/detail`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        c: JSON.stringify(ids.map(id => ({ id })))
      })
    })

    if (!response.ok) {
      throw new Error(`获取歌曲详情失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('歌曲详情 API 响应:', data)

    if (data.code === 200 && data.songs) {
      return data.songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        artists: song.ar.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })),
        album: {
          id: song.al.id,
          name: song.al.name,
          picUrl: song.al.picUrl
        },
        duration: song.dt
      }))
    }

    console.warn('歌曲详情 API 返回数据格式不正确:', data)
    return []
  } catch (error) {
    console.error('获取歌曲详情失败:', error)
    return []
  }
}

// 获取歌曲播放 URL
export async function getSongUrl(id: number, quality: string = DEFAULT_QUALITY): Promise<string> {
  try {
    const baseUrl = getApiBaseUrl()

    // 使用 EAPI（需要 Node.js 代理服务）
    const config = {
      os: 'pc',
      appver: '',
      osver: '',
      deviceId: 'pyncm!',
      requestId: String(Math.floor(Math.random() * 10000000) + 20000000)
    }

    const payload: any = {
      ids: [id],
      level: quality,
      encodeType: 'flac',
      header: JSON.stringify(config)
    }

    // 如果是沉浸环绕声，添加特殊参数
    if (quality === 'sky') {
      payload.immerseType = 'c51'
    }

    const response = await fetch(`${baseUrl}/proxy/eapi/song/enhance/player/url/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    console.log('EAPI 高音质响应:', result)

    if (result.code === 200 && result.data && result.data[0] && result.data[0].url) {
      // 通过代理服务器转发音频流
      const originalUrl = result.data[0].url
      return `${baseUrl}/proxy/audio?url=${encodeURIComponent(originalUrl)}`
    }

    // 如果高音质失败，尝试标准音质
    console.warn('高音质获取失败，尝试标准音质...')
    payload.level = 'standard'

    const standardResponse = await fetch(`${baseUrl}/proxy/eapi/song/enhance/player/url/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const standardResult = await standardResponse.json()
    console.log('EAPI 标准音质响应:', standardResult)

    if (standardResult.code === 200 && standardResult.data && standardResult.data[0] && standardResult.data[0].url) {
      // 通过代理服务器转发音频流
      const originalUrl = standardResult.data[0].url
      return `${baseUrl}/proxy/audio?url=${encodeURIComponent(originalUrl)}`
    }

    throw new Error('无法获取播放链接，该歌曲可能需要 VIP 或不可用')
  } catch (error) {
    console.error('获取播放链接失败:', error)
    throw error
  }
}

// 获取歌词
export async function getLyric(id: number): Promise<Lyric> {
  try {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}/proxy/api/song/lyric`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        id: id.toString(),
        cp: 'false',
        tv: '0',
        lv: '0',
        rv: '0',
        kv: '0',
        yv: '0',
        ytv: '0',
        yrv: '0'
      })
    })

    const data = await response.json()

    if (data.code === 200 && data.lrc) {
      return {
        lrc: { lyric: data.lrc.lyric || '' },
        tlyric: data.tlyric
      }
    }

    return { lrc: { lyric: '' } }
  } catch (error) {
    console.error('获取歌词失败:', error)
    return { lrc: { lyric: '' } }
  }
}

// 获取每日推荐歌曲
export async function getRecommendSongs(limit = 10): Promise<Song[]> {
  try {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}/proxy/api/personalized/newsong?limit=${limit}`)
    const data = await response.json()

    if (data.code === 200 && data.result) {
      return data.result.map((item: any) => ({
        id: item.id,
        name: item.name,
        artists: item.song.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })),
        album: {
          id: item.song.album.id,
          name: item.song.album.name,
          picUrl: item.picUrl
        },
        duration: item.song.duration
      }))
    }

    return []
  } catch (error) {
    console.error('获取每日推荐失败:', error)
    return []
  }
}

// 获取推荐歌单
export async function getRecommendPlaylists(limit = 10) {
  try {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}/proxy/api/personalized/playlist?limit=${limit}`)
    const data = await response.json()

    console.log('推荐歌单响应:', data)

    if (data.code === 200 && data.result) {
      console.log('推荐歌单数据:', data.result)
      return data.result
    }

    return []
  } catch (error) {
    console.error('获取推荐歌单失败:', error)
    return []
  }
}

// 获取歌单详情
export async function getPlaylistDetail(id: number) {
  try {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}/proxy/api/playlist/detail?id=${id}`)
    const data = await response.json()

    if (data.code === 200 && data.result) {
      return {
        ...data.result,
        tracks: data.result.tracks.map((song: any) => ({
          id: song.id,
          name: song.name,
          artists: song.artists.map((artist: any) => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: song.album.id,
            name: song.album.name,
            picUrl: song.album.picUrl
          },
          duration: song.duration
        }))
      }
    }

    return null
  } catch (error) {
    console.error('获取歌单详情失败:', error)
    return null
  }
}

// 获取热门歌手
export async function getTopArtists(limit = 30) {
  try {
    const response = await fetch(`${BASE_URL}/top/artists?limit=${limit}`)
    const data = await response.json()

    if (data.code === 200 && data.artists) {
      return data.artists
    }

    return []
  } catch (error) {
    console.error('获取热门歌手失败:', error)
    return []
  }
}

// 获取歌手详情
export async function getArtistDetail(id: number) {
  try {
    const response = await fetch(`${BASE_URL}/artists?id=${id}`)
    const data = await response.json()

    if (data.code === 200) {
      return data
    }

    return {}
  } catch (error) {
    console.error('获取歌手详情失败:', error)
    return {}
  }
}

// 获取热门歌曲（飙升榜）
export async function getHotSongs(limit = 50): Promise<Song[]> {
  try {
    const baseUrl = getApiBaseUrl()
    // 使用飙升榜 ID: 19723756
    const response = await fetch(`${baseUrl}/proxy/api/playlist/detail?id=19723756`)
    const data = await response.json()

    console.log('热门歌曲响应:', data)
    console.log('热门歌曲响应结构:', data.result)

    // 检查 data.result 或 data.playlist
    const playlist = data.result || data.playlist

    if (data.code === 200 && playlist && playlist.tracks) {
      console.log('找到歌曲列表，数量:', playlist.tracks.length)
      const songs = playlist.tracks.slice(0, limit).map((song: any) => ({
        id: song.id,
        name: song.name,
        artists: song.ar ? song.ar.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })) : (song.artists ? song.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })) : []),
        album: {
          id: song.al ? song.al.id : song.album.id,
          name: song.al ? song.al.name : song.album.name,
          picUrl: song.al ? song.al.picUrl : song.album.picUrl
        },
        duration: song.dt || song.duration
      }))
      console.log('处理后的歌曲列表:', songs)
      return songs
    }

    console.warn('未找到歌曲数据，返回结构:', data)
    return []
  } catch (error) {
    console.error('获取热门歌曲失败:', error)
    return []
  }
}

// ==================== 登录相关 API ====================

// 生成二维码 key
export async function generateQRKey(): Promise<string> {
  try {
    const baseUrl = getApiBaseUrl()
    const timestamp = Date.now()
    const response = await fetch(`${baseUrl}/login/qr/key?timestamp=${timestamp}`)
    const data = await response.json()

    console.log('生成二维码 key 响应:', data)

    if (data.code === 200 && data.unikey) {
      return data.unikey
    }

    throw new Error('生成二维码 key 失败')
  } catch (error) {
    console.error('生成二维码 key 失败:', error)
    throw error
  }
}

// 生成二维码图片
export async function generateQRCode(key: string): Promise<string> {
  try {
    // 直接生成二维码 URL，不需要调用 API
    // 网易云音乐的二维码登录 URL 格式
    const qrUrl = `https://music.163.com/login?codekey=${key}`

    console.log('生成二维码 URL:', qrUrl)

    // 使用第三方二维码生成服务或者返回 URL 让前端生成
    // 这里使用一个简单的二维码生成 API
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`

    return qrImageUrl
  } catch (error) {
    console.error('生成二维码图片失败:', error)
    throw error
  }
}

// 检查二维码扫描状态
export async function checkQRStatus(key: string): Promise<{
  code: number
  message: string
  cookie?: string
}> {
  try {
    const baseUrl = getApiBaseUrl()
    const timestamp = Date.now()
    const response = await fetch(`${baseUrl}/login/qr/check?key=${key}&timestamp=${timestamp}`, {
      credentials: 'include' // 重要：允许接收 cookie
    })
    const data = await response.json()

    console.log('检查二维码状态响应:', data)

    // 从响应中获取 cookie
    let cookie = ''
    if (data.code === 803) {
      // 登录成功，从响应中获取 cookie
      if (data.cookie) {
        cookie = data.cookie
      }
    }

    return {
      code: data.code,
      message: data.message || '',
      cookie: cookie
    }
  } catch (error) {
    console.error('检查二维码状态失败:', error)
    throw error
  }
}

// 获取登录状态
export async function getLoginStatus(): Promise<{
  isLogin: boolean
  profile?: any
}> {
  try {
    const baseUrl = getApiBaseUrl()
    const timestamp = Date.now()
    const response = await fetch(`${baseUrl}/login/status?timestamp=${timestamp}`, {
      credentials: 'include'
    })
    const data = await response.json()

    console.log('获取登录状态响应:', data)

    if (data.data && data.data.profile) {
      return {
        isLogin: true,
        profile: data.data.profile
      }
    }

    return { isLogin: false }
  } catch (error) {
    console.error('获取登录状态失败:', error)
    return { isLogin: false }
  }
}

