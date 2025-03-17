import { NextResponse } from "next/server"
import { updateSystemUser } from "@/lib/admin-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const userData = await request.json()
    const updatedUser = await updateSystemUser(params.id, userData)

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating system user:", error)
    return NextResponse.json({ error: "Failed to update system user" }, { status: 500 })
  }
}

