import { NextResponse } from "next/server"
import { logoutAdmin } from "@/lib/admin-auth"

export async function POST() {
  try {
    await logoutAdmin()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("登出錯誤:", error)
    return NextResponse.json({ message: "服務器錯誤" }, { status: 500 })
  }
}

