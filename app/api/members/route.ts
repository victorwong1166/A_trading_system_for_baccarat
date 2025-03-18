import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { members } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    // 獲取所有未刪除的會員
    const allMembers = await db.select().from(members).where(eq(members.deleted, false))

    return NextResponse.json(allMembers)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ message: "獲取會員列表失敗" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "會員姓名為必填項" }, { status: 400 })
    }

    // 生成唯一會員ID (M + 時間戳的後6位)
    const timestamp = Date.now().toString()
    const memberId = `M${timestamp.slice(-6)}`

    // 插入新會員
    const result = await db.insert(members).values({
      id: memberId,
      name: name.trim(),
      balance: 0,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("Member created successfully:", result)

    return NextResponse.json({ message: "會員創建成功", memberId }, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ message: "創建會員失敗，請稍後再試" }, { status: 500 })
  }
}

