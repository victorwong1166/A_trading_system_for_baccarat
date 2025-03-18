import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { members } from "@/lib/db/schema"
import { getServerSession } from "next-auth/next"
import { authOptions, canManageUsers } from "@/lib/auth"
import { eq } from "drizzle-orm"

// 獲取單個會員
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // 查詢會員
    const member = await db.query.members.findFirst({
      where: (members, { eq, and }) => and(eq(members.id, id), eq(members.isDeleted, false)),
      with: {
        parent: true,
        transactions: {
          limit: 10,
          orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

// 更新會員
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const id = params.id
    const body = await req.json()
    const { name, phone, type, creditLimit, parentId, notes } = body

    // 檢查會員是否存在
    const existingMember = await db.query.members.findFirst({
      where: (members, { eq }) => eq(members.id, id),
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // 更新會員
    const updatedMember = await db
      .update(members)
      .set({
        name: name || existingMember.name,
        phone,
        type: type || existingMember.type,
        creditLimit: creditLimit !== undefined ? creditLimit : existingMember.creditLimit,
        parentId,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    return NextResponse.json(updatedMember[0])
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

// 刪除會員（軟刪除）
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const id = params.id

    // 檢查會員是否存在
    const existingMember = await db.query.members.findFirst({
      where: (members, { eq }) => eq(members.id, id),
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // 軟刪除會員
    await db
      .update(members)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}

