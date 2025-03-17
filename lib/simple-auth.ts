import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// 簡單的認證令牌，不使用 crypto
const ADMIN_TOKEN = "admin-token-123456"

// 簡單的用戶數據
const ADMIN_USER = {
  id: "admin-id",
  name: "System Admin",
  email: "admin@example.com",
  role: "admin",
}

// 設置認證 cookie
export function setAuthCookie(username: string, password: string) {
  // 簡單的認證邏輯，不使用加密
  if (username === "admin" && password === "admin") {
    const cookieStore = cookies()
    cookieStore.set("admin-auth", ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })
    return true
  }
  return false
}

// 檢查用戶是否已認證
export function checkAuth() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("admin-auth")

  if (!authCookie || authCookie.value !== ADMIN_TOKEN) {
    return null
  }

  return ADMIN_USER
}

// 清除認證 cookie
export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("admin-auth")
}

// 保護路由的輔助函數
export function protectRoute(redirectTo = "/simple-login") {
  const user = checkAuth()
  if (!user) {
    redirect(redirectTo)
  }
  return user
}

