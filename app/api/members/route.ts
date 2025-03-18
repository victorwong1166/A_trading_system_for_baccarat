import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { members } from "@/lib/db/schema"
import { getServerSession } from "next-auth/next"
import { authOptions, canManageUsers } from "@/lib/auth"
import { generateId } from "@/lib/utils"
import { eq, like, desc, or, not } from "drizzle-orm"

// 獲取會員列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = db
      .select()
      .from(members)
      .where(not(eq(members.isDeleted, true)))

    // 搜索條件
    if (search) {
      query = query.where(
        or(
          like(members.memberId, `%${search}%`),
          like(members.name, `%${search}%`),
          like(members.phone, `%${search}%`),
        ),
      )
    }

    // 會員類型過濾
    if (type) {
      query = query.where(eq(members.type, type))
    }

    // 排序和分頁
    const totalCount = await db
      .select({ count: db.fn.count() })
      .from(members)
      .where(not(eq(members.isDeleted, true)))

    const membersList = await query.orderBy(desc(members.createdAt)).limit(limit).offset(offset)

    return NextResponse.json({
      members: membersList,
      total: totalCount[0].count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

// 創建新會員
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const { memberId, name, phone, type, creditLimit, parentId, notes } = body

    // 驗證必填字段
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // 檢查會員ID是否已存在
    if (memberId) {
      const existingMember = await db.query.members.findFirst({
        where: (members, { eq }) => eq(members.memberId, memberId),
      })

      if (existingMember) {
        return NextResponse.json({ error: "Member ID already exists" }, { status: 400 })
      }
    }

    // 生成會員ID（如果未提供）
    const settings = await db.query.settings.findFirst({
      where: (settings, { eq }) => eq(settings.key, "member_id_prefix"),
    })

    const prefix = settings?.value || "M"
    const generatedMemberId = memberId || `${prefix}${generateId(4)}`

    // 創建新會員
    const newMember = await db
      .insert(members)
      .values({
        memberId: generatedMemberId,
        name,
        phone,
        type: type || "regular",
        creditLimit: creditLimit || 0,
        parentId,
        notes,
        createdBy: session.user.id,
      })
      .returning()

    return NextResponse.json(newMember[0], { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}

