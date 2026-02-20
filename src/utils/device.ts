/**
 * 设备检测工具
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean // 已废弃，保留以兼容旧代码
  isDesktop: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  deviceType: 'mobile' | 'desktop' // 移除 'tablet' 类型
}

/**
 * 检测是否为移动设备（包括平板）
 */
export function isMobileDevice(): boolean {
  const width = window.innerWidth

  // 1000px 以下判定为移动设备
  return width <= 1000
}

/**
 * 检测是否为平板设备（已废弃，现在统一为移动端）
 */
export function isTabletDevice(): boolean {
  // 平板布局已取消，统一归入移动端
  return false
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         (window.matchMedia && window.matchMedia('(hover: none)').matches)
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth
  const height = window.innerHeight
  const isMobile = isMobileDevice()
  const isTablet = false // 平板布局已取消
  const isDesktop = !isMobile
  const isTouch = isTouchDevice()

  const deviceType: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isTouch,
    screenWidth: width,
    screenHeight: height,
    deviceType
  }
}

/**
 * 监听设备变化
 */
export function watchDeviceChange(callback: (info: DeviceInfo) => void): () => void {
  const handler = () => {
    callback(getDeviceInfo())
  }

  window.addEventListener('resize', handler)
  window.addEventListener('orientationchange', handler)

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handler)
    window.removeEventListener('orientationchange', handler)
  }
}

