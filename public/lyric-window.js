/**
 * 桌面歌词窗口脚本
 */

// DOM 元素
const currentLyricEl = document.getElementById('currentLyric')
const currentLyricTransEl = document.getElementById('currentLyricTrans')
const nextLyricEl = document.getElementById('nextLyric')
const nextLyricTransEl = document.getElementById('nextLyricTrans')
const lockBtn = document.getElementById('lockBtn')
const closeBtn = document.getElementById('closeBtn')
const orientationBtn = document.getElementById('orientationBtn')
const fontSizeBtn = document.getElementById('fontSizeBtn')
const fontSizeIndicator = document.getElementById('fontSizeIndicator')
const toggleNextBtn = document.getElementById('toggleNextBtn')

// 状态
let lyrics = []
let lyricsTrans = []
let currentTime = 0
let isLocked = false
let currentOrientation = 'horizontal' // 'horizontal', 'vertical'
let currentFontSize = 'medium' // 'xsmall', 'small', 'medium', 'large', 'xlarge'
let showNextLyric = true // 是否显示下一句歌词

// 字体大小配置
const fontSizes = ['xsmall', 'small', 'medium', 'large', 'xlarge']
const fontSizeNames = {
  xsmall: '极小',
  small: '小',
  medium: '中',
  large: '大',
  xlarge: '特大'
}

/**
 * 检测文本是否包含中日韩文字
 * @param {string} text - 要检测的文本
 * @returns {boolean} - 是否包含中日韩文字
 */
function hasCJKText(text) {
  if (!text) return false

  // 检查是否包含中文、日文、韩文字符
  // \u4e00-\u9fa5: 中文
  // \u3040-\u309f: 日文平假名
  // \u30a0-\u30ff: 日文片假名
  // \uac00-\ud7af: 韩文
  return /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(text)
}

/**
 * 判断一句歌词是否需要旋转
 * 规则：
 * 1. 纯西文（英文/德语/法语等）-> 旋转
 * 2. 纯中日韩文 -> 不旋转
 * 3. 中英混合 -> 旋转
 * @param {string} text - 歌词文本
 * @returns {boolean} - 是否需要旋转
 */
function shouldRotateLyric(text) {
  if (!text) return false

  const hasCJK = hasCJKText(text)
  const hasLatin = /[a-zA-Z]/.test(text)

  // 如果包含中日韩文字
  if (hasCJK) {
    // 中英混合 -> 旋转
    return hasLatin
  }

  // 纯西文 -> 旋转
  return hasLatin
}

/**
 * 查找当前应该显示的歌词
 */
