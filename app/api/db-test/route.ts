import { NextResponse } from "next/server"
import postgres from "postgres"

export async function GET() {
  try {
    // 獲取數據庫連接字符串
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    // 檢查連接字符串是否存在
    if (!connectionString) {
      return NextResponse.json(
        {
          success: false,
          message: "No database connection string found in environment variables",
          availableEnvVars: Object.keys(process.env).filter(
            (key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("SQL"),
          ),
        },
        { status: 500 },
      )
    }

    // 創建數據庫連接
    const sql = postgres(connectionString)

    // 執行簡單查詢
    const result = await sql`SELECT NOW()`

    // 關閉連接
    await sql.end()

    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: result[0]?.now,
      connectionString: connectionString.substring(0, connectionString.indexOf("://") + 3) + "...", // 只顯示連接字符串的開頭部分，隱藏敏感信息
    })
  } catch (error) {
    // 返回錯誤響應
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

