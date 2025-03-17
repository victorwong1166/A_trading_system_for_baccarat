import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // 檢查環境變量是否存在
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!dbUrl) {
      return NextResponse.json({
        connected: false,
        missingEnvVars: true,
        timestamp: new Date().toISOString(),
      })
    }

    // 測試數據庫連接
    const result = await db.execute(sql`SELECT 1 as test`)

    // 如果沒有拋出錯誤，則連接成功
    return NextResponse.json({
      connected: true,
      timestamp: new Date().toISOString(),
      // 隱藏敏感信息，只顯示連接字符串的一部分
      connectionString: dbUrl.replace(/^(.*?:\/\/[^:]+):[^@]+@(.*)$/, "$1:***@$2").substring(0, 50) + "...",
    })
  } catch (error) {
    console.error("Database connection test failed:", error)

    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}

