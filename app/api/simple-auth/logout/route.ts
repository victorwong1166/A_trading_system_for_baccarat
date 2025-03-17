import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/simple-auth"

export async function POST() {
  try {
    clearAuthCookie()
    return NextResponse.json({ success: true, message: "登出成功" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "登出過程中發生錯誤" }, { status: 500 })
  }
}

