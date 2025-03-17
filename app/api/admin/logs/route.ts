import { NextResponse } from "next/server"
import { getSystemLogs } from "@/lib/admin-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const logs = await getSystemLogs()
    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json({ error: "Failed to fetch system logs" }, { status: 500 })
  }
}

