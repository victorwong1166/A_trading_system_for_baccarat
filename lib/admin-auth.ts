// 簡單的基於 cookie 的認證系統，不依賴 crypto
import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_session"
const ADMIN_USERNAME = "admin"
// 注意：在生產環境中，應該使用環境變量存儲這些值
const ADMIN_PASSWORD = "admin123" // 請更改為強密碼並使用環境變量

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  // 簡單的用戶名和密碼驗證
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // 設置一個簡單的 cookie，包含登錄時間戳
    const sessionValue = JSON.stringify({
      username,
      loggedInAt: Date.now(),
    })

    cookies().set({
      name: ADMIN_COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return true
  }

  return false
}

export async function logoutAdmin() {
  cookies().delete(ADMIN_COOKIE_NAME)
}

export async function getAdminSession() {
  const sessionCookie = cookies().get(ADMIN_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    // 檢查 session 是否有效（例如，是否過期）
    const now = Date.now()
    const loggedInAt = session.loggedInAt || 0

    // 如果 session 超過 24 小時，則視為無效
    if (now - loggedInAt > 24 * 60 * 60 * 1000) {
      cookies().delete(ADMIN_COOKIE_NAME)
      return null
    }

    return session
  } catch (error) {
    // 如果解析失敗，刪除 cookie
    cookies().delete(ADMIN_COOKIE_NAME)
    return null
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

