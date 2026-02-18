<template>
  <div class="play-page" :style="{ background: dynamicBackground }">
    <!-- 动态粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 音频波形背景 -->
    <div class="wave-background">
      <div
        v-for="i in 50"
        :key="i"
        class="wave-bar"
        :style="{
          left: `${(i - 1) * 2}%`,
          transform: `scaleY(${(waveHeights[i - 1] ?? 0) / 100})`
        }"
      ></div>
    </div>

    <button @click="goBack" class="back-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
    </button>



    <div v-if="currentSong" class="play-content">
      <div class="left-section">
        <div class="disc-wrapper">
          <!-- 音频频谱可视化 -->
          <canvas ref="spectrumCanvas" class="spectrum-canvas"></canvas>

          <div class="needle" :class="{ playing: playerStore.isPlaying }"></div>
          <div class="album-disc" :class="{ rotating: playerStore.isPlaying }">
            <div class="disc-bg" :style="{ boxShadow: discGlow }">
              <img
                ref="albumImage"
                :src="currentSong.album.picUrl"
                :alt="currentSong.name"
                class="album-image"
                crossorigin="anonymous"
                @load="extractColors"
              />
              <div class="disc-center"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-section">
        <div class="song-header">
          <div class="title-row">
            <h1 class="song-title">{{ currentSong.name }}</h1>
            <div class="download-selector">
              <button @click="toggleDownloadMenu" class="download-btn" title="下载">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
                  <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                </svg>
              </button>
              <div v-if="showDownloadMenu" class="download-menu">
                <div class="menu-title">选择下载音质</div>
                <div
                  v-for="option in qualityOptions"
                  :key="option.value"
                  class="quality-option"
                  @click="downloadWithQuality(option.value)"
                >
                  <span class="option-label">{{ option.label }}</span>
                  <span class="option-desc">{{ option.desc }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="song-info">
            <span class="info-item">专辑：{{ currentSong.album.name }}</span>
            <span class="info-item">歌手：{{ currentSong.artists.map(a => a.name).join(' / ') }}</span>
          </div>
        </div>

        <div class="lyric-section">
          <div class="lyric-container" ref="lyricContainer">
            <div
              v-for="(line, index) in lyrics"
              :key="index"
              class="lyric-line"
              :class="{ active: index === currentLyricIndex }"
            >
              <span class="lyric-time">{{ formatLyricTime(line.time) }}</span>
              <span class="lyric-text">{{ line.text }}</span>
            </div>
            <div v-if="lyrics.length === 0" class="no-lyric">
              <svg class="no-lyric-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M468 7c7.6 6.1 12 15.3 12 25l0 304c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6l0-116.7-224 49.8 0 206.3c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6L128 96c0-15 10.4-28 25.1-31.2l288-64c9.5-2.1 19.4 .2 27 6.3z"/>
              </svg>
              <p>暂无歌词</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-song">
      <svg class="no-song-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M468 7c7.6 6.1 12 15.3 12 25l0 304c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6l0-116.7-224 49.8 0 206.3c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6L128 96c0-15 10.4-28 25.1-31.2l288-64c9.5-2.1 19.4 .2 27 6.3z"/>
      </svg>
      <p>暂无播放歌曲</p>
      <button @click="goBack" class="back-home-btn">返回首页</button>
    </div>

    <div v-if="playerStore.showPlaylist" class="playlist-section">
      <Playlist />
    </div>

    <DownloadProgress ref="downloadProgressRef" @retry="handleRetryDownload" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getLyric } from '@/api/netease'
import { toast } from '@/utils/toast'
import Playlist from '@/components/Playlist.vue'
import DownloadProgress from '@/components/DownloadProgress.vue'
import type { DownloadItem } from '@/components/DownloadProgress.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const lyricContainer = ref<HTMLElement>()
const lyrics = ref<Array<{ time: number; text: string }>>([])
const currentLyricIndex = ref(-1)
const downloadProgressRef = ref<InstanceType<typeof DownloadProgress>>()
const showDownloadMenu = ref(false)

