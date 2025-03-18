"use client"

import { useState, useCallback } from "react"

type ToastVariant = "default" | "destructive" | "success"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
}

interface Toast extends ToastProps {
  id: string
}

// 創建一個上下文外的 toast 函數和狀態管理
let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]))
}

// 直接導出 toast 函數
export function toast({ title, description, variant = "default" }: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { id, title, description, variant }

  toasts = [...toasts, newToast]
  notifyListeners()

  // 自動在 3 秒後移除
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 3000)

  return id
}

// 導出 dismiss 函數
export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notifyListeners()
}

// 導出 useToast hook
export function useToast() {
  const [localToasts, setLocalToasts] = useState<Toast[]>(toasts)

  useCallback(() => {
    const listener = (updatedToasts: Toast[]) => {
      setLocalToasts(updatedToasts)
    }

    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts: localToasts,
  }
}

