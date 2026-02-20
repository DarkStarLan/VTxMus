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
          transform: `scaleY(${(waveHeights[i - 1] ?? 0) / 100})`,
          opacity: (waveHeights[i - 1] ?? 0) > 5 ? 1 : 0
        }"
      ></div>
    </div>

    <button @click="goBack" class="back-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
    </button>

    <!-- 移动端滑动容器 -->
    <div
      v-if="currentSong && isMobileLayout"
      ref="mobileSwipeContainer"
      class="mobile-swipe-container"
      :style="{ transform: `translateX(${mobileSwipeOffset}px)` }"
    >
      <!-- 第一页：唱片页 -->
      <div class="mobile-page disc-page">
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

        <div class="mobile-song-info">
          <div class="title-row">
            <h1 class="song-title">{{ currentSong.name }}</h1>
            <div class="download-selector">
              <button @click.stop="toggleDownloadMenu" class="download-btn" title="下载">
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
      </div>

      <!-- 第二页：歌词页 -->
      <div class="mobile-page lyric-page">
        <div class="lyric-section-mobile">
          <div class="lyric-container" ref="lyricContainerMobile">
            <div
              v-for="(line, index) in lyrics"
              :key="index"
              class="lyric-line"
              :class="{ active: index === currentLyricIndex }"
            >
              <div class="lyric-content">
                <div class="lyric-main">
                  <span class="lyric-text">{{ line.text }}</span>
                </div>
                <span v-if="line.translation" class="lyric-translation">{{ line.translation }}</span>
              </div>
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

    <!-- 页面指示器 - 悬浮固定显示 -->
    <div v-if="currentSong && isMobileLayout" class="page-indicator">
      <div class="indicator-dot" :class="{ active: currentMobilePage === 0 }"></div>
      <div class="indicator-dot" :class="{ active: currentMobilePage === 1 }"></div>
    </div>

    <!-- 桌面端内容 -->
    <div v-if="currentSong && !isMobileLayout" class="play-content desktop-content">
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
              <div class="lyric-content">
                <div class="lyric-main">
                  <span class="lyric-text">{{ line.text }}</span>
                </div>
                <span v-if="line.translation" class="lyric-translation">{{ line.translation }}</span>
              </div>
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

    <div v-if="playerStore.showPlaylist" class="playlist-overlay" @click.self="closePlaylist">
      <div class="playlist-section">
        <Playlist />
      </div>
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
const lyrics = ref<Array<{ time: number; text: string; translation?: string }>>([])
const currentLyricIndex = ref(-1)
const downloadProgressRef = ref<InstanceType<typeof DownloadProgress>>()
const showDownloadMenu = ref(false)

// 移动端滑动相关
const mobileSwipeOffset = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)
const currentMobilePage = ref(0) // 0: 唱片页, 1: 歌词页 - 默认显示唱片页
const lyricContainerMobile = ref<HTMLElement>()
const mobileSwipeContainer = ref<HTMLElement>()

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
const waveHeights = ref<number[]>(Array(50).fill(0))
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

// 检测是否为移动端布局
const isMobileLayout = ref(false)

// 更新布局状态
function updateLayoutState() {
  isMobileLayout.value = document.documentElement.classList.contains('mobile-layout')
}

