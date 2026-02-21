/**
 * 歌词解析工具
 */

/**
 * 歌词行接口
 */
export interface LyricLine {
  time: number  // 时间（秒）
  text: string  // 歌词文本
}

/**
 * 解析 LRC 格式歌词
 * @param lrc LRC 格式的歌词字符串
 * @returns 解析后的歌词数组
 */
export function parseLyric(lrc: string): LyricLine[] {
  if (!lrc) return []
  
  const lines = lrc.split('\n')
  const result: LyricLine[] = []
  
  for (const line of lines) {
    // 匹配 [mm:ss.xx] 或 [mm:ss.xxx] 格式
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match && match[1] && match[2] && match[3] && match[4]) {
      const min = parseInt(match[1])
      const sec = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0'))
      const time = min * 60 + sec + ms / 1000
      const text = match[4].trim()
      
      if (text) {
        result.push({ time, text })
      }
    }
  }
  
  return result.sort((a, b) => a.time - b.time)
}

/**
 * 根据当前播放时间查找对应的歌词
 * @param lyrics 歌词数组
 * @param time 当前播放时间（秒）
 * @returns 当前歌词、下一句歌词和索引
 */
export function findCurrentLyric(lyrics: LyricLine[], time: number) {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    const lyric = lyrics[i]
    if (lyric && time >= lyric.time) {
      return {
        current: lyric,
        next: lyrics[i + 1] || null,
        index: i
      }
    }
  }
  
  return {
    current: null,
    next: lyrics[0] || null,
    index: -1
  }
}