function findCurrentLyric(time) {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (time >= lyrics[i].time) {
      return {
        current: lyrics[i],
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

/**
 * 更新歌词显示
 */
function updateLyricDisplay() {
  if (lyrics.length === 0) {
    currentLyricEl.textContent = '暂无歌词'
    currentLyricTransEl.textContent = ''
    nextLyricEl.textContent = ''
    nextLyricTransEl.textContent = ''
    currentLyricEl.classList.remove('rotate-text')
    nextLyricEl.classList.remove('rotate-text')
    return
  }

  const { current, next } = findCurrentLyric(currentTime)

  if (current) {
    currentLyricEl.textContent = current.text

    // 判断当前歌词是否需要旋转（仅在竖直模式下）
    if (currentOrientation === 'vertical' && shouldRotateLyric(current.text)) {
      currentLyricEl.classList.add('rotate-text')
      console.log('当前歌词需要旋转:', current.text)
    } else {
      currentLyricEl.classList.remove('rotate-text')
    }

    if (next) {
      nextLyricEl.textContent = next.text

      // 判断下一句歌词是否需要旋转（仅在竖直模式下）
      if (currentOrientation === 'vertical' && shouldRotateLyric(next.text)) {
        nextLyricEl.classList.add('rotate-text')
      } else {
        nextLyricEl.classList.remove('rotate-text')
      }
    } else {
      nextLyricEl.textContent = ''
      nextLyricEl.classList.remove('rotate-text')
    }

    // 显示翻译（如果有）- 翻译永远不旋转
    if (lyricsTrans.length > 0) {
      const currentTrans = lyricsTrans.find(t => t.time === current.time)
      currentLyricTransEl.textContent = currentTrans ? currentTrans.text : ''

      if (next) {
        const nextTrans = lyricsTrans.find(t => t.time === next.time)
        nextLyricTransEl.textContent = nextTrans ? nextTrans.text : ''
      } else {
        nextLyricTransEl.textContent = ''
      }
    } else {
      currentLyricTransEl.textContent = ''
      nextLyricTransEl.textContent = ''
    }
  } else {
    currentLyricEl.textContent = '等待歌词...'
    currentLyricTransEl.textContent = ''
    currentLyricEl.classList.remove('rotate-text')

    if (next) {
      nextLyricEl.textContent = next.text

      // 判断下一句歌词是否需要旋转
      if (currentOrientation === 'vertical' && shouldRotateLyric(next.text)) {
        nextLyricEl.classList.add('rotate-text')
      } else {
        nextLyricEl.classList.remove('rotate-text')
      }

      if (lyricsTrans.length > 0) {
        const nextTrans = lyricsTrans.find(t => t.time === next.time)
        nextLyricTransEl.textContent = nextTrans ? nextTrans.text : ''
      } else {
        nextLyricTransEl.textContent = ''
      }
    } else {
      nextLyricEl.textContent = ''
      nextLyricTransEl.textContent = ''
      nextLyricEl.classList.remove('rotate-text')
    }
  }
}

/**
 * 切换下一句歌词显示
 */
function toggleNextLyric() {
  showNextLyric = !showNextLyric

  // 更新UI
  if (showNextLyric) {
    document.body.classList.remove('hide-next-lyric')
    toggleNextBtn.classList.add('active')
  } else {
    document.body.classList.add('hide-next-lyric')
    toggleNextBtn.classList.remove('active')
  }

  // 保存设置
  if (window.electronAPI) {
    window.electronAPI.send('save-show-next-lyric', showNextLyric)
  }

  console.log('切换下一句歌词显示:', showNextLyric)
}

/**
 * 循环切换字体大小
 */
function cycleFontSize() {
  const currentIndex = fontSizes.indexOf(currentFontSize)
  const nextIndex = (currentIndex + 1) % fontSizes.length
  const nextSize = fontSizes[nextIndex]

  setFontSize(nextSize)
}

/**
 * 设置字体大小
 */
function setFontSize(size) {
  // 移除所有字体大小类
  document.body.classList.remove('font-xsmall', 'font-small', 'font-medium', 'font-large', 'font-xlarge')

  // 添加新的字体大小类
  document.body.classList.add(`font-${size}`)
  currentFontSize = size

  // 更新按钮提示
  const sizeName = fontSizeNames[size]
  fontSizeBtn.title = `调整字体大小 (当前: ${sizeName})`

  // 保存到本地存储
  if (window.electronAPI) {
    window.electronAPI.send('save-font-size', size)
  }

  console.log('字体大小已切换为:', sizeName)
}

/**
 * 切换锁定状态
 */
function toggleLock() {
  console.log('[toggleLock] 开始切换锁定状态，当前状态:', isLocked)
  isLocked = !isLocked
  console.log('[toggleLock] 切换后状态:', isLocked)
  
  document.body.classList.toggle('locked', isLocked)
  lockBtn.classList.toggle('active', isLocked)

  // 更新图标
  if (isLocked) {
    lockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14">
      <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"/>
    </svg>`
    console.log('[toggleLock] 已设置锁定图标')
  } else {
    lockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="14" height="14">
      <path fill="currentColor" d="M384 96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-70.7-57.3-128-128-128S320 25.3 320 96l0 64-160 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-32 0 0-64z"/>
    </svg>`
    console.log('[toggleLock] 已设置解锁图标')
  }

  // 通知主进程设置鼠标穿透和保存状态
  if (window.electronAPI) {
    console.log('[toggleLock] 发送 set-ignore-mouse:', isLocked)
    window.electronAPI.send('set-ignore-mouse', isLocked)
    
    console.log('[toggleLock] 发送 lyric-lock-changed:', isLocked)
    // 通知主窗口锁定状态变化
    window.electronAPI.send('lyric-lock-changed', isLocked)
    
    console.log('[toggleLock] 发送 save-lock-state:', isLocked)
    // 立即保存锁定状态
    window.electronAPI.send('save-lock-state', isLocked)
    
    console.log('[toggleLock] 所有 IPC 消息已发送')
  } else {
    console.error('[toggleLock] window.electronAPI 不存在！')
  }
  
  console.log('[toggleLock] 锁定状态切换完成')
}

/**
 * 设置锁定状态（用于恢复）
 */
function setLockState(locked) {
  console.log('[setLockState] 开始设置锁定状态:', locked)
  console.log('[setLockState] 设置前 body.classList:', document.body.classList.toString())
  
  isLocked = locked
  
  if (isLocked) {
    document.body.classList.add('locked')
    lockBtn.classList.add('active')
    console.log('[setLockState] 已添加 locked 类')
  } else {
    document.body.classList.remove('locked')
    lockBtn.classList.remove('active')
    console.log('[setLockState] 已移除 locked 类')
  }

  console.log('[setLockState] 设置后 body.classList:', document.body.classList.toString())
  console.log('[setLockState] body.classList.contains("locked"):', document.body.classList.contains('locked'))

  // 更新图标
  if (isLocked) {
    lockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14">
      <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"/>
    </svg>`
    console.log('[setLockState] 已设置锁定图标')
  } else {
    lockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="14" height="14">
      <path fill="currentColor" d="M384 96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-70.7-57.3-128-128-128S320 25.3 320 96l0 64-160 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-32 0 0-64z"/>
    </svg>`
    console.log('[setLockState] 已设置解锁图标')
  }

  // 通知主进程设置鼠标穿透
  if (window.electronAPI) {
    console.log('[setLockState] 发送 set-ignore-mouse:', isLocked)
    window.electronAPI.send('set-ignore-mouse', isLocked)
    // 通知主窗口锁定状态变化
    console.log('[setLockState] 发送 lyric-lock-changed:', isLocked)
    window.electronAPI.send('lyric-lock-changed', isLocked)
    // 注意：这里不需要保存状态，因为是从保存的状态恢复的
  }

  console.log('[setLockState] 锁定状态已设置为:', isLocked)
  
  // 验证 CSS 样式是否生效
  const computedStyle = window.getComputedStyle(document.body)
  console.log('[setLockState] body border:', computedStyle.border)
  console.log('[setLockState] body cursor:', computedStyle.cursor)
  
  const controls = document.querySelector('.controls')
  if (controls) {
    const controlBtns = controls.querySelectorAll('.control-btn:not(#lockBtn)')
    console.log('[setLockState] 非锁定按钮数量:', controlBtns.length)
    controlBtns.forEach((btn, index) => {
      const btnStyle = window.getComputedStyle(btn)
      console.log(`[setLockState] 按钮 ${index} display:`, btnStyle.display)
    })
  }
}

/**
 * 切换窗口方向
 */
function toggleOrientation() {
  currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal'
  document.body.classList.toggle('vertical', currentOrientation === 'vertical')

  // 切换方向后重新更新歌词显示（判断是否需要旋转）
  updateLyricDisplay()

  // 通知主进程调整窗口尺寸
  if (window.electronAPI) {
    window.electronAPI.send('toggle-lyric-orientation', currentOrientation)
  }
}

/**
 * 设置窗口方向
 */
function setOrientation(orientation) {
  currentOrientation = orientation
  document.body.classList.toggle('vertical', currentOrientation === 'vertical')

  // 设置方向后重新更新歌词显示（判断是否需要旋转）
  updateLyricDisplay()

  console.log('方向已设置为:', orientation)
}

/**
 * 关闭窗口
 */
function closeWindow() {
  if (window.electronAPI) {
    window.electronAPI.send('lyric-window-close')
  }
}

// 监听主进程消息
console.log('[初始化] window.electronAPI 是否存在:', !!window.electronAPI)

if (window.electronAPI) {
  console.log('[初始化] 开始注册所有消息监听器')
  
  // 接收歌词数据
  window.electronAPI.on('lyric-data', (data) => {
    console.log('收到歌词数据:', data)
    lyrics = data.lyrics || []
    lyricsTrans = data.lyricsTrans || []
    console.log('歌词数量:', lyrics.length)
    console.log('翻译歌词数量:', lyricsTrans.length)
    if (lyrics.length > 0) {
      console.log('第一句歌词:', lyrics[0])
    }
    updateLyricDisplay()
  })

  // 接收时间更新
  window.electronAPI.on('time-update', (time) => {
    currentTime = time
    updateLyricDisplay()
  })

  // 接收强制解锁命令
  window.electronAPI.on('force-unlock', () => {
    console.log('收到强制解锁命令')
    if (isLocked) {
      isLocked = false
      document.body.classList.remove('locked')
      lockBtn.classList.remove('active')
      // 恢复解锁图标
      lockBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="14" height="14">
        <path fill="currentColor" d="M384 96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-70.7-57.3-128-128-128S320 25.3 320 96l0 64-160 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-32 0 0-64z"/>
      </svg>`
    }
  })

  // 接收方向变化通知
  window.electronAPI.on('orientation-changed', (orientation) => {
    console.log('收到方向变化通知:', orientation)
    setOrientation(orientation)
  })

  // 接收字体大小设置
  window.electronAPI.on('font-size-setting', (size) => {
    console.log('收到字体大小设置:', size)
    setFontSize(size)
  })

  // 接收显示下一句设置
  window.electronAPI.on('show-next-lyric-setting', (show) => {
    console.log('收到显示下一句设置:', show)
    showNextLyric = show

    // 更新UI
    if (show) {
      document.body.classList.remove('hide-next-lyric')
      toggleNextBtn.classList.add('active')
    } else {
      document.body.classList.add('hide-next-lyric')
      toggleNextBtn.classList.remove('active')
    }
  })

  // 接收锁定状态设置
  console.log('[初始化] 注册 lock-state-setting 监听器')
  window.electronAPI.on('lock-state-setting', (locked) => {
    console.log('[lock-state-setting] ========== 收到锁定状态设置 ==========')
    console.log('[lock-state-setting] locked 参数值:', locked)
    console.log('[lock-state-setting] 当前 isLocked 状态:', isLocked)
    console.log('[lock-state-setting] body.classList:', document.body.classList.toString())
    
    // 立即设置，不延迟
    setLockState(locked)
    
    console.log('[lock-state-setting] 设置后 isLocked 状态:', isLocked)
    console.log('[lock-state-setting] 设置后 body.classList:', document.body.classList.toString())
    console.log('[lock-state-setting] ========== 处理完成 ==========')
  })
  
  console.log('[初始化] 所有消息监听器注册完成')
} else {
  console.error('[初始化] window.electronAPI 不存在！')
}

// 按钮事件
lockBtn.addEventListener('click', toggleLock)
closeBtn.addEventListener('click', closeWindow)
orientationBtn.addEventListener('click', toggleOrientation)
fontSizeBtn.addEventListener('click', cycleFontSize)
toggleNextBtn.addEventListener('click', toggleNextLyric)

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWindow()
  } else if (e.key === 'l' || e.key === 'L') {
    toggleLock()
  }
})

// ==================== 窗口调整大小功能 ====================

let isResizing = false
let resizeDirection = null
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let startPosX = 0
let startPosY = 0

/**
 * 开始调整大小
 */
function startResize(e, direction) {
  if (isLocked) return // 锁定状态下不允许调整大小

  isResizing = true
  resizeDirection = direction
  startX = e.screenX
  startY = e.screenY

  // 获取当前窗口尺寸和位置
  if (window.electronAPI) {
    window.electronAPI.send('get-window-bounds')
  }

  e.preventDefault()
  e.stopPropagation()
}

/**
 * 调整大小中
 */
function doResize(e) {
  if (!isResizing) return

  const deltaX = e.screenX - startX
  const deltaY = e.screenY - startY

  // 发送调整大小请求到主进程
  if (window.electronAPI) {
    window.electronAPI.send('resize-window', {
      direction: resizeDirection,
      deltaX,
      deltaY,
      startWidth,
      startHeight,
      startPosX,
      startPosY
    })
  }
}

/**
 * 结束调整大小
 */
function stopResize() {
  isResizing = false
  resizeDirection = null
}

// 监听窗口尺寸信息
if (window.electronAPI) {
  window.electronAPI.on('window-bounds', (bounds) => {
    startWidth = bounds.width
    startHeight = bounds.height
    startPosX = bounds.x
    startPosY = bounds.y
  })
}

// 为所有调整手柄添加事件监听
const resizeHandles = document.querySelectorAll('.resize-handle')
resizeHandles.forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    const direction = Array.from(handle.classList).find(cls => cls !== 'resize-handle')
    startResize(e, direction)
  })
})

// 全局鼠标移动和释放事件
document.addEventListener('mousemove', doResize)
document.addEventListener('mouseup', stopResize)

// 初始化
console.log('歌词窗口已加载')

// 初始化显示下一句按钮状态
if (showNextLyric) {
  toggleNextBtn.classList.add('active')
  document.body.classList.remove('hide-next-lyric')
} else {
  toggleNextBtn.classList.remove('active')
  document.body.classList.add('hide-next-lyric')
}

updateLyricDisplay()

// 注意：不需要在这里请求加载设置，因为主进程会在 did-finish-load 事件中自动发送所有设置