// 音频可视化相关
const spectrumCanvas = ref<HTMLCanvasElement>()
const particleCanvas = ref<HTMLCanvasElement>()
const albumImage = ref<HTMLImageElement>()
const audioContext = ref<AudioContext>()
const analyser = ref<AnalyserNode>()
const dataArray = ref<Uint8Array>()
const animationId = ref<number>()
const particleAnimationId = ref<number>()
const dynamicBackground = ref('linear-gradient(135deg, #1a2a32 0%, #305669 50%, #2a4555 100%)')
const discGlow = ref('0 20px 60px rgba(0, 0, 0, 0.6)')
const waveHeights = ref<number[]>(Array(50).fill(20))
const particles = ref<Array<{
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
}>>([])
const audioInitialized = ref(false) // 添加标记，避免重复初始化

// 音质选项
const qualityOptions = [
  { value: 'standard', label: '标准', desc: '128kbps' },
  { value: 'exhigh', label: '极高', desc: '320kbps' },
  { value: 'lossless', label: '无损', desc: 'FLAC' },
  { value: 'hires', label: 'Hi-Res', desc: '24bit' },
  { value: 'jyeffect', label: '环绕声', desc: 'VIP' },
  { value: 'sky', label: '沉浸声', desc: 'SVIP' },
  { value: 'jymaster', label: '母带', desc: 'SVIP' }
]

const currentSong = computed(() => playerStore.currentSong)
const isFavorite = computed(() => {
  return currentSong.value ? playerStore.isFavorite(currentSong.value.id) : false
})

// 初始化音频可视化
function initAudioVisualization() {
  // 如果已经初始化过，直接返回
  if (audioInitialized.value && audioContext.value && analyser.value) {
    console.log('音频可视化已经初始化过了')
    // 如果 AudioContext 被暂停，恢复它
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }
    // 如果动画没有运行，重新启动
    if (!animationId.value) {
      drawSpectrum()
    }
    return
  }

  // 查找页面中的 audio 元素
  const audioElement = document.querySelector('audio')
  if (!audioElement || !spectrumCanvas.value) {
    console.log('未找到音频元素或canvas元素')
    return
  }

  try {
    // 检查音频元素是否已经连接到 AudioContext
    // 使用全局变量来跟踪，避免重复连接
    if (!(window as any).__audioContextInitialized) {
      // 创建 AudioContext
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const source = audioContext.value.createMediaElementSource(audioElement)
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 256
      analyser.value.smoothingTimeConstant = 0.8

      // 关键：必须连接到 destination，否则没有声音
      source.connect(analyser.value)
      analyser.value.connect(audioContext.value.destination)

      const bufferLength = analyser.value.frequencyBinCount
      dataArray.value = new Uint8Array(bufferLength)

      audioInitialized.value = true
      ;(window as any).__audioContextInitialized = true
      // 保存到全局，供其他组件实例使用
      ;(window as any).__globalAudioContext = audioContext.value
      ;(window as any).__globalAnalyser = analyser.value
      ;(window as any).__globalDataArray = dataArray.value
      console.log('音频可视化初始化成功')
    } else {
      console.log('音频元素已连接，跳过初始化')
      return
    }

    // 确保 AudioContext 处于运行状态
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }

    drawSpectrum()
  } catch (error: any) {
    console.error('音频可视化初始化失败:', error)
    if (error.name === 'InvalidStateError') {
      console.warn('音频元素已经连接到另一个 AudioContext，跳过初始化')
      // 不要重置，保持现有状态
      return
    }
  }
}

