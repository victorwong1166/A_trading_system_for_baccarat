import { NextResponse } from "next/server"
import { getSystemUsers, createSystemUser } from "@/lib/admin-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const users = await getSystemUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching system users:", error)
    return NextResponse.json({ error: "Failed to fetch system users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const userData = await request.json()

    // 基本驗證
    if (!userData.username || !userData.password || !userData.name || !userData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newUser = await createSystemUser(userData)
    return NextResponse.json(newUser)
  } catch (error) {
    console.error("Error creating system user:", error)
    return NextResponse.json({ error: "Failed to create system user" }, { status: 500 })
  }
}

