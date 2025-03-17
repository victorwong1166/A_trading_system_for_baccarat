import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否是管理員路徑
  if (pathname.startsWith("/admin")) {
    // 檢查管理員 cookie
    const adminCookie = request.cookies.get("admin_session")

    // 如果是登錄頁面，則允許訪問
    if (pathname === "/admin/login") {
      // 如果已經有 cookie，重定向到管理員首頁
      if (adminCookie) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.next()
    }

    // 對於其他管理員頁面，如果沒有 cookie，重定向到登錄頁面
    if (!adminCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // 驗證 cookie 是否有效
    try {
      const session = JSON.parse(adminCookie.value)
      const now = Date.now()
      const loggedInAt = session.loggedInAt || 0

      // 如果 session 超過 24 小時，則視為無效
      if (now - loggedInAt > 24 * 60 * 60 * 1000) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete("admin_session")
        return response
      }
    } catch (error) {
      // 如果解析失敗，重定向到登錄頁面
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("admin_session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