// 绘制频谱
function drawSpectrum() {
  if (!spectrumCanvas.value || !analyser.value || !dataArray.value) {
    console.log('drawSpectrum 检查失败:', {
      hasCanvas: !!spectrumCanvas.value,
      hasAnalyser: !!analyser.value,
      hasDataArray: !!dataArray.value
    })
    return
  }

  const canvas = spectrumCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.log('无法获取 canvas context')
    return
  }

  // 如果动画已经在运行，先停止
  if (animationId.value) {
    console.log('停止旧的频谱动画')
    cancelAnimationFrame(animationId.value)
    animationId.value = undefined
  }

  console.log('开始绘制频谱动画')

  const draw = () => {
    // 检查是否还有效
    if (!analyser.value || !dataArray.value) {
      console.log('analyser 或 dataArray 已失效，停止动画')
      return
    }

    analyser.value.getByteFrequencyData(dataArray.value as Uint8Array<ArrayBuffer>)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 180
    const barCount = 64
    const barWidth = 6

    // 绘制频谱条 - 使用与背景协调的柔和色调
    for (let i = 0; i < barCount; i++) {
      const value = dataArray.value[Math.floor(i * dataArray.value.length / barCount)]
      // 使用对数缩放和限制范围，让频谱更均匀
      const normalizedValue = Math.pow((value ?? 0) / 255, 0.7) // 使用幂函数平滑
      const barHeight = normalizedValue * 80 + 15 // 最小15，最大95
      const angle = (i / barCount) * Math.PI * 2

      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)

      // 使用柔和的紫色到蓝色渐变，与背景协调
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, 'rgba(138, 190, 185, 0.6)')
      gradient.addColorStop(0.5, 'rgba(183, 229, 205, 0.8)')
      gradient.addColorStop(1, 'rgba(200, 180, 255, 0.9)')

      ctx.strokeStyle = gradient
      ctx.lineWidth = barWidth
      ctx.lineCap = 'round'
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(138, 190, 185, 0.4)'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // 更新波形高度
    waveHeights.value = waveHeights.value.map((_, i) => {
      const value = dataArray.value![Math.floor(i * dataArray.value!.length / 50)]
      return Math.max(20, ((value ?? 0) / 255) * 100)
    })

    animationId.value = requestAnimationFrame(draw)
  }

  draw()
}

// 初始化粒子系统
function initParticles() {
  if (!particleCanvas.value) return

  const canvas = particleCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 创建粒子
  particles.value = []
  for (let i = 0; i < 80; i++) {
    particles.value.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: `rgba(138, 190, 185, ${Math.random() * 0.5 + 0.2})`,
      alpha: Math.random() * 0.5 + 0.3
    })
  }

  animateParticles()
}

// 粒子动画
function animateParticles() {
  if (!particleCanvas.value) return

  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 获取音频强度
    let intensity = 1
    if (dataArray.value && playerStore.isPlaying) {
      const average = dataArray.value.reduce((a, b) => a + b, 0) / dataArray.value.length
      intensity = 1 + (average / 255) * 2
    }

    particles.value.forEach(particle => {
      // 更新位置
      particle.x += particle.vx * intensity
      particle.y += particle.vy * intensity

      // 边界检测
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      // 绘制粒子
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.alpha
      ctx.fill()
    })

    ctx.globalAlpha = 1

    particleAnimationId.value = requestAnimationFrame(animate)
  }

  animate()
}

// 提取专辑封面颜色
function extractColors() {
  if (!albumImage.value) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = albumImage.value.width
    canvas.height = albumImage.value.height
    ctx.drawImage(albumImage.value, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 采样颜色
    const colors: { r: number; g: number; b: number; count: number }[] = []
    for (let i = 0; i < data.length; i += 4 * 10) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 跳过太暗或太亮的颜色
      const brightness = ((r ?? 0) + (g ?? 0) + (b ?? 0)) / 3
      if (brightness < 30 || brightness > 220) continue

      if (r !== undefined && g !== undefined && b !== undefined) {
        colors.push({ r, g, b, count: 1 })
      }
    }

    if (colors.length > 0) {
      // 计算平均颜色
      const avgColor = colors.reduce((acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b,
        count: acc.count + 1
      }), { r: 0, g: 0, b: 0, count: 0 })

      const r = Math.floor(avgColor.r / avgColor.count)
      const g = Math.floor(avgColor.g / avgColor.count)
      const b = Math.floor(avgColor.b / avgColor.count)

      // 生成动态背景
      const color1 = `rgb(${Math.max(r - 40, 20)}, ${Math.max(g - 40, 30)}, ${Math.max(b - 40, 40)})`
      const color2 = `rgb(${Math.min(r + 20, 80)}, ${Math.min(g + 30, 100)}, ${Math.min(b + 40, 120)})`
      const color3 = `rgb(${Math.max(r - 20, 30)}, ${Math.max(g - 20, 50)}, ${Math.max(b - 20, 60)})`

      dynamicBackground.value = `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`

      // 唱片发光效果
      discGlow.value = `0 20px 60px rgba(${r}, ${g}, ${b}, 0.4), 0 0 80px rgba(${r}, ${g}, ${b}, 0.2)`
    }
  } catch (error) {
    console.error('颜色提取失败:', error)
  }
}