// 初始化音频可视化
function initAudioVisualization() {
  // 查找页面中的 audio 元素
  const audioElement = document.querySelector('audio')
  if (!audioElement || !spectrumCanvas.value) {
    console.log('音频元素或画布未找到，延迟初始化')
    return
  }

  try {
    // 检查是否已经全局初始化过
    if ((window as any).__audioContextInitialized) {
      // 使用全局的 AudioContext 和 Analyser
      audioContext.value = (window as any).__globalAudioContext
      analyser.value = (window as any).__globalAnalyser
      dataArray.value = (window as any).__globalDataArray
      audioInitialized.value = true

      // 确保 AudioContext 处于运行状态
      if (audioContext.value && audioContext.value.state === 'suspended') {
        audioContext.value.resume().then(() => {
          console.log('AudioContext 已恢复')
        })
      }

      // 启动绘制
      if (!animationId.value) {
        drawSpectrum()
      }
      return
    }

    // 首次初始化
    console.log('首次初始化音频可视化')

    // 创建 AudioContext
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()

    // 创建音频源
    const source = audioContext.value.createMediaElementSource(audioElement)

    // 创建分析器
    analyser.value = audioContext.value.createAnalyser()
    analyser.value.fftSize = 256
    analyser.value.smoothingTimeConstant = 0.8

    // 连接音频节点：source -> analyser -> destination
    source.connect(analyser.value)
    analyser.value.connect(audioContext.value.destination)

    // 创建数据数组
    const bufferLength = analyser.value.frequencyBinCount
    dataArray.value = new Uint8Array(bufferLength)

    // 标记为已初始化
    audioInitialized.value = true
    ;(window as any).__audioContextInitialized = true
    ;(window as any).__globalAudioContext = audioContext.value
    ;(window as any).__globalAnalyser = analyser.value
    ;(window as any).__globalDataArray = dataArray.value

    console.log('音频可视化初始化成功')

    // 不立即恢复 AudioContext，等待用户交互（播放音乐时）
    // 这样可以避免浏览器的自动播放策略警告
    drawSpectrum()
  } catch (error: any) {
    console.error('音频可视化初始化失败:', error)
    // 如果是 InvalidStateError，说明已经连接过了
    if (error.name === 'InvalidStateError') {
      console.log('音频元素已连接，尝试使用全局实例')
      if ((window as any).__globalAudioContext) {
        audioContext.value = (window as any).__globalAudioContext
        analyser.value = (window as any).__globalAnalyser
        dataArray.value = (window as any).__globalDataArray
        audioInitialized.value = true
        if (!animationId.value) {
          drawSpectrum()
        }
      }
    }
  }
}

