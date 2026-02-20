// 简单的 Node.js 代理服务器
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import CryptoJS from 'crypto-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// 配置 CORS，支持 credentials
app.use(cors({
  origin: (origin, callback) => {
    // 允许所有 localhost 端口
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true // 允许携带凭证
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 读取 Cookie 的函数
function getCookie() {
  const loginCookiePath = path.join(__dirname, 'login_cookie.txt')
  const defaultCookiePath = path.join(__dirname, 'cookie.txt')

  // 优先使用登录后的 Cookie
  if (fs.existsSync(loginCookiePath)) {
    const loginCookie = fs.readFileSync(loginCookiePath, 'utf-8').trim()
    if (loginCookie) {
      console.log('✅ 使用扫码登录的 Cookie')
      return loginCookie
    }
  }

  // 否则使用默认 Cookie
  if (fs.existsSync(defaultCookiePath)) {
    const defaultCookie = fs.readFileSync(defaultCookiePath, 'utf-8').trim()
    if (defaultCookie) {
      console.log('ℹ️ 使用默认 Cookie')
      return defaultCookie
    }
  }

  console.warn('⚠️ 未找到任何 Cookie 文件')
  return ''
}

// AES 密钥
const AES_KEY = CryptoJS.enc.Utf8.parse('e82ckenh8dichen8')

// WEAPI 加密密钥
const WEAPI_PRESET_KEY = '0CoJUm6Qyw8W8jud'
const WEAPI_IV = '0102030405060708'
const WEAPI_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----'

// EAPI 加密参数
function encryptParams(url, payload) {
  const urlPath = new URL(url).pathname.replace('/eapi/', '/api/')
  const payloadStr = JSON.stringify(payload)
  const message = `nobody${urlPath}use${payloadStr}md5forencrypt`
  const digest = CryptoJS.MD5(message).toString()
  const params = `${urlPath}-36cd479b6b5-${payloadStr}-36cd479b6b5-${digest}`

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(params),
    AES_KEY,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  )

  return encrypted.ciphertext.toString()
}

// WEAPI 加密参数
function weapiEncrypt(text) {
  // 生成随机的 16 位字符串
  const secKey = Array.from({ length: 16 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
      Math.floor(Math.random() * 62)
    )
  ).join('')

  // 第一次 AES 加密
  const encrypted1 = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Utf8.parse(WEAPI_PRESET_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(WEAPI_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()

  // 第二次 AES 加密
  const params = CryptoJS.AES.encrypt(
    encrypted1,
    CryptoJS.enc.Utf8.parse(secKey),
    {
      iv: CryptoJS.enc.Utf8.parse(WEAPI_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()

  // RSA 加密 secKey（简化版，直接返回十六进制）
  const encSecKey = Buffer.from(secKey.split('').reverse().join('')).toString('hex')

  return {
    params,
    encSecKey
  }
}

// 代理 EAPI 请求
app.post('/proxy/eapi/*', async (req, res) => {
  try {
    const targetPath = req.params[0]
    const targetUrl = `https://interface3.music.163.com/eapi/${targetPath}`
    const payload = req.body

    const encryptedParams = encryptParams(targetUrl, payload)
    const cookie = getCookie()

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': `os=pc; appver=; osver=; deviceId=pyncm!; ${cookie}`
      },
      body: `params=${encryptedParams}`
    })

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('代理错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 代理普通 API 请求
app.all('/proxy/api/*', async (req, res) => {
  try {
    const targetPath = req.params[0]
    const cookie = getCookie()

    // 构建完整的 URL（包含查询参数）
    let targetUrl = `https://music.163.com/api/${targetPath}`
    if (req.method === 'GET' && Object.keys(req.query).length > 0) {
      const queryString = new URLSearchParams(req.query).toString()
      targetUrl += `?${queryString}`
    }

    console.log(`代理 API 请求: ${req.method} ${targetUrl}`)

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': `os=pc; appver=8.9.70; ${cookie}`
      },
      body: req.method === 'POST' ? new URLSearchParams(req.body).toString() : undefined
    })

    const data = await response.json()
    console.log(`API 响应 (${targetPath}):`, data.code || data)
    res.json(data)
  } catch (error) {
    console.error('代理错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 代理音频流
app.get('/proxy/audio', async (req, res) => {
  try {
    const url = req.query.url
    if (!url) {
      return res.status(400).json({ error: '缺少 URL 参数' })
    }

    console.log('代理音频请求:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
      }
    })

    if (!response.ok) {
      console.error('音频请求失败:', response.status, response.statusText)
      return res.status(response.status).json({ error: `音频请求失败: ${response.status}` })
    }

    // 转发响应头 - 添加完整的 CORS 支持
    const contentType = response.headers.get('content-type') || 'audio/flac'
    const contentLength = response.headers.get('content-length')

    // 关键：必须先设置 CORS 头，再设置其他头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')

    res.setHeader('Content-Type', contentType)
    if (contentLength) {
      res.setHeader('Content-Length', contentLength)
    }
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=31536000')

    console.log('开始传输音频，Content-Type:', contentType, 'Content-Length:', contentLength)

    // node-fetch v3 的 body 已经是 Node.js stream，直接 pipe
    response.body.pipe(res)

    response.body.on('end', () => {
      console.log('音频传输完成')
    })

    response.body.on('error', (error) => {
      console.error('流式传输错误:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: error.message })
      }
    })
  } catch (error) {
    console.error('音频代理错误:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: error.message })
    }
  }
})

// 处理 OPTIONS 预检请求
app.options('/proxy/audio', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type')
  res.setHeader('Access-Control-Max-Age', '0') // 禁用缓存，立即生效
  res.status(204).end()
})

// 测试 CORS 配置的端点
app.get('/test-cors', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
})

// ==================== 登录相关路由 ====================

// 生成二维码 key
app.get('/login/qr/key', async (req, res) => {
  try {
    const timestamp = req.query.timestamp || Date.now()

    // 准备请求数据（使用 EAPI）
    const config = {
      os: 'pc',
      appver: '',
      osver: '',
      deviceId: 'pyncm!',
      requestId: String(Math.floor(Math.random() * 10000000) + 20000000)
    }

    const payload = {
      type: 1,
      header: JSON.stringify(config)
    }

    const targetUrl = 'https://interface3.music.163.com/eapi/login/qrcode/unikey'
    const encryptedParams = encryptParams(targetUrl, payload)

    console.log('请求二维码 key，加密参数:', encryptedParams.substring(0, 50) + '...')

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': 'os=pc; appver=; osver=; deviceId=pyncm!;'
      },
      body: `params=${encryptedParams}`
    })

    const text = await response.text()
    console.log('生成二维码 key 原始响应:', text)

    try {
      const result = JSON.parse(text)
      console.log('生成二维码 key 响应:', result)
      res.json(result)
    } catch (e) {
      console.error('JSON 解析失败:', e)
      res.status(500).json({ error: 'JSON 解析失败', raw: text })
    }
  } catch (error) {
    console.error('生成二维码 key 失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 生成二维码图片
app.get('/login/qr/create', async (req, res) => {
  try {
    const { key, qrimg, timestamp } = req.query
    const ts = timestamp || Date.now()

    console.log('请求二维码图片，参数 - key:', key, 'qrimg:', qrimg)

    // 准备请求数据（使用 EAPI）
    const config = {
      os: 'pc',
      appver: '',
      osver: '',
      deviceId: 'pyncm!',
      requestId: String(Math.floor(Math.random() * 10000000) + 20000000)
    }

    const payload = {
      key: key,
      type: 1,
      header: JSON.stringify(config)
    }

    const targetUrl = 'https://interface3.music.163.com/eapi/login/qrcode/client/login'
    const encryptedParams = encryptParams(targetUrl, payload)

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': 'os=pc; appver=; osver=; deviceId=pyncm!;'
      },
      body: `params=${encryptedParams}`
    })

    const text = await response.text()
    console.log('生成二维码图片原始响应:', text.substring(0, 500))

    try {
      const result = JSON.parse(text)
      console.log('生成二维码图片响应:', result)
      res.json(result)
    } catch (e) {
      console.error('JSON 解析失败:', e)
      res.status(500).json({ error: 'JSON 解析失败', raw: text.substring(0, 200) })
    }
  } catch (error) {
    console.error('生成二维码图片失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 检查二维码扫描状态
app.get('/login/qr/check', async (req, res) => {
  try {
    const { key, timestamp } = req.query
    const ts = timestamp || Date.now()

    console.log('检查二维码状态，参数 - key:', key)

    // 准备请求数据（使用 EAPI）
    const config = {
      os: 'pc',
      appver: '',
      osver: '',
      deviceId: 'pyncm!',
      requestId: String(Math.floor(Math.random() * 10000000) + 20000000)
    }

    const payload = {
      key: key,
      type: 1,
      header: JSON.stringify(config)
    }

    const targetUrl = 'https://interface3.music.163.com/eapi/login/qrcode/client/login'
    const encryptedParams = encryptParams(targetUrl, payload)

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': 'os=pc; appver=; osver=; deviceId=pyncm!;'
      },
      body: `params=${encryptedParams}`
    })

    const text = await response.text()
    console.log('检查二维码状态原始响应:', text)

    try {
      const result = JSON.parse(text)
      console.log('检查二维码状态响应:', result)

      // 如果登录成功，提取 Cookie
      if (result.code === 803) {
        const setCookieHeaders = response.headers.raw()['set-cookie']
        if (setCookieHeaders && setCookieHeaders.length > 0) {
          // 将所有 Set-Cookie 合并成一个字符串用于日志
          const allCookies = setCookieHeaders.join(' ')
          console.log('登录成功，获取到 Cookie:', allCookies)

          // 提取重要的 Cookie 值
          const cookieMap = {}
          setCookieHeaders.forEach(cookieStr => {
            // 只取第一个分号前的部分（cookie 名称和值）
            const mainPart = cookieStr.split(';')[0]
            const equalIndex = mainPart.indexOf('=')
            if (equalIndex > 0) {
              const name = mainPart.substring(0, equalIndex).trim()
              const value = mainPart.substring(equalIndex + 1).trim()
              // 只保留最后一次出现的值（覆盖重复的 Cookie）
              cookieMap[name] = value
            }
          })

          console.log('提取的关键 Cookie:')
          console.log('  - MUSIC_U:', cookieMap.MUSIC_U ? `${cookieMap.MUSIC_U.substring(0, 50)}... (长度: ${cookieMap.MUSIC_U.length})` : '未找到')
          console.log('  - __csrf:', cookieMap.__csrf || '未找到')
          console.log('  - NMTID:', cookieMap.NMTID || '未找到')

          // 构建完整的 Cookie 字符串（只包含必要的 Cookie）
          const cookieParts = []

          // 最重要的 Cookie
          if (cookieMap.MUSIC_U) cookieParts.push(`MUSIC_U=${cookieMap.MUSIC_U}`)
          if (cookieMap.__csrf) cookieParts.push(`__csrf=${cookieMap.__csrf}`)
          if (cookieMap.NMTID) cookieParts.push(`NMTID=${cookieMap.NMTID}`)
          if (cookieMap.MUSIC_A_T) cookieParts.push(`MUSIC_A_T=${cookieMap.MUSIC_A_T}`)
          if (cookieMap.MUSIC_R_T) cookieParts.push(`MUSIC_R_T=${cookieMap.MUSIC_R_T}`)

          // 添加其他必要的 Cookie
          cookieParts.push('os=pc')
          cookieParts.push('appver=8.9.70')

          const finalCookie = cookieParts.join('; ')
          console.log('✅ 最终 Cookie 字符串长度:', finalCookie.length)
          console.log('✅ Cookie 预览:', finalCookie.substring(0, 150) + '...')

          result.cookie = finalCookie

          // 保存 Cookie 到登录专用文件
          try {
            const cookieFilePath = path.join(__dirname, 'login_cookie.txt')
            fs.writeFileSync(cookieFilePath, finalCookie, 'utf-8')
            console.log('✅ Cookie 已成功保存到登录文件:', cookieFilePath)

            // 验证文件内容
            const savedContent = fs.readFileSync(cookieFilePath, 'utf-8')
            console.log('✅ 验证保存的 Cookie 长度:', savedContent.length)
          } catch (err) {
            console.error('❌ 保存 Cookie 到文件失败:', err)
          }
        } else {
          console.warn('⚠️ 登录成功但未获取到 Set-Cookie 头')
        }
      }

      res.json(result)
    } catch (e) {
      console.error('JSON 解析失败:', e)
      res.status(500).json({ error: 'JSON 解析失败', raw: text })
    }
  } catch (error) {
    console.error('检查二维码状态失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 获取登录状态
app.get('/login/status', async (req, res) => {
  try {
    const timestamp = req.query.timestamp || Date.now()
    const cookie = getCookie()

    const response = await fetch(`https://music.163.com/api/w/nuser/account/get?timestamp=${timestamp}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': cookie
      }
    })

    const text = await response.text()
    console.log('获取登录状态原始响应:', text)

    try {
      const data = JSON.parse(text)
      console.log('获取登录状态响应:', data)
      res.json(data)
    } catch (e) {
      console.error('JSON 解析失败:', e)
      res.status(500).json({ error: 'JSON 解析失败', raw: text })
    }
  } catch (error) {
    console.error('获取登录状态失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 退出登录（删除登录 Cookie 文件）
app.post('/login/logout', (req, res) => {
  try {
    const loginCookiePath = path.join(__dirname, 'login_cookie.txt')

    if (fs.existsSync(loginCookiePath)) {
      fs.unlinkSync(loginCookiePath)
      console.log('✅ 已删除登录 Cookie 文件')
      res.json({ code: 200, message: '退出登录成功' })
    } else {
      res.json({ code: 200, message: '未找到登录 Cookie' })
    }
  } catch (error) {
    console.error('❌ 退出登录失败:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🎵 音乐代理服务运行在 http://localhost:${PORT}`)
})

