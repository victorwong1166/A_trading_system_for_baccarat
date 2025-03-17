import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db-connect"

export async function GET() {
  try {
    const result = await testConnection()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("數據庫連接測試錯誤:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

