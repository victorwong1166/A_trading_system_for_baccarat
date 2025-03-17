import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 過濾掉敏感信息
    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const data = await request.json()

    // 檢查用戶是否存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 更新用戶
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.role !== undefined) updateData.role = data.role
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    if (data.password) updateData.password = data.password // 實際應用中應該加密

    // 如果沒有要更新的數據
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 })
    }

    const updatedUser = await db.update(users).set(updateData).where(eq(users.id, userId)).returning()

    // 過濾掉敏感信息
    const safeUser = {
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      name: updatedUser[0].name,
      role: updatedUser[0].role,
      is_active: updatedUser[0].is_active,
      created_at: updatedUser[0].created_at,
      last_login: updatedUser[0].last_login,
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id

    // 檢查用戶是否存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 防止刪除自己
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // 刪除用戶
    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

