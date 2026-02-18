// API 配置文件

// API 服务地址配置（保留用于搜索等功能，可选）
// 如果不需要可以设置为空字符串
export const API_BASE_URL = ''

// Cookie 配置
// Cookie 现在从后端文件中读取：
// 1. 优先使用扫码登录后保存的 Cookie (.ai/Netease_url/login_cookie.txt)
// 2. 如果没有登录 Cookie，则使用默认 Cookie (.ai/Netease_url/cookie.txt)
export const NETEASE_COOKIE = ''

// 音质等级
export enum QualityLevel {
  STANDARD = 'standard',    // 标准音质 (128kbps)
  EXHIGH = 'exhigh',        // 极高音质 (320kbps)
  LOSSLESS = 'lossless',    // 无损音质 (FLAC)
  HIRES = 'hires',          // Hi-Res音质 (24bit/96kHz)
  JYEFFECT = 'jyeffect',    // 高清环绕声
  SKY = 'sky',              // 沉浸环绕声
  JYMASTER = 'jymaster'     // 超清母带
}

// 默认音质
export const DEFAULT_QUALITY = QualityLevel.LOSSLESS