// 绘制频谱
function drawSpectrum() {
  if (!spectrumCanvas.value || !analyser.value || !dataArray.value) {
    console.log('绘制频谱失败：缺少必要元素', {
      canvas: !!spectrumCanvas.value,
      analyser: !!analyser.value,
      dataArray: !!dataArray.value
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
    cancelAnimationFrame(animationId.value)
    animationId.value = undefined
  }

  console.log('开始绘制频谱动画')

  const draw = () => {
    // 检查是否还有效
    if (!analyser.value || !dataArray.value || !spectrumCanvas.value) {
      console.log('频谱绘制中断')
      return
    }

    // 获取频率数据
    analyser.value.getByteFrequencyData(dataArray.value as Uint8Array<ArrayBuffer>)

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    // 根据 canvas 尺寸动态计算半径，移动端和桌面端使用不同比例
    // 桌面端 800px canvas → 半径 200px (0.25)
    // 移动端 450px canvas → 半径 157.5px (0.35)
    const isMobile = document.documentElement.classList.contains('mobile-layout')
    const radiusRatio = isMobile ? 0.35 : 0.25
    const radius = Math.min(canvas.width, canvas.height) * radiusRatio
    const barCount = 64
    const barWidth = 6

    // 绘制频谱条 - 使用与背景协调的柔和色调
    for (let i = 0; i < barCount; i++) {
      // 只采样前50%的频谱数据（中低频部分），这部分能量最集中
      // 使用非线性映射，让低频占更多柱子，高频占较少柱子
      const freqRatio = Math.pow(i / barCount, 1.5) // 使用1.5次方，让采样更集中在低频
      const freqIndex = Math.floor(freqRatio * dataArray.value.length * 0.5)
      const value = dataArray.value[freqIndex]

      // 使用对数缩放和限制范围，让频谱更均匀
      const normalizedValue = Math.pow((value ?? 0) / 255, 0.6) // 从0.7改为0.6，增强响应
      const barHeight = normalizedValue * 80 + 8 // 减小最大高度，避免超出 canvas
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

    // 更新波形高度 - 只采样中低频范围，让整体显示更均衡
    waveHeights.value = waveHeights.value.map((_, i) => {
      // 只采样前50%的频谱数据（中低频部分），使用非线性映射
      const freqRatio = Math.pow(i / 50, 1.5)
      const freqIndex = Math.floor(freqRatio * dataArray.value!.length * 0.5)
      const value = dataArray.value![freqIndex]

      if ((value ?? 0) <= 10) return 0

      // 使用对数缩放让变化更平滑
      const normalizedValue = (value ?? 0) / 255
      const logScaled = Math.pow(normalizedValue, 0.6) // 从0.7改为0.6，增强响应

      // 限制最大高度为100，确保不超出容器范围（容器高度150px，scaleY基于100）
      return Math.min(logScaled * 130, 100) // 增加系数从120到130
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

function parseLyric(lyricText: string, translationText?: string) {
  const lines = lyricText.split('\n')
  const result: Array<{ time: number; text: string; translation?: string }> = []

  // 解析翻译歌词
  const translationMap = new Map<number, string>()
  if (translationText) {
    const translationLines = translationText.split('\n')
    for (const line of translationLines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match && match[1] && match[2] && match[3] && match[4]) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3].padEnd(3, '0'))
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = match[4].trim()
        if (text) {
          translationMap.set(time, text)
        }
      }
    }
  }

  // 解析原歌词并匹配翻译
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match && match[1] && match[2] && match[3] && match[4]) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()
      if (text) {
        result.push({
          time,
          text,
          translation: translationMap.get(time)
        })
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
      const translationLyric = lyricData.tlyric?.lyric
      lyrics.value = parseLyric(lyricData.lrc.lyric, translationLyric)
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

    // 重置移动端页面到唱片页
    currentMobilePage.value = 0
    mobileSwipeOffset.value = 0

    // 当歌曲加载后，确保触摸事件已绑定
    nextTick(() => {
      // 如果之前没有歌曲，现在有了，需要重新绑定事件
      if (!oldSong && newSong) {
        bindTouchEvents()
      }
    })

    // 切歌时重新初始化音频可视化
    setTimeout(() => {
      console.log('歌曲切换，重新初始化音频可视化')
      initAudioVisualization()
    }, 500)
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
  if (isPlaying) {
    // 延迟初始化，确保音频元素已加载
    setTimeout(() => {
      initAudioVisualization()

      // 在用户开始播放时恢复 AudioContext（用户交互后）
      if (audioContext.value && audioContext.value.state === 'suspended') {
        audioContext.value.resume().then(() => {
          console.log('AudioContext 已在用户交互后恢复')
        }).catch(err => {
          console.log('AudioContext 恢复失败:', err)
        })
      }
    }, 300)
  } else {
    // 暂停时不停止动画，让频谱继续显示（只是数据会变为0）
  }
})

// 添加防抖标志，避免在页面切换过程中触发歌词滚动
const isPageTransitioning = ref(false)

function scrollToLyric(index: number) {
  nextTick(() => {
    // 如果用户正在滑动或页面正在切换，不执行歌词滚动，避免干扰页面切换
    if (isSwiping.value || isPageTransitioning.value) {
      return
    }

    // 检查是否为移动端布局
    const isMobile = document.documentElement.classList.contains('mobile-layout')

    // 桌面端歌词滚动 - 使用手动滚动，只影响歌词容器
    if (lyricContainer.value && !isMobile) {
      const container = lyricContainer.value
      const lines = container.querySelectorAll('.lyric-line')
      const targetLine = lines[index] as HTMLElement

      if (targetLine) {
        // 计算目标位置，使歌词在容器中垂直居中
        const containerHeight = container.clientHeight
        const lineOffsetTop = targetLine.offsetTop
        const lineHeight = targetLine.clientHeight

        // 让当前歌词行的中心点对齐到容器的中心点
        const scrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2)

        // 平滑滚动到目标位置
        container.scrollTo({
          top: scrollTop, // 允许负值，浏览器会自动处理
          behavior: 'smooth'
        })
      }
    }

    // 移动端歌词滚动 - 只在当前显示歌词页且不在滑动时才滚动，使用手动滚动
    if (lyricContainerMobile.value && isMobile && currentMobilePage.value === 1) {
      const container = lyricContainerMobile.value
      const lines = container.querySelectorAll('.lyric-line')
      const targetLine = lines[index] as HTMLElement

      if (targetLine) {
        // 计算目标位置，使歌词在容器中垂直居中
        const containerHeight = container.clientHeight
        const lineOffsetTop = targetLine.offsetTop
        const lineHeight = targetLine.clientHeight

        // 让当前歌词行的中心点对齐到容器的中心点
        const scrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2)

        // 平滑滚动到目标位置
        container.scrollTo({
          top: scrollTop, // 允许负值，浏览器会自动处理
          behavior: 'smooth'
        })
      }
    }
  })
}

