// 网易云音乐 EAPI 加密工具
import CryptoJS from 'crypto-js'

// AES 密钥
const AES_KEY = CryptoJS.enc.Utf8.parse('e82ckenh8dichen8')

// 加密参数
export function encryptParams(url: string, payload: any): string {
  // 提取路径（处理相对路径和绝对路径）
  let urlPath: string
  if (url.startsWith('http')) {
    urlPath = new URL(url).pathname.replace('/eapi/', '/api/')
  } else {
    // 相对路径，直接使用
    urlPath = url.replace('/eapi/', '/api/')
  }
  
  // 计算 MD5
  const payloadStr = JSON.stringify(payload)
  const message = `nobody${urlPath}use${payloadStr}md5forencrypt`
  const digest = CryptoJS.MD5(message).toString()
  
  // 构建参数字符串
  const params = `${urlPath}-36cd479b6b5-${payloadStr}-36cd479b6b5-${digest}`
  
  // AES ECB 加密
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

// 发送 EAPI 请求
export async function eapiRequest(url: string, payload: any, cookies: Record<string, string> = {}): Promise<any> {
  const encryptedParams = encryptParams(url, payload)
  
  // 构建 Cookie 字符串
  const defaultCookies = {
    os: 'pc',
    appver: '',
    osver: '',
    deviceId: 'pyncm!'
  }
  const allCookies = { ...defaultCookies, ...cookies }
  const cookieStr = Object.entries(allCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieStr
    },
    body: `params=${encryptedParams}`
  })
  
  return await response.json()
}

