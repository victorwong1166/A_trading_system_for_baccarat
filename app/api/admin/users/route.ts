import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 檢查用戶是否有管理員權限
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.created_at)],
    })

    // 過濾掉敏感信息
    const safeUsers = allUsers.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
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
    if (!data.username || !data.password || !data.name || !data.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 檢查用戶名是否已存在
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, data.username),
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // 創建新用戶
    const newUser = await db
      .insert(users)
      .values({
        username: data.username,
        password: data.password, // 實際應用中應該加密
        name: data.name,
        role: data.role,
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: new Date(),
        created_by: session.user.id,
      })
      .returning()

    return NextResponse.json(newUser[0])
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