function goBack() {
  router.back()
}

function toggleFavorite() {
  if (currentSong.value) {
    playerStore.toggleFavorite(currentSong.value.id)
  }
}

function toggleDownloadMenu() {
  showDownloadMenu.value = !showDownloadMenu.value
}

async function downloadWithQuality(quality: string) {
  showDownloadMenu.value = false
  await downloadMusic(quality)
}

async function downloadMusic(quality: string = 'lossless') {
  if (!currentSong.value) return

  const song = currentSong.value
  const downloadId = `download-${song.id}-${Date.now()}`

  try {
    // 添加到下载列表
    const downloadItem = downloadProgressRef.value?.addDownload({
      id: downloadId,
      name: song.name,
      artist: song.artists.map(a => a.name).join(' / '),
      cover: song.album.picUrl
    })

    // 获取音频URL
    const { getSongUrl } = await import('@/api/netease')
    const audioUrl = await getSongUrl(song.id, quality)

    // 创建 AbortController 用于取消下载
    const controller = new AbortController()
    if (downloadItem) {
      downloadItem.controller = controller
    }

    // 使用fetch下载文件，支持进度
    const response = await fetch(audioUrl, { signal: controller.signal })

    if (!response.ok) {
      throw new Error('下载失败')
    }

    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应')
    }

    const chunks: Uint8Array[] = []
    let receivedLength = 0

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      chunks.push(value)
      receivedLength += value.length

      // 更新进度
      if (total > 0) {
        const progress = Math.round((receivedLength / total) * 100)
        downloadProgressRef.value?.updateProgress(downloadId, progress)
      }
    }

    // 合并所有块
    const blob = new Blob(chunks as BlobPart[])

    // 创建blob URL
    const blobUrl = window.URL.createObjectURL(blob)

    // 创建一个临时的a标签来下载
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${song.name} - ${song.artists.map(a => a.name).join(', ')}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 释放blob URL
    window.URL.revokeObjectURL(blobUrl)

    // 标记为完成
    downloadProgressRef.value?.setCompleted(downloadId)
    toast.success('下载成功！')
  } catch (error: any) {
    console.error('下载失败:', error)

    // 如果不是用户取消，则标记为错误
    if (error.name !== 'AbortError') {
      downloadProgressRef.value?.setError(downloadId)
      toast.error('下载失败，请稍后重试')
    }
  }
}

function handleRetryDownload(id: string) {
  // 重新触发下载
  downloadMusic()
}

function formatLyricTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function parseLyric(lyricText: string) {
  const lines = lyricText.split('\n')
  const result: Array<{ time: number; text: string }> = []

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match && match[1] && match[2] && match[3] && match[4]) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()
      if (text) {
        result.push({ time, text })
      }
    }
  }

  return result
}

async function loadLyric() {
  if (!currentSong.value) return

  try {
    const lyricData = await getLyric(currentSong.value.id)
    if (lyricData.lrc && lyricData.lrc.lyric) {
      lyrics.value = parseLyric(lyricData.lrc.lyric)
    } else {
      lyrics.value = []
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
    lyrics.value = []
    toast.error('加载歌词失败')
  }
}

watch(() => currentSong.value, (newSong, oldSong) => {
  if (newSong) {
    loadLyric()
    currentLyricIndex.value = -1
    // 重置背景
    dynamicBackground.value = 'linear-gradient(135deg, #1a2a32 0%, #305669 50%, #2a4555 100%)'
    discGlow.value = '0 20px 60px rgba(0, 0, 0, 0.6)'

    // 如果是新歌曲（切歌）
    if (oldSong?.id !== newSong.id) {
      setTimeout(() => {
        console.log('歌曲变化，检查音频可视化状态，isPlaying:', playerStore.isPlaying)
        // 如果已经初始化过
        if ((window as any).__audioContextInitialized && analyser.value) {
          console.log('已初始化，检查动画状态，animationId:', animationId.value)
          // 无论播放状态如何，都重启动画（因为切歌后需要重新绘制）
          if (!animationId.value) {
            console.log('重启频谱动画')
            drawSpectrum()
          }
        } else if (playerStore.isPlaying) {
          // 如果未初始化且正在播放，则初始化
          console.log('初始化音频可视化')
          initAudioVisualization()
        }
      }, 800)
    }
  }
})

watch(() => playerStore.currentTime, (time) => {
  if (lyrics.value.length === 0) return

  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    const lyric = lyrics.value[i]
    if (lyric && time >= lyric.time) {
      if (currentLyricIndex.value !== i) {
        currentLyricIndex.value = i
        scrollToLyric(i)
      }
      break
    }
  }
})

