import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // 簡單的測試查詢
    const result = await sql`SELECT NOW() as time`

    // 檢查環境變數
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    }

    return NextResponse.json({
      success: true,
      message: "數據庫連接成功",
      time: result[0]?.time,
      envVars,
    })
  } catch (error) {
    console.error("數據庫測試錯誤:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

