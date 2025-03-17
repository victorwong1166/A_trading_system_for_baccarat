import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { system_logs } from "@/lib/schema"
import { sql } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")
    const level = searchParams.get("level")

    // 構建查詢
    let query = db.select().from(system_logs)

    // 添加過濾條件
    if (search) {
      query = query.where(sql`message LIKE ${`%${search}%`}`)
    }

    if (level) {
      query = query.where(sql`level = ${level}`)
    }

    // 添加排序和分頁
    const logs = await query.orderBy(sql`created_at DESC`).limit(limit).offset(offset)

    // 獲取總數
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(system_logs)

    const total = countResult[0].count

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    // 驗證必要字段
    if (!data.message || !data.level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 創建日誌
    const newLog = await db
      .insert(system_logs)
      .values({
        message: data.message,
        level: data.level,
        details: data.details || null,
        created_at: new Date(),
        created_by: session.user.id,
      })
      .returning()

    return NextResponse.json(newLog[0])
  } catch (error) {
    console.error("Error creating log:", error)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }
}

