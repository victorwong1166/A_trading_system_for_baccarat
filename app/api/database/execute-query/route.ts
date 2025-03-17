import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db-connect"

export async function POST(request: Request) {
  try {
    const { query, params } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 })
    }

    // 簡單的安全檢查 - 禁止危險操作
    const lowerQuery = query.toLowerCase()
    if (
      lowerQuery.includes("drop database") ||
      lowerQuery.includes("drop schema") ||
      lowerQuery.includes("truncate database")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Dangerous operations are not allowed",
        },
        { status: 403 },
      )
    }

    const result = await executeQuery(query, params || [])

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("執行SQL查詢錯誤:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