// 移动端滑动处理
function handleTouchStart(e: TouchEvent) {
  // 检查是否为移动端布局
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  // 修改横屏判断：只有在真正的横屏（高度明显小于宽度）且高度很小时才禁用
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  // 只在移动端布局且非横屏时启用滑动
  if (!isMobile || isLandscape) {
    return
  }

  touchStartX.value = e.touches[0]?.clientX ?? 0
  touchStartY.value = e.touches[0]?.clientY ?? 0
  isSwiping.value = false
  isPageTransitioning.value = true // 标记页面可能正在切换
}

function handleTouchMove(e: TouchEvent) {
  // 检查是否为移动端布局
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  if (!isMobile || isLandscape) return

  const touchX = e.touches[0]?.clientX ?? 0
  const touchY = e.touches[0]?.clientY ?? 0
  const deltaX = touchX - touchStartX.value
  const deltaY = touchY - touchStartY.value

  // 判断是否为横向滑动（降低阈值，减少阻力）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    isSwiping.value = true

    // 只在确认是横向滑动后才阻止默认行为
    if (e.cancelable) {
      e.preventDefault() // 阻止默认滚动行为
    }

    // 计算偏移量，限制在两页之间
    const screenWidth = window.innerWidth
    const baseOffset = -currentMobilePage.value * screenWidth
    let newOffset = baseOffset + deltaX

    // 限制边界（减小阻尼系数，降低阻力）
    if (newOffset > 0) {
      newOffset = deltaX * 0.5 // 左边界阻尼（从0.3提高到0.5）
    } else if (newOffset < -screenWidth) {
      newOffset = -screenWidth + (deltaX - screenWidth) * 0.5 // 右边界阻尼
    }

    mobileSwipeOffset.value = newOffset
  }
}

function handleTouchEnd(e: TouchEvent) {
  // 检查是否为移动端布局
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  if (!isMobile || isLandscape || !isSwiping.value) {
    // 即使没有滑动，也要延迟重置切换标志
    setTimeout(() => {
      isPageTransitioning.value = false
    }, 300)
    return
  }

  const screenWidth = window.innerWidth
  const threshold = screenWidth * 0.25 // 降低滑动阈值（从0.3降到0.25），更容易切换

  // 判断是否切换页面
  if (Math.abs(mobileSwipeOffset.value + currentMobilePage.value * screenWidth) > threshold) {
    if (mobileSwipeOffset.value > -currentMobilePage.value * screenWidth) {
      // 向右滑，切换到上一页
      currentMobilePage.value = Math.max(0, currentMobilePage.value - 1)
    } else {
      // 向左滑，切换到下一页
      currentMobilePage.value = Math.min(1, currentMobilePage.value + 1)
    }
  }

  // 动画回到目标页面
  mobileSwipeOffset.value = -currentMobilePage.value * screenWidth
  isSwiping.value = false

  // 延迟重置切换标志，确保动画完成后才允许歌词滚动
  setTimeout(() => {
    isPageTransitioning.value = false
  }, 300)
}