watch(() => playerStore.isPlaying, (isPlaying) => {
  console.log('播放状态变化:', isPlaying)
  if (isPlaying) {
    if (!(window as any).__audioContextInitialized) {
      // 延迟初始化，确保音频元素已加载
      setTimeout(() => {
        console.log('尝试初始化音频可视化')
        initAudioVisualization()
      }, 300)
    } else {
      // 已经初始化过
      if (audioContext.value && audioContext.value.state === 'suspended') {
        // 恢复 AudioContext
        audioContext.value.resume()
      }
      // 如果动画未运行，重新启动动画
      if (!animationId.value && analyser.value && dataArray.value) {
        console.log('播放状态变化，重启频谱动画')
        drawSpectrum()
      }
    }
  }
})

function scrollToLyric(index: number) {
  nextTick(() => {
    if (!lyricContainer.value) return

    const lines = lyricContainer.value.querySelectorAll('.lyric-line')
    if (lines[index]) {
      lines[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

// 点击外部关闭下载菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.download-selector')) {
    showDownloadMenu.value = false
  }
}

watch(showDownloadMenu, (show) => {
  if (show) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onMounted(() => {
  if (currentSong.value) {
    loadLyric()
  }

  // 初始化可视化效果
  nextTick(() => {
    if (spectrumCanvas.value) {
      spectrumCanvas.value.width = 600
      spectrumCanvas.value.height = 600
    }
    initParticles()

    // 检查音频可视化状态
    if (playerStore.isPlaying) {
      if ((window as any).__audioContextInitialized) {
        // 全局已初始化，但当前组件实例可能没有 analyser
        // 需要从全局 AudioContext 获取或重新初始化
        console.log('组件挂载，全局已初始化，检查当前实例状态')
        if (!analyser.value || !dataArray.value) {
          console.log('当前实例缺少 analyser，需要重新获取')
          // 尝试从全局获取
          if ((window as any).__globalAnalyser && (window as any).__globalDataArray) {
            analyser.value = (window as any).__globalAnalyser
            dataArray.value = (window as any).__globalDataArray
            audioContext.value = (window as any).__globalAudioContext
            audioInitialized.value = true
            console.log('从全局恢复 analyser')
            // 启动动画
            setTimeout(() => {
              drawSpectrum()
            }, 500)
          }
        } else {
          // 已有 analyser，直接启动动画
          setTimeout(() => {
            drawSpectrum()
          }, 500)
        }
      } else {
        // 未初始化，进行初始化
        setTimeout(() => {
          initAudioVisualization()
        }, 1000)
      }
    }
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth
      particleCanvas.value.height = window.innerHeight
    }
  })
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (particleAnimationId.value) {
    cancelAnimationFrame(particleAnimationId.value)
  }
  // 不要关闭 AudioContext，因为音频元素还在使用
  // 只是停止动画
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.play-page {
  height: calc(100vh - 88px);
  overflow: hidden;
  position: relative;
  transition: background 1s ease;
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100vh - 88px);
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}

.wave-background {
  position: fixed;
  bottom: 88px;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.15;
  overflow: hidden;
}

.wave-bar {
  position: absolute;
  bottom: 0;
  width: 1.5%;
  height: 100px;
  background: linear-gradient(to top, rgba(138, 190, 185, 0.8), rgba(183, 229, 205, 0.3));
  border-radius: 4px 4px 0 0;
  transform-origin: bottom;
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.back-btn {
  position: fixed;
  top: 30px;
  left: 30px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  transform: scale(1.05);
}

.back-btn .icon-svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.play-content {
  height: calc(100vh - 88px);
  width: 100%;
  padding: 40px 60px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 80px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 0;
  position: relative;
  z-index: 2;
}

.left-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.disc-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
}

.spectrum-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 15;
  opacity: 0.85;
  filter: drop-shadow(0 0 20px rgba(138, 190, 185, 0.3));
}

.needle {
  position: absolute;
  top: -40px;
  right: 80px;
  width: 120px;
  height: 180px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 4px 4px 50% 50%;
  transform-origin: 20px 20px;
  transform: rotate(-30deg);
  transition: transform 0.5s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.needle::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #888 0%, #444 100%);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.needle::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.needle.playing {
  transform: rotate(-5deg);
}

.album-disc {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.3s ease;
  z-index: 10;
}

.album-disc.rotating .disc-bg {
  animation: rotate 20s linear infinite;
}

.disc-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
  padding: 20px;
  position: relative;
  transition: box-shadow 1s ease;
}

.album-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.disc-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #333 0%, #000 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.right-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  padding-top: 20px;
}

.song-header {
  flex-shrink: 0;
  margin-bottom: 40px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.song-title {
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.2;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.download-selector {
  position: relative;
  flex-shrink: 0;
}

.download-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  transform: scale(1.05);
}

.download-btn .icon-svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.download-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 12px;
  background: rgba(26, 42, 50, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 8px;
  min-width: 160px;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.menu-title {
  padding: 10px 14px 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
}

.quality-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
}

.quality-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.option-label {
  font-size: 14px;
  font-weight: 500;
}

.option-desc {
  font-size: 12px;
  opacity: 0.7;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.info-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.lyric-section {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.lyric-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px 20px 200px 0;
  min-height: 0;
}

.lyric-container::-webkit-scrollbar {
  width: 6px;
}

.lyric-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  margin-bottom: 100px;
}

.lyric-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.lyric-line {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-size: 16px;
  line-height: 2.2;
  color: rgba(255, 255, 255, 0.35);
  transition: all 0.3s ease;
  padding: 6px 0;
  cursor: default;
}

.lyric-time {
  flex-shrink: 0;
  width: 48px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  font-family: 'Courier New', monospace;
  text-align: right;
}

.lyric-text {
  flex: 1;
}

.lyric-line.active {
  color: #fff;
  text-shadow: 0 0 20px rgba(138, 190, 185, 0.5);
}

.lyric-line.active .lyric-time {
  color: rgba(255, 255, 255, 0.5);
}

.lyric-line.active .lyric-text {
  font-size: 18px;
  font-weight: 500;
}

.no-lyric {
  text-align: center;
  padding: 100px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.no-lyric-icon {
  width: 80px;
  height: 80px;
  fill: rgba(138, 190, 185, 0.5);
  display: block;
  margin: 0 auto 16px;
  filter: drop-shadow(0 4px 12px rgba(138, 190, 185, 0.2));
}

.no-song {
  text-align: center;
  padding: 120px 20px;
  color: rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 2;
}

.no-song-icon {
  width: 96px;
  height: 96px;
  fill: rgba(138, 190, 185, 0.5);
  display: block;
  margin: 0 auto 24px;
  filter: drop-shadow(0 4px 12px rgba(138, 190, 185, 0.2));
}

.no-song p {
  font-size: 18px;
  margin-bottom: 32px;
}

.back-home-btn {
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

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(138, 190, 185, 0.4);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.playlist-section {
  position: fixed;
  right: 40px;
  top: 100px;
  bottom: calc(88px + 20px);
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

@media (max-width: 1200px) {
  .play-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 30px 40px;
  }

  .disc-wrapper {
    width: 320px;
    height: 320px;
  }

  .spectrum-canvas {
    width: 400px !important;
    height: 400px !important;
  }

  .needle {
    width: 100px;
    height: 150px;
    right: 60px;
  }

  .song-title {
    font-size: 28px;
  }
}
</style>

