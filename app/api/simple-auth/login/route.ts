import { type NextRequest, NextResponse } from "next/server"
import { setAuthCookie } from "@/lib/simple-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "用戶名和密碼是必需的" }, { status: 400 })
    }

    const success = setAuthCookie(username, password)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "登入成功",
        user: {
          name: "System Admin",
          role: "admin",
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "用戶名或密碼不正確" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "登入過程中發生錯誤" }, { status: 500 })
  }
}

