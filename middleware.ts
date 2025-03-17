import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 獲取當前路徑
  const path = request.nextUrl.pathname

  // 檢查用戶角色和登入狀態
  const userRole = getUserRole(request)
  const isLoggedIn = userRole !== null

  // 後台路徑檢查
  if (path.startsWith("/admin") && path !== "/admin/login") {
    // 只有管理員可以訪問後台頁面
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // 前台路徑檢查
  if (
    (path.startsWith("/dashboard") ||
      path.startsWith("/members") ||
      path.startsWith("/transactions") ||
      path.startsWith("/settings") ||
      path.startsWith("/dividends")) &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// 配置中間件匹配的路徑
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/members/:path*",
    "/transactions/:path*",
    "/settings/:path*",
    "/dividends/:path*",
  ],
}

// 獲取用戶角色（模擬函數）
function getUserRole(request: NextRequest): string | null {
  // 在實際應用中，這應該檢查 session/cookie 中的用戶角色
  const cookies = request.cookies

  if (cookies.has("admin_session")) {
    return "admin"
  } else if (cookies.has("user_session")) {
    return "user"
  }

  return null
}

