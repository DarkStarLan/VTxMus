import { createApp, h } from 'vue'
import Toast from '@/components/Toast.vue'

export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

let toastInstance: any = null

export function showToast(options: ToastOptions | string) {
  // 如果已有 toast，先移除
  if (toastInstance) {
    toastInstance.unmount()
    toastInstance = null
  }

  const opts = typeof options === 'string' ? { message: options } : options

  // 创建容器
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建 Vue 实例
  toastInstance = createApp({
    render() {
      return h(Toast, {
        ...opts,
        onVnodeMounted: () => {
          // Toast 显示后，设置自动移除
          setTimeout(() => {
            if (toastInstance) {
              toastInstance.unmount()
              document.body.removeChild(container)
              toastInstance = null
            }
          }, (opts.duration || 3000) + 500) // 加上动画时间
        }
      })
    }
  })

  toastInstance.mount(container)
}

// 便捷方法
export const toast = {
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration })
}
