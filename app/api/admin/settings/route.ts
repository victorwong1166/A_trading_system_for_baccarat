import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { settings } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const allSettings = await db.query.settings.findMany()

    // 將設置轉換為鍵值對格式
    const settingsMap = allSettings.reduce(
      (acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          description: setting.description,
          category: setting.category,
        }
        return acc
      },
      {} as Record<string, { value: string; description: string | null; category: string | null }>,
    )

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    // 驗證數據格式
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const results = []

    // 更新每個設置
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "string") {
        continue
      }

      // 檢查設置是否存在
      const existingSetting = await db.query.settings.findFirst({
        where: eq(settings.key, key),
      })

      if (existingSetting) {
        // 更新現有設置
        const updated = await db
          .update(settings)
          .set({ value, updated_at: new Date(), updated_by: session.user.id })
          .where(eq(settings.key, key))
          .returning()

        results.push(updated[0])
      } else {
        // 創建新設置
        const created = await db
          .insert(settings)
          .values({
            key,
            value,
            created_at: new Date(),
            created_by: session.user.id,
          })
          .returning()

        results.push(created[0])
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

