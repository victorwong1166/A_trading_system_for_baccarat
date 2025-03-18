import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { initializeDatabase, seedSampleData } from "@/lib/db/migrations"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action") || "test"
    const force = searchParams.get("force") === "true"

    if (action === "test") {
      // 測試數據庫連接
      const result = await db.execute("SELECT current_timestamp as time, current_database() as database")
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        data: result[0],
      })
    } else if (action === "init") {
      // 初始化數據庫
      const result = await initializeDatabase(force)
      return NextResponse.json(result)
    } else if (action === "seed") {
      // 填充示例數據
      const result = await seedSampleData()
      return NextResponse.json(result)
    } else if (action === "tables") {
      // 獲取表結構
      const tables = await db.execute(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`)
      return NextResponse.json({
        success: true,
        tables: tables.map((t) => t.table_name),
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ error: `Database test failed: ${error.message}` }, { status: 500 })
  }
}

