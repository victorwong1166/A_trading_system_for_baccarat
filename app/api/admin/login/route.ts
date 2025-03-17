import { type NextRequest, NextResponse } from "next/server"
import { loginAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "用戶名和密碼是必需的" }, { status: 400 })
    }

    const success = await loginAdmin(username, password)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "無效的憑據" }, { status: 401 })
    }
  } catch (error) {
    console.error("登錄錯誤:", error)
    return NextResponse.json({ message: "服務器錯誤" }, { status: 500 })
  }
}

