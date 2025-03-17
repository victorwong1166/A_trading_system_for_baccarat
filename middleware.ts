import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // 檢查是否訪問管理頁面
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")

  // 如果訪問管理頁面但未登入，重定向到登入頁面
  if (isAdminPage && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 如果訪問管理頁面但不是管理員，重定向到登入頁面
  if (isAdminPage && token?.role !== "admin" && process.env.NODE_ENV === "production") {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