// 移除自动点击切换功能，避免误触
// function handleMobileClick(e: MouseEvent) {
//   const isLandscape = window.innerHeight < window.innerWidth && window.innerHeight < 600
//   if (window.innerWidth > 1000 || isLandscape || isSwiping.value) return
//
//   // 点击切换页面
//   const screenWidth = window.innerWidth
//   currentMobilePage.value = currentMobilePage.value === 0 ? 1 : 0
//   mobileSwipeOffset.value = -currentMobilePage.value * screenWidth
// }

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

// 监听设备布局变化，重置移动端页面状态
watch(() => document.documentElement.className, () => {
  updateLayoutState()
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  if (isMobile) {
    // 重置到第一页
    currentMobilePage.value = 0
    mobileSwipeOffset.value = 0
    // 重新绑定事件（因为 v-if 会导致元素重新创建）
    nextTick(() => {
      bindTouchEvents()
    })
  }
})

// 监听 isMobileLayout 变化，重新绑定事件
watch(isMobileLayout, (isMobile) => {
  if (isMobile) {
    // 切换到移动端布局时，等待 DOM 更新后绑定事件
    nextTick(() => {
      bindTouchEvents()
    })
  } else {
    // 切换到桌面布局时，解绑事件
    unbindTouchEvents()
  }
})

// 点击切换页面
function handleClick(e: MouseEvent) {
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  // 只在移动端布局且非横屏时启用点击切换
  if (!isMobile || isLandscape) {
    return
  }

  // 如果正在滑动，不处理点击
  if (isSwiping.value) {
    return
  }

  // 标记页面正在切换
  isPageTransitioning.value = true

  // 获取点击位置
  const clickX = e.clientX
  const screenWidth = window.innerWidth

  // 点击左侧1/3区域，切换到上一页
  if (clickX < screenWidth / 3) {
    if (currentMobilePage.value > 0) {
      currentMobilePage.value = 0
      mobileSwipeOffset.value = 0
    }
  }
  // 点击右侧1/3区域，切换到下一页
  else if (clickX > screenWidth * 2 / 3) {
    if (currentMobilePage.value < 1) {
      currentMobilePage.value = 1
      mobileSwipeOffset.value = -screenWidth
    }
  }

  // 延迟重置切换标志
  setTimeout(() => {
    isPageTransitioning.value = false
  }, 300)
}

// 鼠标事件处理（用于桌面浏览器测试）
let isMouseDown = false
let mouseDownTime = 0
let mouseDownX = 0

function handleMouseDown(e: MouseEvent) {
  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  if (!isMobile || isLandscape) return

  isMouseDown = true
  mouseDownTime = Date.now()
  mouseDownX = e.clientX
  touchStartX.value = e.clientX
  touchStartY.value = e.clientY
  isSwiping.value = false
  isPageTransitioning.value = true // 标记页面可能正在切换
}

function handleMouseMove(e: MouseEvent) {
  if (!isMouseDown) return

  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  if (!isMobile || isLandscape) return

  const mouseX = e.clientX
  const mouseY = e.clientY
  const deltaX = mouseX - touchStartX.value
  const deltaY = mouseY - touchStartY.value

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    isSwiping.value = true
    e.preventDefault()

    const screenWidth = window.innerWidth
    const baseOffset = -currentMobilePage.value * screenWidth
    let newOffset = baseOffset + deltaX

    if (newOffset > 0) {
      newOffset = deltaX * 0.5
    } else if (newOffset < -screenWidth) {
      newOffset = -screenWidth + (deltaX - screenWidth) * 0.5
    }

    mobileSwipeOffset.value = newOffset
  }
}

