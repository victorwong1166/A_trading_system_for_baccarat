import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化貨幣
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// 格式化日期
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// 格式化日期時間
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleString("zh-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// 生成唯一ID
export function generateId(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`
}

// 截斷文本
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// 獲取交易類型顯示名稱
export function getTransactionTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    deposit: "存款",
    withdrawal: "取款",
    transfer: "轉賬",
    bet: "下注",
    win: "贏錢",
    loss: "輸錢",
    commission: "佣金",
    adjustment: "調整",
    credit: "信用",
    repayment: "還款",
  }

  return typeMap[type] || type
}

// 獲取交易狀態顯示名稱
export function getTransactionStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "待處理",
    completed: "已完成",
    failed: "失敗",
    cancelled: "已取消",
  }

  return statusMap[status] || status
}

// 獲取會員類型顯示名稱
export function getMemberTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    regular: "普通會員",
    vip: "VIP會員",
    agent: "代理",
    shareholder: "股東",
  }

  return typeMap[type] || type
}

// 獲取用戶角色顯示名稱
export function getUserRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "管理員",
    operator: "操作員",
    viewer: "只讀用戶",
  }

  return roleMap[role] || role
}

