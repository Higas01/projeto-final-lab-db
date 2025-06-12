import { ref } from 'vue'

export interface ToastOptions {
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface Toast extends ToastOptions {
  id: number
}

let toastId = 0

export function useToast() {
  const toasts = ref<Toast[]>([])
  
  function addToast(options: ToastOptions) {
    const id = toastId++
    
    // Create new toast
    const toast: Toast = {
      id,
      ...options,
      duration: options.duration || 5000
    }
    
    // Add to toasts array
    toasts.value.push(toast)
    
    // Remove after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, options.duration || 5000)
    }
    
    return id
  }
  
  function removeToast(id: number) {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }
  
  return {
    toasts,
    addToast,
    removeToast
  }
}