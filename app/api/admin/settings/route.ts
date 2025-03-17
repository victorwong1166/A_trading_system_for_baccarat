import { NextResponse } from "next/server"
import { getSystemSettings, updateSystemSetting } from "@/lib/admin-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const settings = await getSystemSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return NextResponse.json({ error: "Failed to fetch system settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedSetting = await updateSystemSetting(key, value)
    return NextResponse.json(updatedSetting)
  } catch (error) {
    console.error("Error updating system setting:", error)
    return NextResponse.json({ error: "Failed to update system setting" }, { status: 500 })
  }
}

