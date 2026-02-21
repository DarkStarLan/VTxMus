/**
 * Electron IPC 通信桥接
 * 提供安全的主进程通信接口
 */

/**
 * 检测是否在 Electron 环境中运行
 */
export function isElectron(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.process &&
    window.process.type === 'renderer'
  )
}

/**
 * 向主进程发送消息
 * @param channel 频道名称
 * @param data 数据
 */
export function sendToMain(channel: string, data?: any): void {
  if (isElectron() && window.electronAPI) {
    window.electronAPI.send(channel, data)
  }
}

/**
 * 监听主进程消息
 * @param channel 频道名称
 * @param callback 回调函数
 */
export function onMainMessage(channel: string, callback: (data: any) => void): (() => void) | void {
  if (isElectron() && window.electronAPI) {
    window.electronAPI.on(channel, callback)
    // 返回清理函数
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeListener(channel)
      }
    }
  }
}

/**
 * 移除消息监听
 * @param channel 频道名称
 */
export function removeMainListener(channel: string): void {
  if (isElectron() && window.electronAPI) {
    window.electronAPI.removeListener(channel)
  }
}

// TypeScript 类型声明
declare global {
  interface Window {
    electronAPI?: {
      send: (channel: string, data?: any) => void
      on: (channel: string, callback: (data: any) => void) => void
      removeListener: (channel: string) => void
    }
    process?: {
      type: string
    }
  }
}