function handleMouseUp(e: MouseEvent) {
  if (!isMouseDown) return

  const isMobile = document.documentElement.classList.contains('mobile-layout')
  const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 500

  const wasSwiping = isSwiping.value

  isMouseDown = false

  if (!isMobile || isLandscape) {
    return
  }

  // 如果有滑动，处理滑动逻辑
  if (wasSwiping) {
    const screenWidth = window.innerWidth
    const threshold = screenWidth * 0.25

    if (Math.abs(mobileSwipeOffset.value + currentMobilePage.value * screenWidth) > threshold) {
      if (mobileSwipeOffset.value > -currentMobilePage.value * screenWidth) {
        currentMobilePage.value = Math.max(0, currentMobilePage.value - 1)
      } else {
        currentMobilePage.value = Math.min(1, currentMobilePage.value + 1)
      }
    }

    mobileSwipeOffset.value = -currentMobilePage.value * screenWidth
  }

  // 延迟重置 isSwiping，让 click 事件能正确判断
  setTimeout(() => {
    isSwiping.value = false
  }, 50)

  // 延迟重置切换标志，确保动画完成后才允许歌词滚动
  setTimeout(() => {
    isPageTransitioning.value = false
  }, 300)
}

// 关闭播放列表
function closePlaylist() {
  playerStore.showPlaylist = false
}

// 绑定触摸和鼠标事件监听器
function bindTouchEvents() {
  if (mobileSwipeContainer.value) {
    // 触摸事件
    mobileSwipeContainer.value.addEventListener('touchstart', handleTouchStart as any, { passive: true })
    mobileSwipeContainer.value.addEventListener('touchmove', handleTouchMove as any, { passive: false })
    mobileSwipeContainer.value.addEventListener('touchend', handleTouchEnd as any, { passive: true })
    // 鼠标事件（用于桌面浏览器测试）
    mobileSwipeContainer.value.addEventListener('mousedown', handleMouseDown as any)
    mobileSwipeContainer.value.addEventListener('mousemove', handleMouseMove as any)
    mobileSwipeContainer.value.addEventListener('mouseup', handleMouseUp as any)
    mobileSwipeContainer.value.addEventListener('mouseleave', handleMouseUp as any) // 鼠标离开时也触发
    // 点击事件
    mobileSwipeContainer.value.addEventListener('click', handleClick as any)
  }
}

// 解绑触摸和鼠标事件监听器
function unbindTouchEvents() {
  if (mobileSwipeContainer.value) {
    // 触摸事件
    mobileSwipeContainer.value.removeEventListener('touchstart', handleTouchStart as any)
    mobileSwipeContainer.value.removeEventListener('touchmove', handleTouchMove as any)
    mobileSwipeContainer.value.removeEventListener('touchend', handleTouchEnd as any)
    // 鼠标事件
    mobileSwipeContainer.value.removeEventListener('mousedown', handleMouseDown as any)
    mobileSwipeContainer.value.removeEventListener('mousemove', handleMouseMove as any)
    mobileSwipeContainer.value.removeEventListener('mouseup', handleMouseUp as any)
    mobileSwipeContainer.value.removeEventListener('mouseleave', handleMouseUp as any)
    // 点击事件
    mobileSwipeContainer.value.removeEventListener('click', handleClick as any)
  }
}

onMounted(() => {
  if (currentSong.value) {
    loadLyric()
  }

  // 确保移动端从第一页开始
  currentMobilePage.value = 0
  mobileSwipeOffset.value = 0

  // 初始化布局状态
  updateLayoutState()

  // 初始化可视化效果
  nextTick(() => {
    if (spectrumCanvas.value) {
      // 增大 canvas 尺寸以容纳更长的波纹
      spectrumCanvas.value.width = 800
      spectrumCanvas.value.height = 800
    }
    initParticles()

    // 尝试绑定触摸事件（如果容器已存在）
    bindTouchEvents()

    // 延迟初始化音频可视化，确保音频元素已加载
    setTimeout(() => {
      console.log('尝试初始化音频可视化，播放状态:', playerStore.isPlaying)
      initAudioVisualization()
    }, 500)
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    updateLayoutState()
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth
      particleCanvas.value.height = window.innerHeight
    }
    // 重置移动端滑动位置
    const screenWidth = window.innerWidth
    mobileSwipeOffset.value = -currentMobilePage.value * screenWidth
  })
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (particleAnimationId.value) {
    cancelAnimationFrame(particleAnimationId.value)
  }
  // 移除触摸事件监听器
  unbindTouchEvents()
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
  height: 250px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.2;
  overflow: hidden;
}

.wave-bar {
  position: absolute;
  bottom: 0;
  width: 1.5%;
  height: 150px;
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
  padding-top: 0;
}

.song-header {
  flex-shrink: 0;
  margin-bottom: 24px;
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
  max-height: 400px;
  overflow-y: auto;
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
  padding: 20px 20px 150px 0;
  min-height: 0;
}

.lyric-container::-webkit-scrollbar {
  width: 6px;
}

.lyric-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.lyric-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.lyric-line {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.35);
  transition: all 0.3s ease;
  padding: 8px 0;
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

.lyric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lyric-main {
  display: flex;
}

.lyric-text {
  display: block;
  font-size: 18px;
  line-height: 2.5;
}

.lyric-translation {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.25);
  line-height: 1.5;
}

.lyric-line.active {
  color: #fff;
  text-shadow: 0 0 20px rgba(138, 190, 185, 0.5);
}

.lyric-line.active .lyric-time {
  color: rgba(255, 255, 255, 0.5);
}

.lyric-line.active .lyric-text {
  font-size: 22px;
  font-weight: 600;
}

.lyric-line.active .lyric-translation {
  color: rgba(255, 255, 255, 0.45);
  font-size: 15px;
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

/* 移动端滑动容器 */
.mobile-swipe-container {
  display: flex !important;
  width: 200vw !important;
  height: calc(100vh - 140px) !important;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  will-change: transform !important;
  position: relative !important;
  z-index: 2 !important;
}

/* 桌面端内容 */
.desktop-content {
  display: grid !important;
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
  bottom: calc(88px + 20px);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

/* 移动端适配 - 使用 .mobile-layout 类（覆盖 0-1000px）*/
.mobile-layout .play-page {
  height: calc(100vh - 140px) !important;
  overflow: hidden !important;
}

.mobile-layout .particle-canvas {
  height: calc(100vh - 140px) !important;
}

.mobile-layout .wave-background {
  bottom: 140px !important;
  height: 200px !important;
}

.mobile-layout .back-btn {
  top: 16px !important;
  left: 16px !important;
  width: 40px !important;
  height: 40px !important;
  z-index: 1001 !important;
}

.mobile-layout .back-btn .icon-svg {
  width: 18px !important;
  height: 18px !important;
}

.mobile-layout .mobile-page {
  width: 100vw;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 唱片页 */
.mobile-layout .disc-page {
  padding: 60px 20px 20px;
  justify-content: center;
  align-items: center;
}

.mobile-layout .disc-page .left-section {
  padding: 0;
  flex-shrink: 0;
}

.mobile-layout .disc-page .disc-wrapper {
  width: 280px;
  height: 280px;
}

.mobile-layout .disc-page .spectrum-canvas {
  width: 450px !important;
  height: 450px !important;
}

.mobile-layout .disc-page .needle {
  width: 80px;
  height: 120px;
  right: 50px;
  top: -30px;
}

.mobile-layout .disc-page .disc-bg {
  padding: 16px;
}

.mobile-layout .disc-page .disc-center {
  width: 60px;
  height: 60px;
}

.mobile-layout .mobile-song-info {
  margin-top: 40px;
  text-align: center;
  width: 100%;
  padding: 0 20px;
}

.mobile-layout .mobile-song-info .title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mobile-layout .mobile-song-info .song-title {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mobile-layout .mobile-song-info .download-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.mobile-layout .mobile-song-info .song-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-layout .mobile-song-info .info-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* 歌词页 */
.mobile-layout .lyric-page {
  padding: 80px 20px 20px;
}

.mobile-layout .lyric-section-mobile {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.mobile-layout .lyric-section-mobile .lyric-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px 0 150px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-layout .lyric-section-mobile .lyric-container::-webkit-scrollbar {
  display: none;
}

.mobile-layout .lyric-section-mobile .lyric-line {
  display: flex;
  justify-content: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  padding: 8px 20px;
  cursor: default;
  text-align: center;
  width: 100%;
  max-width: 600px;
}

.mobile-layout .lyric-section-mobile .lyric-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.mobile-layout .lyric-section-mobile .lyric-main {
  display: flex;
  justify-content: center;
}

.mobile-layout .lyric-section-mobile .lyric-line .lyric-text {
  display: block;
  font-size: 16px;
  line-height: 2.5;
}

.mobile-layout .lyric-section-mobile .lyric-line .lyric-translation {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  line-height: 1.5;
}

.mobile-layout .lyric-section-mobile .lyric-line.active {
  color: #fff;
  text-shadow: 0 0 20px rgba(138, 190, 185, 0.5);
  transform: scale(1.05);
}

.mobile-layout .lyric-section-mobile .lyric-line.active .lyric-text {
  font-size: 20px;
  font-weight: 600;
}

.mobile-layout .lyric-section-mobile .lyric-line.active .lyric-translation {
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}

.mobile-layout .lyric-section-mobile .no-lyric {
  text-align: center;
  padding: 100px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.mobile-layout .lyric-section-mobile .no-lyric-icon {
  width: 80px;
  height: 80px;
  fill: rgba(138, 190, 185, 0.5);
  display: block;
  margin: 0 auto 16px;
  filter: drop-shadow(0 4px 12px rgba(138, 190, 185, 0.2));
}

/* 页面指示器 */
.mobile-layout .page-indicator {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 100;
  pointer-events: none;
}

.mobile-layout .indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mobile-layout .indicator-dot.active {
  background: rgba(138, 190, 185, 0.95);
  width: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(138, 190, 185, 0.5);
}

.mobile-layout .playlist-overlay {
  z-index: 100;
}

.mobile-layout .playlist-section {
  position: fixed;
  right: 0;
  left: 0;
  top: auto;
  bottom: 140px;
  width: 100%;
  max-height: 50vh;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  z-index: 101;
}

/* 移动端下载菜单优化 - 相对于第一个页面（唱片页）居中 */
.mobile-layout .disc-page .download-menu {
  position: fixed !important;
  top: auto !important;
  left: 50vw !important;
  bottom: 160px !important;
  transform: translateX(-50%) !important;
  margin-top: 0 !important;
  min-width: 200px;
  max-width: calc(100vw - 40px);
  max-height: 60vh;
}

.mobile-layout .download-menu .menu-title {
  font-size: 14px;
  padding: 12px 16px 10px;
}

.mobile-layout .download-menu .quality-option {
  padding: 12px 16px;
}

.mobile-layout .download-menu .option-label {
  font-size: 15px;
}

.mobile-layout .download-menu .option-desc {
  font-size: 13px;
}

@media (max-width: 480px) {
  .mobile-layout .disc-page .disc-wrapper {
    width: 240px;
    height: 240px;
  }

  .mobile-layout .disc-page .spectrum-canvas {
    width: 300px !important;
    height: 300px !important;
  }

  .mobile-layout .disc-page .needle {
    width: 70px;
    height: 100px;
    right: 40px;
  }

  .mobile-layout .mobile-song-info .song-title {
    font-size: 20px;
  }

  .mobile-layout .mobile-song-info .download-btn {
    width: 36px;
    height: 36px;
  }

  .mobile-layout .mobile-song-info .info-item {
    font-size: 12px;
  }

  .mobile-layout .lyric-section-mobile .lyric-line {
    font-size: 15px;
  }

  .mobile-layout .lyric-section-mobile .lyric-line.active {
    font-size: 18px;
  }
}

/* 横屏适配 */
@media (max-width: 1024px) and (orientation: landscape) and (max-height: 500px) {
  .mobile-layout .mobile-swipe-container {
    display: none !important;
  }

  .mobile-layout .desktop-content {
    display: grid !important;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
  }

  .mobile-layout .disc-wrapper {
    width: 220px;
    height: 220px;
  }

  .mobile-layout .spectrum-canvas {
    width: 280px !important;
    height: 280px !important;
  }

  .mobile-layout .lyric-container {
    padding: 10px 0 100px 0;
  }
}
</style>
